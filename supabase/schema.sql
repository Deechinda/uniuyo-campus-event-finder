-- Lightweight defence-project backend: auth profiles, events, registrations, payments and tickets.
create extension if not exists pgcrypto;

create table if not exists public.event_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  phone text not null default '',
  paystack_subaccount_code text unique,
  payout_bank_code text,
  payout_bank_name text,
  payout_account_name text,
  payout_account_last4 text,
  payout_verified boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.event_profiles(id,email,full_name)
select id,lower(email),coalesce(raw_user_meta_data->>'full_name','') from auth.users
on conflict(id) do nothing;

create table if not exists public.campus_events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references auth.users(id) on delete cascade,
  organizer_name text not null,
  slug text not null unique,
  title text not null check(char_length(title) between 3 and 120),
  category text not null,
  campus text not null check(campus in ('Permanent Site','Town Campus','Annex')),
  event_date date not null,
  event_time time not null,
  venue text not null,
  short_description text not null,
  description text not null,
  cover_url text not null default '',
  tags text[] not null default '{}',
  price numeric(12,2) not null default 0 check(price >= 0),
  capacity integer not null check(capacity > 0),
  status text not null default 'published' check(status in ('draft','published','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.campus_events(id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  quantity integer not null check(quantity between 1 and 10),
  total_amount numeric(12,2) not null check(total_amount >= 0),
  payment_status text not null default 'pending' check(payment_status in ('pending','paid','free','failed')),
  payment_reference text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations(id) on delete cascade,
  reference text not null unique,
  amount numeric(12,2) not null,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations(id) on delete cascade,
  event_id uuid not null references public.campus_events(id) on delete cascade,
  ticket_code text not null unique,
  issued_at timestamptz not null default now()
);

alter table public.event_profiles enable row level security;
alter table public.campus_events enable row level security;
alter table public.registrations enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;

create policy "profile owner reads" on public.event_profiles for select to authenticated using(auth.uid()=id);
create policy "profile owner updates" on public.event_profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
create policy "published events public" on public.campus_events for select using(status='published' or auth.uid()=organizer_id);
create policy "organizer creates event" on public.campus_events for insert to authenticated with check(auth.uid()=organizer_id);
create policy "organizer updates event" on public.campus_events for update to authenticated using(auth.uid()=organizer_id) with check(auth.uid()=organizer_id);
create policy "organizer sees registrations" on public.registrations for select to authenticated using(exists(select 1 from public.campus_events e where e.id=event_id and e.organizer_id=auth.uid()));

create or replace function public.new_event_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.event_profiles(id,email,full_name) values(new.id,lower(new.email),coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists event_user_created on auth.users;
create trigger event_user_created after insert on auth.users for each row execute procedure public.new_event_profile();

create or replace function public.issue_free_event_ticket(p_event_id uuid,p_name text,p_email text,p_phone text,p_quantity integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_event campus_events%rowtype; v_sold integer; v_reg registrations%rowtype; v_code text;
begin
  if trim(p_name)='' or position('@' in p_email)<2 or p_quantity not between 1 and 10 then raise exception 'Invalid registration details'; end if;
  select * into v_event from campus_events where id=p_event_id and status='published' for update;
  if not found or v_event.price<>0 then raise exception 'Free event not found'; end if;
  select coalesce(sum(quantity),0) into v_sold from registrations where event_id=p_event_id and payment_status in ('paid','free');
  if v_sold+p_quantity>v_event.capacity then raise exception 'Not enough tickets available'; end if;
  insert into registrations(event_id,guest_name,guest_email,guest_phone,quantity,total_amount,payment_status)
  values(p_event_id,trim(p_name),lower(trim(p_email)),trim(p_phone),p_quantity,0,'free') returning * into v_reg;
  v_code:='UYO-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
  insert into tickets(registration_id,event_id,ticket_code) values(v_reg.id,p_event_id,v_code);
  return jsonb_build_object('ticketCode',v_code,'eventTitle',v_event.title,'name',v_reg.guest_name,'quantity',v_reg.quantity,'amount',0);
end; $$;
grant execute on function public.issue_free_event_ticket(uuid,text,text,text,integer) to anon,authenticated;

create index if not exists events_status_date on public.campus_events(status,event_date);
create index if not exists events_organizer on public.campus_events(organizer_id,created_at desc);
create index if not exists registrations_event on public.registrations(event_id,payment_status);
