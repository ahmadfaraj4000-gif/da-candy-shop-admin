import { useEffect, useMemo, useState } from "react";
import { useAuthActions, useAuthToken, useConvexAuth } from "@convex-dev/auth/react";
import { AdminNav } from "../components/AdminNav";

const CONVEX_SITE_URL = (import.meta.env.VITE_CONVEX_SITE_URL || window.ANCHOR_CONVEX_SITE_URL || "").replace(/\/$/, "");

const emptyEvent = {
  category: "Fathers Day",
  title: "",
  dateLabel: "",
  timeLabel: "",
  location: "",
  imageUrl: "",
  imageStorageId: "",
  description: "",
  published: true
};

const emptyPodcast = {
  title: "",
  platform: "YouTube",
  embedUrl: "",
  youtubeEmbedUrl: "",
  spotifyEmbedUrl: "",
  appleMusicEmbedUrl: "",
  imageUrl: "",
  imageStorageId: "",
  description: "",
  published: true
};

const emptyCause = {
  title: "",
  goal: "",
  description: "",
  paymentUrl: "",
  published: true
};

const emptyResource = {
  name: "",
  organizationType: "",
  specialty: "",
  website: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  description: "",
  published: true
};

const adminTabs = [
  ["events", "Events"],
  ["podcasts", "Podcast Embeds"],
  ["donations", "Donation Causes"],
  ["resources", "Resources"],
  ["rsvps", "RSVPs"],
  ["gym", "Gym Partners"],
  ["members", "Members"]
];

function apiUrl(path) {
  if (!CONVEX_SITE_URL) throw new Error("Set VITE_CONVEX_SITE_URL for the admin portal.");
  return `${CONVEX_SITE_URL}${path}`;
}

async function apiGet(path, headers = {}) {
  const response = await fetch(apiUrl(path), { headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Convex request failed: ${response.status}`);
  return data;
}

async function apiPost(path, payload, headers = {}) {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Convex request failed: ${response.status}`);
  return data;
}

function dollarsToCents(value) {
  return Math.round(Number(value || 0) * 100);
}

function centsToDollars(value) {
  return value ? String(Math.round(value / 100)) : "";
}

const eventTimeOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, "0")}:00`;
  const displayHour = hour % 12 || 12;
  const period = hour < 12 ? "AM" : "PM";
  return { value, label: `${displayHour}:00 ${period}` };
});

function AdminSignIn() {
  const { signIn } = useAuthActions();
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      await signIn("password", formData);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    }
  }

  return (
    <form className="adminAuthForm" onSubmit={submit}>
      <h2>Admin Sign In</h2>
      <label>Email</label>
      <input name="email" type="email" required />
      <label>Password</label>
      <input name="password" type="password" required />
      <input name="flow" type="hidden" value="signIn" />
      <button className="btn green">Sign In</button>
      {error ? <p className="notice">{error}</p> : null}
    </form>
  );
}

export function Dashboard() {
  const token = useAuthToken();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState("events");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [causes, setCauses] = useState([]);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [gymProfiles, setGymProfiles] = useState([]);
  const [gymRequests, setGymRequests] = useState([]);
  const [safetyReports, setSafetyReports] = useState([]);
  const [userBlocks, setUserBlocks] = useState([]);
  const [media, setMedia] = useState([]);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [podcastForm, setPodcastForm] = useState(emptyPodcast);
  const [causeForm, setCauseForm] = useState(emptyCause);
  const [resourceForm, setResourceForm] = useState(emptyResource);
  const [status, setStatus] = useState("");
  const [rsvpEventFilter, setRsvpEventFilter] = useState("all");

  async function authHeaders() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function loadAdminData() {
    try {
      const data = await apiGet("/api/admin", await authHeaders());
      setEvents(data.events);
      setPodcasts(data.podcasts);
      setCauses(data.causes);
      setResources(data.resources);
      setUsers(data.users);
      setRsvps(data.rsvps);
      setVolunteers(data.volunteers);
      setDonations(data.donations);
      setGymProfiles(data.gymProfiles || []);
      setGymRequests(data.gymRequests || []);
      setSafetyReports(data.safetyReports || []);
      setUserBlocks(data.userBlocks || []);
      setMedia(data.media || []);
      setStatus("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Admin request failed.";
      setStatus(message === "Admin access required" ? "Admin access required. Sign out and sign back in with the admin account." : message);
    }
  }

  useEffect(() => {
    if (isLoading || !isAuthenticated || !token) return;
    loadAdminData();
  }, [isLoading, isAuthenticated, token]);

  const stats = useMemo(() => ([
    ["Events", events.length],
    ["Podcast Embeds", podcasts.length],
    ["Donation Causes", causes.length],
    ["Resources", resources.length],
    ["Media", media.length],
    ["RSVPs", rsvps.length],
    ["Volunteers", volunteers.length],
    ["Gym Profiles", gymProfiles.length]
  ]), [events, podcasts, causes, resources, media, rsvps, volunteers, gymProfiles]);

  const eventCategories = useMemo(() => {
    const categories = [...new Set(events.map((event) => event.category).filter(Boolean))];
    return ["Fathers Day", ...categories.filter((category) => category !== "Fathers Day")];
  }, [events]);

  const filteredRsvps = useMemo(() => (
    rsvpEventFilter === "all" ? rsvps : rsvps.filter((item) => item.eventId === rsvpEventFilter)
  ), [rsvps, rsvpEventFilter]);

  const filteredVolunteers = useMemo(() => (
    rsvpEventFilter === "all" ? volunteers : volunteers.filter((item) => item.eventId === rsvpEventFilter)
  ), [volunteers, rsvpEventFilter]);

  const eventTimeChoices = useMemo(() => {
    if (!eventForm.timeLabel || eventTimeOptions.some((time) => time.value === eventForm.timeLabel)) return eventTimeOptions;
    return [{ value: eventForm.timeLabel, label: eventForm.timeLabel }, ...eventTimeOptions];
  }, [eventForm.timeLabel]);

  function eventTitle(eventId) {
    return events.find((event) => event._id === eventId)?.title || eventId;
  }

  async function saveEvent(event) {
    event.preventDefault();
    try {
      await apiPost("/api/admin/events", {
        id: eventForm._id,
        category: eventForm.category,
        title: eventForm.title,
        description: eventForm.description,
        startsAt: eventForm.startsAt || Date.parse(`${eventForm.dateLabel} ${eventForm.timeLabel}`) || Date.now(),
        dateLabel: eventForm.dateLabel,
        timeLabel: eventForm.timeLabel,
        location: eventForm.location,
        imageUrl: eventForm.imageUrl,
        imageStorageId: eventForm.imageStorageId,
        published: eventForm.published
      }, await authHeaders());
      setEventForm(emptyEvent);
      await loadAdminData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Event save failed.");
    }
  }

  async function savePodcast(event) {
    event.preventDefault();
    try {
      await apiPost("/api/admin/podcasts", {
        id: podcastForm._id,
        title: podcastForm.title,
        platform: podcastForm.platform,
        embedUrl: podcastForm.embedUrl,
        youtubeEmbedUrl: podcastForm.youtubeEmbedUrl,
        spotifyEmbedUrl: podcastForm.spotifyEmbedUrl,
        appleMusicEmbedUrl: podcastForm.appleMusicEmbedUrl,
        imageUrl: podcastForm.imageUrl,
        imageStorageId: podcastForm.imageStorageId,
        description: podcastForm.description,
        publishedAt: podcastForm.publishedAt || Date.now(),
        published: podcastForm.published
      }, await authHeaders());
      setPodcastForm(emptyPodcast);
      await loadAdminData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Podcast save failed.");
    }
  }

  async function saveCause(event) {
    event.preventDefault();
    await apiPost("/api/admin/causes", {
      id: causeForm._id,
      title: causeForm.title,
      goalCents: dollarsToCents(causeForm.goal),
      description: causeForm.description,
      paymentUrl: causeForm.paymentUrl,
      published: causeForm.published
    }, await authHeaders());
    setCauseForm(emptyCause);
    await loadAdminData();
  }

  async function saveResource(event) {
    event.preventDefault();
    await apiPost("/api/admin/resources", {
      id: resourceForm._id,
      name: resourceForm.name,
      organizationType: resourceForm.organizationType,
      specialty: resourceForm.specialty,
      website: resourceForm.website,
      contactName: resourceForm.contactName,
      contactEmail: resourceForm.contactEmail,
      contactPhone: resourceForm.contactPhone,
      address: resourceForm.address,
      description: resourceForm.description,
      published: resourceForm.published
    }, await authHeaders());
    setResourceForm(emptyResource);
    await loadAdminData();
  }

  async function removeItem(path, id) {
    await apiPost(path, { id }, await authHeaders());
    await loadAdminData();
  }

  async function uploadImage(file, applyImage) {
    if (!file) return;
    try {
      setStatus("Uploading image...");
      const { uploadUrl } = await apiPost("/api/admin/upload-url", {}, await authHeaders());
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file
      });
      if (!uploadResponse.ok) throw new Error("Image upload failed.");
      const { storageId } = await uploadResponse.json();
      const { url } = await apiPost("/api/admin/file-url", { storageId }, await authHeaders());
      applyImage({ url, storageId });
      setStatus("Image uploaded. Save the post to publish it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Image upload failed.");
    }
  }

  function rescheduleEvent(item) {
    setEventForm(item);
    requestAnimationFrame(() => document.querySelector("[data-event-date]")?.focus());
  }

  async function moderateGymProfile(profileId, adminStatus) {
    await apiPost("/api/admin/gym-profile/moderate", { profileId, adminStatus }, await authHeaders());
    await loadAdminData();
  }

  async function updateReportStatus(reportId, status) {
    await apiPost("/api/admin/safety-report/status", { reportId, status }, await authHeaders());
    await loadAdminData();
  }

  const statusIsError = /access|required|failed|error|login|request|set vite/i.test(status);

  if (isLoading) {
    return (
      <section className="adminAuthGate">
        <div className="adminAuthPanel">
          <div>
            <p className="eyebrow">The Anchor Collective</p>
            <h1>Loading admin...</h1>
            <p>Checking your admin session.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="adminAuthGate">
        <div className="adminAuthPanel">
          <div>
            <p className="eyebrow">The Anchor Collective</p>
            <h1>Admin Portal</h1>
            <p>Sign in with an approved admin account to manage content, members, gym partner safety, RSVPs, and resources.</p>
          </div>
          <AdminSignIn />
        </div>
      </section>
    );
  }

  return (
    <>
      <AdminNav />
      <section className="dash">
        <div className="adminWrap">
          <div className="adminHeader withAction">
            <div>
              <h1>Admin Portal</h1>
              <p className="lead">Create and manage site content, review RSVPs, and keep the public pages current.</p>
            </div>
            <button className="btn" type="button" onClick={() => void signOut()}>Sign Out</button>
          </div>
          {status ? <p className={`adminNotice ${statusIsError ? "error" : "success"}`}>{status}</p> : null}
          <div className="adminStats">
            {stats.map(([label, value]) => <div className="adminStat" key={label}><span>{label}</span><b>{value}</b></div>)}
          </div>

          <div className="adminLayout">
            <aside className="adminSidebar">
              <button className="mobileSectionToggle" type="button" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
                <span>Menu</span>
                <b>{adminTabs.find(([tab]) => tab === activeTab)?.[1] || "Sections"}</b>
              </button>
              <div className="sectionTabList">
                {adminTabs.map(([tab, label]) => (
                  <button className={`tab ${activeTab === tab ? "active" : ""}`} key={tab} onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}>{label}</button>
                ))}
              </div>
            </aside>

            <div className="adminPanel">
              {activeTab === "events" && (
            <div className="adminStack">
              <form className="form adminEditor eventEditor" onSubmit={saveEvent}>
                <div className="editorHead">
                  <h2>{eventForm._id ? "Edit Event" : "Add Event"}</h2>
                  <label className="checkLabel"><input type="checkbox" checked={eventForm.published} onChange={(event) => setEventForm({ ...eventForm, published: event.target.checked })} /> Published</label>
                </div>
                <div className="editorGrid eventEditorGrid">
                  <div>
                    <label>Event Name</label>
                    <input required value={eventForm.title} onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })} />
                  </div>
                  <div>
                    <label>Category</label>
                    <input list="eventCategories" required value={eventForm.category} onChange={(event) => setEventForm({ ...eventForm, category: event.target.value })} />
                    <datalist id="eventCategories">
                      {eventCategories.map((category) => <option value={category} key={category} />)}
                    </datalist>
                  </div>
                  <div>
                    <label>Date</label>
                    <input data-event-date type="date" required value={eventForm.dateLabel || ""} onChange={(event) => setEventForm({ ...eventForm, dateLabel: event.target.value })} />
                  </div>
                  <div>
                    <label>Time</label>
                    <select required value={eventForm.timeLabel || ""} onChange={(event) => setEventForm({ ...eventForm, timeLabel: event.target.value })}>
                      <option value="">Pick a time</option>
                      {eventTimeChoices.map((time) => <option value={time.value} key={time.value}>{time.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Location</label>
                    <input required value={eventForm.location} onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })} />
                  </div>
                  <div className="editorWide">
                    <label>Info</label>
                    <textarea rows="2" required value={eventForm.description} onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })} />
                  </div>
                  <div>
                    <label>Event Image</label>
                    <label className="uploadButton">Upload Image<input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0], ({ url, storageId }) => setEventForm((current) => ({ ...current, imageUrl: url, imageStorageId: storageId })))} /></label>
                    {eventForm.imageUrl ? <img className="editorImagePreview" src={eventForm.imageUrl} alt="Event upload preview" /> : null}
                  </div>
                  <div className="editorActions">
                    <button className="btn green">Save Event</button>
                    {eventForm._id ? <button className="btn" type="button" onClick={() => setEventForm(emptyEvent)}>Cancel</button> : null}
                  </div>
                </div>
              </form>
              <div className="eventList">
                {events.map((item) => {
                  const eventRsvps = rsvps.filter((rsvp) => rsvp.eventId === item._id);
                  const eventVolunteers = volunteers.filter((volunteer) => volunteer.eventId === item._id);
                  return (
                    <div className="listItem eventListItem" key={item._id}>
                      <div>
                        {item.imageUrl ? <img className="adminListThumb" src={item.imageUrl} alt={item.title} /> : null}
                        <h3>{item.title}</h3>
                        <p>{item.category} | {item.dateLabel || new Date(item.startsAt).toLocaleDateString()} at {item.timeLabel || ""}</p>
                        <p>{eventRsvps.length} RSVP{eventRsvps.length === 1 ? "" : "s"} | {eventVolunteers.length} volunteer{eventVolunteers.length === 1 ? "" : "s"}</p>
                        <p>{item.description}</p>
                        <div className="adminEventPeople">
                          <div><b>RSVPs</b>{eventRsvps.length ? eventRsvps.map((person) => <span key={person._id}>{person.name} | {person.email}</span>) : <span>No RSVPs yet.</span>}</div>
                          <div><b>Volunteers</b>{eventVolunteers.length ? eventVolunteers.map((person) => <span key={person._id}>{person.name} | {person.email}{person.role ? ` | ${person.role}` : ""}</span>) : <span>No volunteers yet.</span>}</div>
                        </div>
                      </div>
                      <div className="miniActions"><button className="btn" onClick={() => setEventForm(item)}>Edit</button><button className="btn" onClick={() => rescheduleEvent(item)}>Reschedule</button><button className="btn danger" onClick={() => removeItem("/api/admin/events/delete", item._id)}>Delete</button></div>
                    </div>
                  );
                })}
                {!events.length ? <div className="listItem"><p>No events yet. Add one above.</p></div> : null}
              </div>
            </div>
          )}

          {activeTab === "podcasts" && (
            <div className="adminStack">
              <form className="form adminEditor compactEditor" onSubmit={savePodcast}>
                <div className="editorHead">
                  <h2>{podcastForm._id ? "Edit Podcast" : "Add Podcast"}</h2>
                  <label className="checkLabel"><input type="checkbox" checked={podcastForm.published} onChange={(event) => setPodcastForm({ ...podcastForm, published: event.target.checked })} /> Published</label>
                </div>
                <div className="editorGrid podcastEditorGrid">
                  <div>
                    <label>Title</label>
                    <input required value={podcastForm.title} onChange={(event) => setPodcastForm({ ...podcastForm, title: event.target.value })} />
                  </div>
                  <div>
                    <label>Platform</label>
                    <select value={podcastForm.platform} onChange={(event) => setPodcastForm({ ...podcastForm, platform: event.target.value })}><option>YouTube</option><option>Spotify</option><option>Apple Music</option></select>
                  </div>
                  <div>
                    <label>YouTube Embed</label>
                    <input value={podcastForm.youtubeEmbedUrl || ""} onChange={(event) => setPodcastForm({ ...podcastForm, youtubeEmbedUrl: event.target.value, embedUrl: event.target.value || podcastForm.embedUrl })} />
                  </div>
                  <div>
                    <label>Spotify Embed</label>
                    <input value={podcastForm.spotifyEmbedUrl || ""} onChange={(event) => setPodcastForm({ ...podcastForm, spotifyEmbedUrl: event.target.value })} />
                  </div>
                  <div>
                    <label>Apple Music Embed</label>
                    <input value={podcastForm.appleMusicEmbedUrl || ""} onChange={(event) => setPodcastForm({ ...podcastForm, appleMusicEmbedUrl: event.target.value })} />
                  </div>
                  <div>
                    <label>Image URL</label>
                    <input value={podcastForm.imageUrl || ""} placeholder="assets/logos/logo.png" onChange={(event) => setPodcastForm({ ...podcastForm, imageUrl: event.target.value, imageStorageId: "" })} />
                  </div>
                  <div>
                    <label>Podcast Image</label>
                    <label className="uploadButton">Upload Image<input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0], ({ url, storageId }) => setPodcastForm((current) => ({ ...current, imageUrl: url, imageStorageId: storageId })))} /></label>
                    {podcastForm.imageUrl ? <img className="editorImagePreview" src={podcastForm.imageUrl} alt="Podcast upload preview" /> : null}
                  </div>
                  <div className="editorWide">
                    <label>Description</label>
                    <textarea rows="2" required value={podcastForm.description} onChange={(event) => setPodcastForm({ ...podcastForm, description: event.target.value })} />
                  </div>
                  <div className="editorActions">
                    <button className="btn green">Save Podcast</button>
                    {podcastForm._id ? <button className="btn" type="button" onClick={() => setPodcastForm(emptyPodcast)}>Cancel</button> : null}
                  </div>
                </div>
              </form>
              <div className="eventList">
                {podcasts.map((item) => <div className="listItem eventListItem" key={item._id}><div>{item.imageUrl ? <img className="adminListThumb" src={item.imageUrl} alt={item.title} /> : null}<h3>{item.title}</h3><p>{[item.youtubeEmbedUrl && "YouTube", item.spotifyEmbedUrl && "Spotify", item.appleMusicEmbedUrl && "Apple Music"].filter(Boolean).join(" + ") || item.platform}</p><p>{item.description}</p></div><div className="miniActions"><button className="btn" onClick={() => setPodcastForm({ ...emptyPodcast, ...item })}>Edit</button><button className="btn danger" onClick={() => removeItem("/api/admin/podcasts/delete", item._id)}>Delete</button></div></div>)}
                {!podcasts.length ? <div className="listItem"><p>No podcast embeds yet. Add one above.</p></div> : null}
              </div>
            </div>
          )}

          {activeTab === "donations" && (
            <div className="adminStack">
              <form className="form adminEditor compactEditor" onSubmit={saveCause}>
                <div className="editorHead">
                  <h2>{causeForm._id ? "Edit Cause" : "Add Donation Cause"}</h2>
                  <label className="checkLabel"><input type="checkbox" checked={causeForm.published} onChange={(event) => setCauseForm({ ...causeForm, published: event.target.checked })} /> Published</label>
                </div>
                <div className="editorGrid causeEditorGrid">
                  <div>
                    <label>Cause Name</label>
                    <input required value={causeForm.title} onChange={(event) => setCauseForm({ ...causeForm, title: event.target.value })} />
                  </div>
                  <div>
                    <label>Goal Amount</label>
                    <input required value={causeForm.goal} onChange={(event) => setCauseForm({ ...causeForm, goal: event.target.value })} />
                  </div>
                  <div>
                    <label>Payment Link</label>
                    <input value={causeForm.paymentUrl || ""} placeholder="Add nonprofit payment link" onChange={(event) => setCauseForm({ ...causeForm, paymentUrl: event.target.value })} />
                  </div>
                  <div className="editorWide">
                    <label>Description</label>
                    <textarea rows="2" required value={causeForm.description} onChange={(event) => setCauseForm({ ...causeForm, description: event.target.value })} />
                  </div>
                  <div className="editorActions">
                    <button className="btn green">Save Cause</button>
                    {causeForm._id ? <button className="btn" type="button" onClick={() => setCauseForm(emptyCause)}>Cancel</button> : null}
                  </div>
                </div>
              </form>
              <div className="eventList">
                {causes.map((item) => <div className="listItem eventListItem" key={item._id}><div><h3>{item.title}</h3><p>Goal: ${Math.round(item.goalCents / 100).toLocaleString()}</p><p>{item.description}</p></div><div className="miniActions"><button className="btn" onClick={() => setCauseForm({ ...item, goal: centsToDollars(item.goalCents) })}>Edit</button><button className="btn danger" onClick={() => removeItem("/api/admin/causes/delete", item._id)}>Delete</button></div></div>)}
                {!causes.length ? <div className="listItem"><p>No donation causes yet. Add one above.</p></div> : null}
                <div className="listItem"><h3>Donation Activity</h3>{donations.length ? donations.map((item) => <p key={item._id}>{item.donorEmail} pledged ${(item.amountCents / 100).toFixed(2)}</p>) : <p>No donation activity yet.</p>}</div>
              </div>
            </div>
          )}

          {activeTab === "rsvps" && (
            <div className="tableList">
              <div className="listItem">
                <h3>Event People</h3>
                <label>Filter By Event</label>
                <select value={rsvpEventFilter} onChange={(event) => setRsvpEventFilter(event.target.value)}>
                  <option value="all">All Events</option>
                  {events.map((event) => <option value={event._id} key={event._id}>{event.title}</option>)}
                </select>
              </div>
              {filteredRsvps.length ? filteredRsvps.map((item) => (
                <div className="listItem" key={item._id}>
                  <h3>{item.name}</h3>
                  <p>{item.email}</p>
                  <p>RSVP'd for {eventTitle(item.eventId)}</p>
                </div>
              )) : <div className="listItem"><p>No RSVPs match this filter.</p></div>}
              <div className="listItem"><h3>Volunteers</h3></div>
              {filteredVolunteers.length ? filteredVolunteers.map((item) => (
                <div className="listItem" key={item._id}>
                  <h3>{item.name}</h3>
                  <p>{item.email}{item.phone ? ` | ${item.phone}` : ""}</p>
                  <p>Volunteered for {eventTitle(item.eventId)}</p>
                  {item.role ? <p>Role: {item.role}</p> : null}
                  {item.availability ? <p>Availability: {item.availability}</p> : null}
                </div>
              )) : <div className="listItem"><p>No volunteers match this filter.</p></div>}
            </div>
          )}

          {activeTab === "resources" && (
            <div className="adminStack">
              <form className="form adminEditor compactEditor" onSubmit={saveResource}>
                <div className="editorHead">
                  <h2>{resourceForm._id ? "Edit Resource" : "Add Resource"}</h2>
                  <label className="checkLabel"><input type="checkbox" checked={resourceForm.published} onChange={(event) => setResourceForm({ ...resourceForm, published: event.target.checked })} /> Published</label>
                </div>
                <div className="editorGrid resourceEditorGrid">
                  <div>
                    <label>Practice / Organization</label>
                    <input required value={resourceForm.name} onChange={(event) => setResourceForm({ ...resourceForm, name: event.target.value })} />
                  </div>
                  <div>
                    <label>Type</label>
                    <input required placeholder="Family therapy, legal aid..." value={resourceForm.organizationType} onChange={(event) => setResourceForm({ ...resourceForm, organizationType: event.target.value })} />
                  </div>
                  <div>
                    <label>Specialty</label>
                    <input required placeholder="Co-parenting, youth support..." value={resourceForm.specialty} onChange={(event) => setResourceForm({ ...resourceForm, specialty: event.target.value })} />
                  </div>
                  <div>
                    <label>Website</label>
                    <input type="url" value={resourceForm.website || ""} onChange={(event) => setResourceForm({ ...resourceForm, website: event.target.value })} />
                  </div>
                  <div>
                    <label>Contact Name</label>
                    <input value={resourceForm.contactName || ""} onChange={(event) => setResourceForm({ ...resourceForm, contactName: event.target.value })} />
                  </div>
                  <div>
                    <label>Contact Email</label>
                    <input type="email" value={resourceForm.contactEmail || ""} onChange={(event) => setResourceForm({ ...resourceForm, contactEmail: event.target.value })} />
                  </div>
                  <div>
                    <label>Contact Phone</label>
                    <input value={resourceForm.contactPhone || ""} onChange={(event) => setResourceForm({ ...resourceForm, contactPhone: event.target.value })} />
                  </div>
                  <div>
                    <label>Address</label>
                    <input value={resourceForm.address || ""} onChange={(event) => setResourceForm({ ...resourceForm, address: event.target.value })} />
                  </div>
                  <div className="editorWide">
                    <label>Description</label>
                    <textarea rows="2" required value={resourceForm.description} onChange={(event) => setResourceForm({ ...resourceForm, description: event.target.value })} />
                  </div>
                  <div className="editorActions">
                    <button className="btn green">Save Resource</button>
                    {resourceForm._id ? <button className="btn" type="button" onClick={() => setResourceForm(emptyResource)}>Cancel</button> : null}
                  </div>
                </div>
              </form>
              <div className="eventList">
                {resources.map((item) => <div className="listItem eventListItem" key={item._id}><div><h3>{item.name}</h3><p>{item.organizationType} | {item.specialty}</p><p>{item.contactPhone || item.contactEmail || item.website || "No contact listed"}</p><p>{item.description}</p></div><div className="miniActions"><button className="btn" onClick={() => setResourceForm({ ...emptyResource, ...item })}>Edit</button><button className="btn danger" onClick={() => removeItem("/api/admin/resources/delete", item._id)}>Delete</button></div></div>)}
                {!resources.length ? <div className="listItem"><p>No resources yet. Add one above.</p></div> : null}
              </div>
            </div>
          )}

          {activeTab === "gym" && (
            <div className="adminStack">
              <div className="tableList">
                <div className="listItem">
                  <h3>Gym Partner Profiles</h3>
                  <p>{gymProfiles.filter((profile) => profile.active).length} active profile{gymProfiles.filter((profile) => profile.active).length === 1 ? "" : "s"}.</p>
                </div>
                {gymProfiles.length ? gymProfiles.map((profile) => (
                  <div className="listItem memberItem" key={profile._id}>
                    <h3>{profile.name}</h3>
                    <p>{profile.email} | {profile.neighborhood || "Neighborhood not listed"}</p>
                    <p>{profile.active ? "Active" : "Paused"} | {profile.preferredGym || "Gym not listed"} | {profile.fitnessLevel}</p>
                    <p>Moderation: {profile.adminStatus || "approved"}</p>
                    <p>Days: {profile.days.join(", ") || "Not listed"}</p>
                    <p>Times: {profile.times.join(", ") || "Not listed"}</p>
                    <p>Goals: {profile.goals.join(", ") || "Not listed"}</p>
                    {profile.partnerPreference ? <p>Preference: {profile.partnerPreference}</p> : null}
                    {profile.transportation ? <p>Transportation: {profile.transportation}</p> : null}
                    {profile.notes ? <p>{profile.notes}</p> : null}
                    <div className="miniActions">
                      <button className="btn green" onClick={() => moderateGymProfile(profile._id, "approved")}>Approve</button>
                      <button className="btn" onClick={() => moderateGymProfile(profile._id, "pending")}>Pause</button>
                      <button className="btn danger" onClick={() => moderateGymProfile(profile._id, "blocked")}>Block</button>
                      <button className="btn danger" onClick={() => moderateGymProfile(profile._id, "removed")}>Remove</button>
                    </div>
                  </div>
                )) : <div className="listItem"><p>No gym partner profiles yet.</p></div>}
              </div>
              <div className="tableList">
                <div className="listItem"><h3>Gym Partner Requests</h3></div>
                {gymRequests.length ? gymRequests.map((request) => (
                  <div className="listItem memberItem" key={request._id}>
                    <h3>{request.requesterName} to {request.recipientName}</h3>
                    <p>{request.requesterEmail} to {request.recipientEmail}</p>
                    <p>Status: {request.status}</p>
                    {request.message ? <p>{request.message}</p> : null}
                  </div>
                )) : <div className="listItem"><p>No gym partner requests yet.</p></div>}
              </div>
              <div className="tableList">
                <div className="listItem"><h3>Safety Reports</h3></div>
                {safetyReports.length ? safetyReports.map((report) => (
                  <div className="listItem memberItem" key={report._id}>
                    <h3>{report.reason}</h3>
                    <p>Reporter: {report.reporterEmail}</p>
                    {report.reportedEmail ? <p>Reported: {report.reportedEmail}</p> : null}
                    <p>Status: {report.status}</p>
                    {report.details ? <p>{report.details}</p> : null}
                    <div className="miniActions">
                      <button className="btn" onClick={() => updateReportStatus(report._id, "reviewing")}>Reviewing</button>
                      <button className="btn green" onClick={() => updateReportStatus(report._id, "resolved")}>Resolved</button>
                      <button className="btn" onClick={() => updateReportStatus(report._id, "dismissed")}>Dismiss</button>
                    </div>
                  </div>
                )) : <div className="listItem"><p>No safety reports yet.</p></div>}
              </div>
              <div className="tableList">
                <div className="listItem"><h3>User Blocks</h3></div>
                {userBlocks.length ? userBlocks.map((block) => (
                  <div className="listItem" key={block._id}>
                    <h3>{block.blockerEmail} blocked {block.blockedEmail}</h3>
                    {block.reason ? <p>{block.reason}</p> : null}
                  </div>
                )) : <div className="listItem"><p>No user blocks yet.</p></div>}
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="tableList">
              {users.length ? users.map((user) => (
                <div className="listItem memberItem" key={user._id}>
                  <h3>{user.name}</h3>
                  <p>{user.email}{user.phone ? ` | ${user.phone}` : ""}</p>
                  <p>{user.dateOfBirth ? `DOB: ${user.dateOfBirth}` : "DOB not provided"} | {user.neighborhood || "Neighborhood not provided"}</p>
                  <p>{user.familyRole || "Family role not provided"} | {user.interests?.join(", ")}</p>
                  {user.preferredContact ? <p>Preferred contact: {user.preferredContact}</p> : null}
                  {user.supportNeeds ? <p>{user.supportNeeds}</p> : null}
                </div>
              )) : <div className="listItem"><p>No members yet.</p></div>}
            </div>
          )}
            </div>
          </div>
        </div>
      </section>
      {mobileMenuOpen ? (
        <div className="adminSheetOverlay" role="presentation" onClick={() => setMobileMenuOpen(false)}>
          <div className="adminBottomSheet" role="dialog" aria-modal="true" aria-label="Admin sections" onClick={(event) => event.stopPropagation()}>
            <div className="adminSheetHandle" />
            <div className="adminSheetHead">
              <div>
                <span>Admin Menu</span>
                <b>{adminTabs.find(([tab]) => tab === activeTab)?.[1] || "Sections"}</b>
              </div>
              <button className="btn" type="button" onClick={() => setMobileMenuOpen(false)}>Close</button>
            </div>
            <div className="adminSheetTabs">
              {adminTabs.map(([tab, label]) => (
                <button className={`tab ${activeTab === tab ? "active" : ""}`} key={tab} onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
