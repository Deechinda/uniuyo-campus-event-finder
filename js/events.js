// ============================================================
// events.js – Central configuration and sample event data
// UNIUYO Campus Event Finder
// ============================================================

// ------------------------------------------------------------------
// 1. CENTRAL CONFIGURATION
// ------------------------------------------------------------------
const CONFIG = {
  siteName: "UNIUYO Campus Event Finder",
  university: "University of Uyo",
  campuses: ["Permanent Site", "Town Campus", "Annex"],
  categories: [
    "Academic",
    "Workshop",
    "Social",
    "Sports",
    "Student Activities",
    "Career Development",
    "Arts & Culture",
    "Entrepreneurship",
  ],
  // Interest labels used by Smart Event Match
  interests: [
    { id: "technology", label: "Technology", keywords: ["technology", "digital", "tech", "innovation", "software", "computer"] },
    { id: "academic", label: "Academic Activities", keywords: ["academic", "research", "seminar", "lecture", "project", "exhibition", "science"] },
    { id: "career", label: "Career Development", keywords: ["career", "job", "professional", "internship", "cv", "resume", "industry"] },
    { id: "sports", label: "Sports", keywords: ["sports", "competition", "athletics", "football", "game", "fitness", "tournament"] },
    { id: "social", label: "Social Activities", keywords: ["social", "cultural", "celebration", "festival", "party", "meet", "community"] },
    { id: "entrepreneurship", label: "Entrepreneurship", keywords: ["entrepreneur", "business", "startup", "enterprise", "innovation", "pitch"] },
    { id: "arts", label: "Arts & Culture", keywords: ["art", "culture", "creative", "music", "drama", "showcase", "performance", "dance"] },
  ],
  storageKeys: {
    submittedEvents: "uniuyo_submitted_events",
    savedEvents: "uniuyo_saved_events",
    registrations: "uniuyo_registrations",
    userInterests: "uniuyo_user_interests",
    reminders: "uniuyo_reminders",
  },
};

// ------------------------------------------------------------------
// 2. SAMPLE EVENTS (fictional demonstration data)
//    NOTE: These events are fictional. They are not official
//    University of Uyo announcements.
// ------------------------------------------------------------------
const SAMPLE_EVENTS = [
  {
    id: "evt-001",
    title: "Technology & Innovation Workshop",
    category: "Workshop",
    date: getRelativeDate(3),   // 3 days from now
    time: "10:00",
    venue: "ICT Centre, Block A",
    campus: "Permanent Site",
    shortDescription: "An intensive hands-on workshop exploring emerging technologies and innovative solutions for modern challenges.",
    fullDescription: "Join us for a full-day Technology & Innovation Workshop where participants will explore emerging technologies including artificial intelligence concepts, web development fundamentals, and mobile app prototyping. The workshop features live demonstrations, group activities, and a mini-hackathon. Open to all students regardless of department. Facilitators are drawn from the Faculty of Engineering and the Computer Science Department.",
    tags: ["technology", "innovation", "digital", "workshop"],
    source: "sample",
  },
  {
    id: "evt-002",
    title: "Academic Research Seminar",
    category: "Academic",
    date: getRelativeDate(7),
    time: "09:00",
    venue: "Senate Building, Hall 1",
    campus: "Permanent Site",
    shortDescription: "A departmental research seminar showcasing final-year student and postgraduate research findings.",
    fullDescription: "The Academic Research Seminar brings together final-year undergraduates and postgraduate students to present their research findings to peers, faculty, and invited guests. Topics span Engineering, Natural Sciences, Social Sciences, and Humanities. Attendees will gain insights into current academic research and have the opportunity to ask questions. Certificates of participation will be issued. Best presentation awards will be announced at the end of the event.",
    tags: ["academic", "research", "seminar", "science", "lecture"],
    source: "sample",
  },
  {
    id: "evt-003",
    title: "Career Development Session",
    category: "Career Development",
    date: getRelativeDate(10),
    time: "11:00",
    venue: "Faculty of Management Sciences Auditorium",
    campus: "Town Campus",
    shortDescription: "A practical career readiness session covering CV writing, job applications, and professional interviews.",
    fullDescription: "This Career Development Session is designed to equip students with practical skills needed to enter the competitive job market. Facilitators will cover CV and cover letter writing, LinkedIn profile optimization, interview techniques, and how to search for internship opportunities. Representatives from selected graduate employers will also attend to provide insider perspectives. All students, especially final-year students, are strongly encouraged to attend. Bring copies of your current CV for a live review exercise.",
    tags: ["career", "job", "professional", "cv", "internship", "industry"],
    source: "sample",
  },
  {
    id: "evt-004",
    title: "Inter-Campus Sports Competition",
    category: "Sports",
    date: getRelativeDate(14),
    time: "08:00",
    venue: "Sports Complex",
    campus: "Permanent Site",
    shortDescription: "Annual inter-campus sports event featuring football, basketball, athletics, and table tennis competitions.",
    fullDescription: "The Annual Inter-Campus Sports Competition brings together student athletes from Permanent Site, Town Campus, and Annex to compete in a variety of sporting events. This year's competitions include football, basketball, relay athletics, and table tennis. Spectators are welcome and encouraged. The competition promotes physical fitness, campus unity, and sportsmanship. Trophies and medals will be awarded to winners in each category. Students wishing to compete must register with their campus Sports Director by the stated deadline.",
    tags: ["sports", "competition", "athletics", "football", "game", "fitness", "tournament"],
    source: "sample",
  },
  {
    id: "evt-005",
    title: "Cultural Day Celebration",
    category: "Social",
    date: getRelativeDate(5),
    time: "12:00",
    venue: "Student Union Building, Town Campus",
    campus: "Town Campus",
    shortDescription: "A vibrant celebration of Nigerian cultural heritage featuring food, music, traditional attire, and performances.",
    fullDescription: "Cultural Day Celebration is an annual event that showcases the rich and diverse cultural heritage of Nigeria. Students from different states and ethnic backgrounds are invited to display their cultural attire, food, music, and performances. Events include a cultural parade, traditional dance performances, food fair, and a cultural quiz. The event promotes inclusivity, cultural awareness, and national unity among students. All students, staff, and guests are welcome. Traditional attire is encouraged.",
    tags: ["social", "cultural", "celebration", "festival", "community", "arts", "culture", "dance", "music"],
    source: "sample",
  },
  {
    id: "evt-006",
    title: "Digital Skills Workshop",
    category: "Workshop",
    date: getRelativeDate(2),
    time: "13:00",
    venue: "Computer Laboratory 3, Annex",
    campus: "Annex",
    shortDescription: "A beginner-friendly workshop on essential digital skills including spreadsheets, email etiquette, and online research.",
    fullDescription: "The Digital Skills Workshop is tailored for students who want to improve their digital literacy for academic and professional purposes. Sessions will cover Microsoft Office applications (Word, Excel, PowerPoint), effective email writing, safe internet use, online library research, and cloud storage basics. No prior technical experience is required. Participants will receive a certificate of attendance upon completion. The workshop runs in two sessions: morning and afternoon. Please indicate your preferred session during registration.",
    tags: ["technology", "digital", "software", "computer", "workshop"],
    source: "sample",
  },
  {
    id: "evt-007",
    title: "Entrepreneurship Seminar",
    category: "Entrepreneurship",
    date: getRelativeDate(18),
    time: "10:00",
    venue: "Business School Lecture Hall, Town Campus",
    campus: "Town Campus",
    shortDescription: "An inspiring seminar on startup creation, business planning, and accessing funding for young entrepreneurs.",
    fullDescription: "The Entrepreneurship Seminar is hosted by the UNIUYO Business Incubation Centre and invites successful young entrepreneurs and business mentors to share their experiences. Topics include idea validation, writing a business plan, registering a business in Nigeria, and sources of startup funding including grants and angel investors. There will be a live pitch session where selected students will present their business ideas to a panel of judges. Prizes will be awarded to the top three pitches.",
    tags: ["entrepreneur", "business", "startup", "enterprise", "innovation", "pitch"],
    source: "sample",
  },
  {
    id: "evt-008",
    title: "Student Leadership Workshop",
    category: "Student Activities",
    date: getRelativeDate(21),
    time: "09:30",
    venue: "SUG Secretariat, Permanent Site",
    campus: "Permanent Site",
    shortDescription: "A leadership development workshop for student union officers and aspiring campus leaders.",
    fullDescription: "The Student Leadership Workshop is organized by the Student Union Government in partnership with the Office of Student Affairs. The workshop is designed to develop leadership, communication, conflict resolution, and event management skills among student leaders. Topics include effective governance, financial accountability, organizing student events, and negotiating with university management. The workshop is open to all current and aspiring student union and faculty association officers. Participants will receive leadership certificates at the end of the programme.",
    tags: ["social", "community", "student", "leadership", "meet"],
    source: "sample",
  },
  {
    id: "evt-009",
    title: "Creative Arts Showcase",
    category: "Arts & Culture",
    date: getRelativeDate(9),
    time: "15:00",
    venue: "Arts Gallery, Annex",
    campus: "Annex",
    shortDescription: "An exhibition of student artwork, photography, sculpture, and creative writing from the Faculty of Arts.",
    fullDescription: "The Creative Arts Showcase is an open exhibition hosted by the Faculty of Arts and the Creative Arts Students Association. Students from Fine Arts, Theatre Arts, Creative Writing, and Music departments will display their original works. The exhibition is open to all students, staff, and members of the public. A panel of judges will select outstanding works for a People's Choice award voted on the day. Live musical and dramatic performances will take place throughout the afternoon.",
    tags: ["art", "culture", "creative", "music", "drama", "showcase", "performance", "dance"],
    source: "sample",
  },
  {
    id: "evt-010",
    title: "Academic Project Exhibition",
    category: "Academic",
    date: getRelativeDate(25),
    time: "10:00",
    venue: "Engineering Faculty Foyer",
    campus: "Permanent Site",
    shortDescription: "Final-year engineering and science students exhibit completed projects and demonstrate prototypes.",
    fullDescription: "The Academic Project Exhibition provides final-year students in Engineering, Computer Science, Physics, and related departments an opportunity to exhibit their completed projects and functional prototypes to the broader university community. Visitors can interact directly with the projects and speak to the students who built them. Industry representatives have been invited to attend and scout for talent. Outstanding projects will be nominated for departmental awards. All are welcome to attend this free event.",
    tags: ["academic", "research", "science", "project", "exhibition", "engineering"],
    source: "sample",
  },
  {
    id: "evt-011",
    title: "Campus Health & Wellness Fair",
    category: "Social",
    date: getRelativeDate(12),
    time: "09:00",
    venue: "University Health Centre Grounds",
    campus: "Town Campus",
    shortDescription: "A health awareness fair offering free screenings, fitness demonstrations, and mental health talks.",
    fullDescription: "The Campus Health & Wellness Fair is organized by the University Health Centre with support from the Medical Students' Association and the Department of Human Kinetics. The fair offers free blood pressure checks, BMI assessments, malaria screening, and eye tests. There will be talks on mental health, stress management, and healthy eating on a student budget. Local health NGOs will also be present with information on sexual and reproductive health. Refreshments will be provided. Students are encouraged to come in comfortable clothing for fitness demonstrations.",
    tags: ["social", "community", "meet", "fitness"],
    source: "sample",
  },
  {
    id: "evt-012",
    title: "Industry Professionals Networking Evening",
    category: "Career Development",
    date: getRelativeDate(30),
    time: "17:00",
    venue: "Faculty of Law Multipurpose Hall, Annex",
    campus: "Annex",
    shortDescription: "An evening networking event connecting final-year students with industry professionals across multiple sectors.",
    fullDescription: "The Industry Professionals Networking Evening gives penultimate and final-year students direct access to professionals working in law, finance, engineering, technology, and creative industries. Registered students will have the opportunity to introduce themselves, exchange contact details, and discuss internship and graduate employment opportunities. Smart casual attire is required. Bring printed copies of your CV. Light refreshments will be served. This event is organized by the Careers and Employability Office.",
    tags: ["career", "job", "professional", "internship", "industry", "network"],
    source: "sample",
  },
];

// ------------------------------------------------------------------
// 3. UTILITY – Date helpers
// ------------------------------------------------------------------

/**
 * Returns a date string (YYYY-MM-DD) that is `n` days from today.
 * Negative values return past dates. Used only for sample data setup.
 */
function getRelativeDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

/**
 * Formats a YYYY-MM-DD date string into a human-readable string
 * e.g. "Thursday, 10 October 2026"
 */
function formatDate(dateStr) {
  if (!dateStr) return "TBA";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const d = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a HH:MM time string into a readable 12-hour format.
 */
function formatTime(timeStr) {
  if (!timeStr) return "TBA";
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Calculates a human-readable countdown string from a YYYY-MM-DD date.
 * Returns null for invalid or empty dates.
 */
function getCountdown(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  // Compare calendar dates (not timestamps) to avoid timezone issues
  const today = new Date();
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventDate = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );
  if (isNaN(eventDate.getTime())) return null;

  const diffMs = eventDate - todayNorm;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Event has passed", type: "past", days: diffDays };
  if (diffDays === 0) return { text: "Starts today!", type: "today", days: 0 };
  if (diffDays === 1) return { text: "Starts tomorrow", type: "soon", days: 1 };
  if (diffDays <= 7) return { text: `Starts in ${diffDays} days`, type: "soon", days: diffDays };
  return { text: `Starts in ${diffDays} days`, type: "upcoming", days: diffDays };
}

/**
 * Returns true if a YYYY-MM-DD date string represents today or a future date.
 */
function isUpcoming(dateStr) {
  const countdown = getCountdown(dateStr);
  return countdown !== null && countdown.type !== "past";
}

/**
 * Checks if a date falls within the next `n` days (inclusive of today).
 */
function isWithinDays(dateStr, n) {
  const countdown = getCountdown(dateStr);
  if (!countdown) return false;
  return countdown.days >= 0 && countdown.days <= n;
}

/**
 * Generates a unique ID with a given prefix.
 */
function generateId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

// ------------------------------------------------------------------
// 4. COMBINED EVENT COLLECTION (sample + user-submitted)
// ------------------------------------------------------------------

/** Returns all events: sample events merged with stored submitted events. */
function getAllEvents() {
  const submitted = Storage.getSubmittedEvents();
  return [...SAMPLE_EVENTS, ...submitted];
}
