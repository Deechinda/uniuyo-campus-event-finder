const DataService = (() => {
  let remoteEvents = [];
  const client = () => SupabaseConfig.client;

  function mapEvent(row) {
    return {
      id: row.id, slug: row.slug, title: row.title, category: row.category,
      date: row.event_date, time: String(row.event_time).slice(0, 5), venue: row.venue,
      campus: row.campus, shortDescription: row.short_description,
      fullDescription: row.description, tags: row.tags || [], source: "community",
      organizerId: row.organizer_id, organizerName: row.organizer_name,
      price: Number(row.price || 0), capacity: row.capacity,
      coverUrl: row.cover_url || "", status: row.status,
    };
  }

  async function loadEvents() {
    if (!client()) return [];
    const { data, error } = await client().from("campus_events").select("*").eq("status", "published").order("event_date");
    if (error) throw error;
    remoteEvents = (data || []).map(mapEvent);
    return remoteEvents;
  }
  function cachedEvents() { return remoteEvents.slice(); }

  async function createEvent(input, user) {
    const base = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 64);
    const payload = {
      organizer_id: user.id,
      organizer_name: user.user_metadata?.full_name || user.email.split("@")[0],
      slug: `${base}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title, category: input.category, campus: input.campus,
      event_date: input.date, event_time: input.time, venue: input.venue,
      short_description: input.shortDescription, description: input.fullDescription,
      price: input.price, capacity: input.capacity, tags: [], status: "published",
    };
    const { data, error } = await client().from("campus_events").insert(payload).select().single();
    if (error) throw error;
    const event = mapEvent(data); remoteEvents.push(event); return event;
  }

  async function getProfile(userId) {
    const { data, error } = await client().from("event_profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data;
  }
  async function myEvents(userId) {
    const { data, error } = await client().from("campus_events").select("*, registrations(id,quantity,total_amount,payment_status)").eq("organizer_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async function issueFreeTicket(payload) {
    const { data, error } = await client().rpc("issue_free_event_ticket", {
      p_event_id: payload.eventId, p_name: payload.name, p_email: payload.email,
      p_phone: payload.phone, p_quantity: payload.quantity,
    });
    if (error) throw error;
    return data;
  }
  async function invokePayment(body) {
    const { data, error } = await client().functions.invoke("event-payments", { body });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || "The request could not be completed.");
    return data;
  }

  return { loadEvents, cachedEvents, createEvent, getProfile, myEvents, issueFreeTicket, invokePayment };
})();
