import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { Armchair, ArrowDownUp, ArrowLeft, BedDouble, Bot, BriefcaseBusiness, Bus, CalendarDays, ChevronDown, ChevronRight, Gift, Headphones, Hotel, LogOut, MapPin, MapPinned, Menu, MessageSquare, Moon, Percent, Plane, Search, ShieldCheck, Snowflake, Sparkles, Star, Sun, Sunrise, Sunset, Tag, ThermometerSnowflake, Train, UserRound, X } from "lucide-react";
import { API_URL, api, tokenStore } from "./services/api";
import { Logo } from "./components/Logo";
import apsrtcLogo from "./assets/images/apsrtc-logo.png";
import footerLogo from "./assets/images/footer-logo.png";
import ksrtcLogo from "./assets/images/ksrtc-logo.png";
import tgsrtcLogo from "./assets/images/tgsrtc-logo.jpg";
import newsAssurance from "./assets/images/news-assurance.svg";
import newsCancellation from "./assets/images/news-cancellation.svg";
import newsTimetable from "./assets/images/news-timetable.svg";
import orbitaHome from "./assets/images/orbita-home.png";
import "./assets/css/styles.css";

const services = [
  { key: "bus", label: "Bus Tickets", icon: Bus },
  { key: "flight", label: "Flights", icon: Plane },
  { key: "train", label: "Trains", icon: Train },
  { key: "hotels", label: "Hotels", icon: Hotel },
  { key: "packages", label: "Packages", icon: BriefcaseBusiness }
];

const initialPassenger = { name: "", age: "", gender: "Male", seat: "" };
const toDateInputValue = (date) => date.toISOString().slice(0, 10);
const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
const defaultQuery = {
  scope: "domestic",
  tripType: "one-way",
  from: "",
  to: "",
  date: toDateInputValue(daysFromNow(1)),
  returnDate: toDateInputValue(daysFromNow(4)),
  travellers: 1
};
const priorityCityNames = ["hyderabad", "bengaluru", "bangalore", "chennai", "mumbai", "delhi", "new delhi", "pune", "kolkata"];
const cityStateBoardKeys = {
  hyderabad: ["tgsrtc"],
  secunderabad: ["tgsrtc"],
  bangalore: ["ksrtc"],
  bengaluru: ["ksrtc"],
  mysore: ["ksrtc"],
  mysuru: ["ksrtc"],
  mangalore: ["ksrtc"],
  vijayawada: ["apsrtc"],
  visakhapatnam: ["apsrtc"],
  vizag: ["apsrtc"],
  tirupati: ["apsrtc"],
  nellore: ["apsrtc"],
  chennai: [],
  mumbai: [],
  delhi: [],
  "new delhi": []
};
const operatorBrands = [
  { key: "apsrtc", match: "apsrtc", aliases: ["apsrtc", "andhra pradesh state road transport", "andhra pradesh rtc"], title: "APSRTC", logo: apsrtcLogo, subtitle: "Andhra Pradesh state services" },
  { key: "tgsrtc", match: "tgsrtc", aliases: ["tgsrtc", "tsrtc", "telangana state road transport", "telangana rtc"], title: "TGSRTC", logo: tgsrtcLogo, subtitle: "Telangana state services" },
  { key: "ksrtc", match: "ksrtc", aliases: ["ksrtc", "karnataka state road transport", "karnataka rtc"], title: "KSRTC", logo: ksrtcLogo, subtitle: "Karnataka state services" }
];

function operatorBrand(routeOrName) {
  const value = typeof routeOrName === "string" ? routeOrName : `${routeOrName?.providerName || ""} ${routeOrName?.operatorName || ""} ${routeOrName?.travelsName || ""}`;
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const compact = normalized.replace(/\s+/g, "");
  return operatorBrands.find((brand) => brand.aliases.some((alias) => normalized.includes(alias) || compact.includes(alias.replace(/[^a-z0-9]+/g, ""))));
}

function routeRelevantStateBoardKeys(query, routes = []) {
  const keys = new Set();
  [query?.from, query?.to].forEach((city) => {
    cityStateBoardKeys[String(city || "").toLowerCase()]?.forEach((key) => keys.add(key));
  });
  routes.forEach((route) => {
    const brand = operatorBrand(route);
    if (brand) keys.add(brand.key);
  });
  return keys;
}

const cancellationPolicyRows = [
  ["More than 24 hours before departure", "90% refund"],
  ["12 to 24 hours before departure", "75% refund"],
  ["6 to 12 hours before departure", "50% refund"],
  ["Less than 6 hours before departure", "25% refund"],
  ["No-show or missed boarding", "No refund"]
];

const footerRouteTabs = {
  routes: {
    label: "Top Bus Routes",
    links: ["Hyderabad to Bangalore Bus", "Bangalore to Chennai Bus", "Mumbai to Pune Bus", "Delhi to Jaipur Bus", "Chennai to Coimbatore Bus", "Hyderabad to Vijayawada Bus", "Bangalore to Goa Bus", "Pune to Mumbai Bus", "Kolkata to Bhubaneswar Bus", "Ahmedabad to Surat Bus", "Indore to Bhopal Bus", "Kochi to Trivandrum Bus"]
  },
  cities: {
    label: "Buses From Top Cities",
    links: ["Buses from Hyderabad", "Buses from Bangalore", "Buses from Chennai", "Buses from Mumbai", "Buses from Delhi", "Buses from Pune", "Buses from Kolkata", "Buses from Ahmedabad", "Buses from Jaipur", "Buses from Kochi", "Buses from Lucknow", "Buses from Chandigarh"]
  },
  rtc: {
    label: "Top RTC Buses",
    links: ["APSRTC Buses", "KSRTC Buses", "TGSRTC Buses", "MSRTC Buses", "GSRTC Buses", "UPSRTC Buses", "RSRTC Buses", "OSRTC Buses", "Kerala RTC Buses", "TNSTC Buses", "WBTC Buses", "HRTC Buses"]
  },
  services: {
    label: "Top Bus Services",
    links: ["Orange Travels", "SRS Travels", "VRL Travels", "KPN Travels", "Jabbar Travels", "Kallada Travels", "Parveen Travels", "Neeta Travels", "Sharma Travels", "IntrCity SmartBus", "Zingbus", "RedBus Express"]
  },
  quick: {
    label: "Quick Links",
    links: ["Bus Offers", "Track Ticket", "Cancel Ticket", "Reschedule Ticket", "Bus Timetable", "Live Bus Tracking", "Women Traveller Care", "Group Booking", "Corporate Travel", "Travel Insurance", "Customer Support", "Download App"]
  }
};

function formatDisplayDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatRating(rating, fallback = 4.3) {
  const value = Number(rating ?? fallback);
  return Number.isFinite(value) ? value.toFixed(1) : String(fallback);
}

function sentenceCaseCity(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function normalizedDisplayKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(boarding|dropping|pickup|pick up|drop|dropoff|drop off|point|bus stand|bus station|bus stop|terminal|travels|near|opp|opposite|beside|main|central)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueDisplayNames(values) {
  const seen = new Set();
  const result = [];
  values.filter(Boolean).forEach((value) => {
    const label = String(value).trim();
    const key = normalizedDisplayKey(label) || label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(label);
  });
  return result;
}

function uniqueCitiesByDisplay(cities) {
  const seen = new Set();
  const result = [];
  cities.forEach((city) => {
    const name = String(city?.name || "").trim();
    const key = normalizedDisplayKey(name) || name.toLowerCase();
    if (!name || seen.has(key)) return;
    seen.add(key);
    result.push(city);
  });
  return result;
}

function cityPriorityScore(value) {
  const normalized = String(value || "").toLowerCase();
  const index = priorityCityNames.indexOf(normalized);
  return index >= 0 ? index : priorityCityNames.length + 100;
}

function CityDropdown({ value, placeholder, cities, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.max(rect.width, 220)
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const close = (event) => {
      const inTrigger = triggerRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    const reposition = () => updatePosition();
    document.addEventListener("mousedown", close);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open]);

  const normalizeSearch = (text) => String(text || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const searchTerm = normalizeSearch(query);
  const scoredCities = cities
    .map((city, index) => {
      const name = String(city.name || "");
      const normalizedName = normalizeSearch(name);
      const words = name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const initials = words.map((word) => word[0]).join("");
      const priorityScore = cityPriorityScore(name);
      let score = priorityScore * 1000 + index;
      if (!searchTerm) score = priorityScore * 1000 + index;
      else if (normalizedName === searchTerm) score = -100;
      else if (normalizedName.startsWith(searchTerm)) score = -90;
      else if (words.some((word) => normalizeSearch(word).startsWith(searchTerm))) score = -80;
      else if (initials.startsWith(searchTerm)) score = -70;
      else if (normalizedName.includes(searchTerm)) score = -60;
      else score = Infinity;
      return { city, score: score + priorityScore };
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score || String(a.city.name).localeCompare(String(b.city.name)));
  const visibleCities = uniqueCitiesByDisplay(scoredCities.map(({ city }) => city)).slice(0, 80);

  const selectCity = (cityName) => {
    setQuery("");
    onChange(cityName);
    setOpen(false);
  };

  const menu = open ? createPortal(
    <ul
      ref={menuRef}
      className="city-dropdown-menu"
      role="listbox"
      style={{ position: "fixed", zIndex: 1000, ...menuStyle }}
    >
      {visibleCities.length ? visibleCities.map((city) => (
        <li key={city.id || city.name}>
          <button
            type="button"
            role="option"
            aria-selected={value === city.name}
            className={value === city.name ? "active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => selectCity(city.name)}
          >
            {sentenceCaseCity(city.name)}
          </button>
        </li>
      )) : (
        <li className="city-dropdown-empty">{cities.length ? "No cities found" : "Loading cities..."}</li>
      )}
    </ul>,
    document.body
  ) : null;

  return (
    <>
      <div className={`city-dropdown ${open ? "open" : ""}`}>
        <div
          ref={triggerRef}
          className="city-dropdown-trigger"
          onClick={() => setOpen(true)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <input
            type="text"
            className={value || query ? "city-dropdown-value" : "city-dropdown-placeholder"}
            value={open ? query : sentenceCaseCity(value)}
            placeholder={open && value ? sentenceCaseCity(value) : placeholder}
            onFocus={() => {
              setQuery("");
              setOpen(true);
              updatePosition();
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && visibleCities[0]) {
                event.preventDefault();
                selectCity(visibleCities[0].name);
              }
              if (event.key === "Escape") {
                setOpen(false);
                setQuery("");
              }
            }}
            aria-label={placeholder}
          />
          <ChevronDown size={18} className="city-dropdown-chevron" />
        </div>
      </div>
      {menu}
    </>
  );
}

function formatRouteTime(dateValue, offsetMinutes = 0) {
  const date = new Date(dateValue);
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function routeBoardingPoints(route) {
  const departure = route.departureTime;
  return [
    { time: formatRouteTime(departure, -30), name: `${route.origin} Central Bus Stand`, note: "Main boarding hub with waiting lounge and enquiry counter." },
    { time: formatRouteTime(departure, -20), name: `${route.origin} Railway Station Pickup`, note: "Pickup near the station entrance. Look for the operator signboard." },
    { time: formatRouteTime(departure, -12), name: `${route.origin} City Circle`, note: "Convenient city-centre stop for local passengers." },
    { time: formatRouteTime(departure, -5), name: `${route.origin} Highway Junction`, note: "Last boarding point before the service leaves the city." }
  ];
}

function routeDroppingPoints(route) {
  const arrival = route.arrivalTime;
  return [
    { time: formatRouteTime(arrival, -18), name: `${route.destination} Outer Ring Road`, note: "Early drop for passengers heading to suburban areas." },
    { time: formatRouteTime(arrival, -10), name: `${route.destination} IT Park / Industrial Area`, note: "Drop near major office and industrial clusters." },
    { time: formatRouteTime(arrival, -4), name: `${route.destination} Main Market`, note: "Central drop close to shopping and local transport." },
    { time: formatRouteTime(arrival, 0), name: `${route.destination} Central Bus Terminal`, note: "Final stop with taxi, auto and metro connectivity." }
  ];
}

function App() {
  const [page, setPage] = useState("bus");
  const [user, setUser] = useState(null);
  const [cities, setCities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [pendingRoute, setPendingRoute] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [activeJourney, setActiveJourney] = useState(null);
  const [bookingResumeState, setBookingResumeState] = useState(null);
  const [searchSnapshots, setSearchSnapshots] = useState({});
  const [authReturnPage, setAuthReturnPage] = useState(null);
  const [authMessage, setAuthMessage] = useState("");

  const refreshBookings = () => user && api("/bookings/mine").then(setBookings).catch(() => {});

  useEffect(() => {
    api("/catalog/cities").then(setCities);
    api("/catalog/packages").then(setPackages);
    api("/catalog/hotels").then(setHotels);
    if (tokenStore.get()) api("/auth/me").then((data) => setUser(data.user)).catch(() => tokenStore.clear());
  }, []);

  useEffect(() => {
    const finishGoogleLogin = async () => {
      if (!window.location.pathname.includes("/auth/google/callback")) return;
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const appToken = hash.get("token");
      const error = hash.get("error");
      if (appToken) {
        tokenStore.set(appToken);
        const data = await api("/auth/me");
        setUser(data.user);
        window.history.replaceState({}, "", "/");
        setPage(authReturnPage || (pendingCheckout ? "checkout" : "dashboard"));
        return;
      }
      if (error) throw new Error(error);
      const accessToken = hash.get("access_token");
      if (!accessToken) return;
      const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const profile = await profileRes.json();
      const data = await api("/auth/oauth", {
        method: "POST",
        body: JSON.stringify({
          provider: "google",
          providerId: profile.sub,
          name: profile.name,
          email: profile.email
        })
      });
      tokenStore.set(data.token);
      setUser(data.user);
      window.history.replaceState({}, "", "/");
      setPage(authReturnPage || (pendingCheckout ? "checkout" : "dashboard"));
    };
    finishGoogleLogin().catch((error) => {
      setAuthMessage(error.message || "Google sign-in failed. Please try again.");
      window.history.replaceState({}, "", "/");
      setPage("auth");
    });
  }, [authReturnPage, pendingCheckout]);

  useEffect(() => { refreshBookings(); }, [user]);
  const immersiveBooking = page === "booking";

  return (
    <main>
      {!immersiveBooking && <TopNav page={page} setPage={setPage} user={user} setUser={setUser} />}
      {page === "bus" && <HomePage cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} packages={packages} pendingRoute={pendingRoute} setPendingRoute={setPendingRoute} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} searchSnapshots={searchSnapshots} setSearchSnapshots={setSearchSnapshots} />}
      {page === "flight" && <ServicePage type="flight" cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} searchSnapshots={searchSnapshots} setSearchSnapshots={setSearchSnapshots} />}
      {page === "train" && <ServicePage type="train" cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} searchSnapshots={searchSnapshots} setSearchSnapshots={setSearchSnapshots} />}
      {page === "hotels" && <HotelsPage hotels={hotels} setPage={setPage} setPendingCheckout={setPendingCheckout} />}
      {page === "packages" && <PackagesPage packages={packages} user={user} refreshBookings={refreshBookings} />}
      {page === "dashboard" && <DashboardPage user={user} setUser={setUser} setPage={setPage} bookings={bookings} refreshBookings={refreshBookings} />}
      {page === "support" && <SupportPage user={user} bookings={bookings} />}
      {page === "auth" && <AuthPage user={user} setUser={setUser} setPage={setPage} pendingCheckout={pendingCheckout} authReturnPage={authReturnPage} setAuthReturnPage={setAuthReturnPage} authMessage={authMessage} />}
      {page === "booking" && <BookingPage activeJourney={activeJourney} setPage={setPage} user={user} setPendingCheckout={setPendingCheckout} setAuthReturnPage={setAuthReturnPage} bookingResumeState={bookingResumeState} setBookingResumeState={setBookingResumeState} />}
      {page === "checkout" && <CheckoutPage user={user} setPage={setPage} pendingCheckout={pendingCheckout} setPendingCheckout={setPendingCheckout} refreshBookings={refreshBookings} />}
      {!immersiveBooking && <FloatingAssistant user={user} bookings={bookings} />}
      {!immersiveBooking && <Footer setPage={setPage} />}
    </main>
  );
}

function TopNav({ page, setPage, user, setUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const goToPage = (nextPage) => {
    setPage(nextPage);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`top-shell ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <nav className="top-nav">
        <div className="mobile-brand-row">
          <button className="brand-button" onClick={() => goToPage("bus")}><Logo /></button>
          <button className="hamburger-button" type="button" aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div className="service-nav">
          {services.map(({ key, label, icon: Icon }) => (
            <button key={key} className={page === key ? "active" : ""} onClick={() => goToPage(key)}>
              <Icon size={24} /><span>{label}</span>
            </button>
          ))}
        </div>
        <div className="utility-nav">
          <button onClick={() => goToPage(user ? "dashboard" : "auth")}><CalendarDays size={20} /> Bookings</button>
          <button onClick={() => goToPage("support")}><Headphones size={20} /> Help</button>
          {user ? (
            <button onClick={() => { tokenStore.clear(); setUser(null); goToPage("auth"); }}><LogOut size={20} /> Logout</button>
          ) : (
            <button onClick={() => goToPage("auth")}><UserRound size={20} /> Account</button>
          )}
        </div>
      </nav>
    </header>
  );
}

function HomePage(props) {
  return (
    <>
      <BusHero {...props} />
      <OffersStrip />
      <WhatsNew />
      <GovernmentBuses />
      <PackagesPreview packages={props.packages} setPage={props.setPage} />
      <Testimonials />
    </>
  );
}

function BusHero({ cities, user, setUser, setPage, refreshBookings, pendingRoute, setPendingRoute, setPendingCheckout, setActiveJourney, searchSnapshots, setSearchSnapshots }) {
  return (
    <section className="bus-hero">
      <div className="hero-art">
        <img src={orbitaHome} alt="Orbita Travels" className="hero-image" />
        <div className="hero-copy">
          <span className="eyebrow">Travel across India with confidence</span>
          <h1>India's refined bus ticket booking experience</h1>
          <p>Compare trusted operators, choose seats, manage trips and get help before, during and after your journey.</p>
        </div>
      </div>
      <JourneySearch type="bus" cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} pendingRoute={pendingRoute} setPendingRoute={setPendingRoute} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} searchSnapshots={searchSnapshots} setSearchSnapshots={setSearchSnapshots} compactHero />
    </section>
  );
}

function ServicePage({ type, cities, user, setUser, setPage, refreshBookings, setPendingCheckout, setActiveJourney, searchSnapshots, setSearchSnapshots }) {
  const pageCopy = {
    flight: {
      title: "Flights",
      text: "Fly between Indian cities with clear fares, smooth traveller details and support from search to boarding.",
      icon: Plane,
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1100&q=80",
      eyebrow: "Air travel desk",
      points: ["Domestic and international routing", "One-way and round-trip fares", "Traveller details and assisted checkout"],
      stats: [["150+", "city pairs"], ["24/7", "fare support"], ["6", "travellers per booking"]]
    },
    train: {
      title: "Train Tickets",
      text: "Plan comfortable rail journeys with class options, passenger details and practical support for every route.",
      icon: Train,
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1100&q=80",
      eyebrow: "Rail planning desk",
      points: ["Popular city connections", "Simple passenger handling", "Date planning for onward journeys"],
      stats: [["120+", "rail routes"], ["Live", "date planning"], ["Easy", "trip review"]]
    }
  };
  const details = pageCopy[type];
  const Icon = details.icon;
  return (
    <section className={`service-page service-page-${type}`}>
      <div className="service-hero">
        <div className="service-hero-copy">
          <span className="section-kicker">{details.eyebrow}</span>
          <div className="page-heading"><Icon size={34} /><div><h1>{details.title}</h1><p>{details.text}</p></div></div>
          <div className="service-point-row">
            {details.points.map((point) => <span key={point}>{point}</span>)}
          </div>
        </div>
        <div className="service-hero-media">
          <img src={details.image} alt={`${details.title} travel`} />
        </div>
      </div>
      <JourneySearch type={type} cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} searchSnapshots={searchSnapshots} setSearchSnapshots={setSearchSnapshots} />
      <div className="service-story-grid">
        {details.stats.map(([value, label]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}
      </div>
      <div className="service-info-band">
        <article>
          <h2>Built for quick booking decisions</h2>
          <p>Compare routes, select dates, add traveller details and move into checkout without losing context. Orbita keeps the page focused on the journey you are building.</p>
        </article>
        <article>
          <h2>Support after search</h2>
          <p>Booking flows connect into account, checkout and trip management, so the traveller has a clear path from discovery to confirmation.</p>
        </article>
      </div>
    </section>
  );
}

function JourneySearch({ type, cities, user, setUser, setPage, refreshBookings, compactHero, setPendingCheckout, setActiveJourney, searchSnapshots, setSearchSnapshots }) {
  const savedSearch = searchSnapshots?.[type];
  const [query, setQueryState] = useState(savedSearch?.query || defaultQuery);
  const [results, setResultsState] = useState(savedSearch?.results || []);
  const [message, setMessageState] = useState(savedSearch?.message || "");
  const [searching, setSearching] = useState(false);
  const resultsRef = useRef(null);
  const setQuery = (nextQuery) => {
    const value = typeof nextQuery === "function" ? nextQuery(query) : nextQuery;
    setQueryState(value);
    setSearchSnapshots?.((current) => ({ ...current, [type]: { ...(current[type] || {}), query: value } }));
  };
  const setResults = (nextResults) => {
    const value = typeof nextResults === "function" ? nextResults(results) : nextResults;
    setResultsState(value);
    setSearchSnapshots?.((current) => ({ ...current, [type]: { ...(current[type] || {}), query, results: value } }));
  };
  const setMessage = (nextMessage) => {
    const value = typeof nextMessage === "function" ? nextMessage(message) : nextMessage;
    setMessageState(value);
    setSearchSnapshots?.((current) => ({ ...current, [type]: { ...(current[type] || {}), query, message: value } }));
  };
  const selectedCities = cities.filter((city) => {
    const inScope = query.scope === "international" ? city.isInternational : !city.isInternational;
    const supportsMode = city.transportModes?.includes(type);
    return inScope && supportsMode;
  }).sort((a, b) => cityPriorityScore(a.name) - cityPriorityScore(b.name) || String(a.name).localeCompare(String(b.name)));
  const fromCities = selectedCities.filter((city) => city.name !== query.to);
  const toCities = selectedCities.filter((city) => city.name !== query.from);
  const canSearch = query.from && query.to && query.from !== query.to && query.date && (type === "flight" ? true : query.scope === "domestic");
  const isBus = type === "bus";

  const search = async (silent = false) => {
    if (!canSearch) {
      setResults([]);
      setMessage(query.from === query.to && query.from ? "Please choose different From and To cities." : "Please select From and To cities to see available services.");
      return;
    }
    setSearching(true);
    setMessage("");
    try {
      const params = new URLSearchParams({ from: query.from, to: query.to, date: query.date, tripType: query.tripType });
      const data = await api(`/transport/${type}/search?${params}`);
      setResultsState(data);
      setSearchSnapshots?.((current) => ({ ...current, [type]: { query, results: data, message: "" } }));
      if (!data.length && !silent) setMessage(`No ${type === "bus" ? "bus" : type} services returned for this route/date. Try another date or route.`);
      if (!silent) {
        window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    } catch (error) {
      setResults([]);
      setMessage(error.message || `Unable to search ${type} services right now.`);
    } finally {
      setSearching(false);
    }
  };

  const swapCities = () => {
    if (!query.from && !query.to) return;
    setResults([]);
    setQuery({ ...query, from: query.to, to: query.from });
  };

  const setQuickDate = (days) => {
    setQuery({ ...query, date: toDateInputValue(daysFromNow(days)) });
  };

  useEffect(() => {
    if (type !== "flight" && query.scope !== "domestic") {
      setQuery({ ...query, scope: "domestic", from: "", to: "" });
    }
    if (!savedSearch?.results?.length) {
      setResults([]);
      setMessage("");
    }
  }, [type, query.scope]);

  return (
    <div className={`journey-module ${compactHero ? "hero-search" : ""} ${isBus ? "bus-search-module" : "service-search-module"}`}>
      {!isBus && (
        <div className="radio-row">
          {type === "flight" && (
            <>
              <label><input type="radio" checked={query.scope === "domestic"} onChange={() => setQuery({ ...query, scope: "domestic", from: "", to: "" })} /> Domestic</label>
              <label><input type="radio" checked={query.scope === "international"} onChange={() => setQuery({ ...query, scope: "international", from: "", to: "" })} /> International</label>
            </>
          )}
          <label><input type="radio" checked={query.tripType === "one-way"} onChange={() => setQuery({ ...query, tripType: "one-way" })} /> One way</label>
          <label><input type="radio" checked={query.tripType === "round-trip"} onChange={() => setQuery({ ...query, tripType: "round-trip" })} /> Round trip</label>
        </div>
      )}

      {isBus ? (
        <div className="abhi-search-bar">
          <div className="abhi-field">
            <span className="abhi-label"><MapPin size={18} /> Origin</span>
            <CityDropdown
              value={query.from}
              placeholder="Select city"
              cities={fromCities}
              onChange={(from) => { setResults([]); setQuery({ ...query, from, to: from === query.to ? "" : query.to }); }}
            />
          </div>
          <button type="button" className="swap-btn" onClick={swapCities} aria-label="Swap source and destination"><ArrowDownUp size={18} /></button>
          <div className="abhi-field">
            <span className="abhi-label"><MapPin size={18} /> Destination</span>
            <CityDropdown
              value={query.to}
              placeholder="Select city"
              cities={toCities}
              onChange={(to) => { setResults([]); setQuery({ ...query, to, from: to === query.from ? "" : query.from }); }}
            />
          </div>
          <label className="abhi-field abhi-date" onClick={(e) => e.currentTarget.querySelector('input[type="date"]')?.showPicker?.()}>
            <span className="abhi-label"><CalendarDays size={18} /> Departure</span>
            <span className="abhi-date-display">{formatDisplayDate(query.date)}</span>
            <input type="date" value={query.date} min={toDateInputValue(daysFromNow(0))} onChange={(e) => setQuery({ ...query, date: e.target.value })} tabIndex={-1} />
          </label>
          <div className="quick-date-btns">
            <button type="button" className={query.date === toDateInputValue(daysFromNow(0)) ? "active" : ""} onClick={() => setQuickDate(0)}>Today</button>
            <button type="button" className={query.date === toDateInputValue(daysFromNow(1)) ? "active" : ""} onClick={() => setQuickDate(1)}>Tomorrow</button>
          </div>
          <button type="button" className={`abhi-search-btn ${searching ? "is-loading" : ""}`} onClick={() => search(false)} disabled={searching || !canSearch}>
            Search <ChevronRight size={20} />
          </button>
        </div>
      ) : (
        <>
          <div className="main-search-row">
            <label><span>{type === "flight" ? <Plane /> : <Train />} From</span><select value={query.from} onChange={(e) => { const from = e.target.value; setResults([]); setQuery({ ...query, from, to: from === query.to ? "" : query.to }); }}><option value="">Select from city</option>{fromCities.map((city) => <option key={city.id} value={city.name}>{sentenceCaseCity(city.name)}</option>)}</select></label>
            <label><span><MapPin /> To</span><select value={query.to} onChange={(e) => { const to = e.target.value; setResults([]); setQuery({ ...query, to, from: to === query.from ? "" : query.from }); }}><option value="">Select destination</option>{toCities.map((city) => <option key={city.id} value={city.name}>{sentenceCaseCity(city.name)}</option>)}</select></label>
            <label><span><CalendarDays /> Date of journey</span><input type="date" value={query.date} onChange={(e) => setQuery({ ...query, date: e.target.value })} /></label>
            {query.tripType === "round-trip" && <label><span><CalendarDays /> Return</span><input type="date" value={query.returnDate} onChange={(e) => setQuery({ ...query, returnDate: e.target.value })} /></label>}
            <label><span><UserRound /> Travellers</span><input type="number" min="1" max="6" value={query.travellers} onChange={(e) => setQuery({ ...query, travellers: Number(e.target.value) })} /></label>
          </div>
          <button className={`search-pill ${searching ? "is-loading" : ""}`} onClick={() => search(false)} disabled={searching || !canSearch}>
            <Search size={22} /> {searching ? "Finding best options..." : `Search ${type === "flight" ? "flights" : "trains"}`}
          </button>
        </>
      )}

      {query.scope === "international" && <p className="soft-note">International destinations will be enabled in the next expansion.</p>}
      {searching && <div className="search-feedback">Checking timings, fares and available seats for your route.</div>}
      {message && <div className="search-feedback">{message}</div>}
      <div ref={resultsRef}>
        <JourneyResults type={type} results={results} query={query} onViewSeats={(route) => { setActiveJourney({ route, query, type }); setPage("booking"); }} />
      </div>
    </div>
  );
}

function BookingPage({ activeJourney, setPage, user, setPendingCheckout, setAuthReturnPage, bookingResumeState, setBookingResumeState }) {
  const savedState = bookingResumeState?.routeId === activeJourney?.route?.id ? bookingResumeState : null;
  const [step, setStep] = useState(savedState?.step || "seats");
  const [liveRoute, setLiveRoute] = useState(null);
  const [livePoints, setLivePoints] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(savedState?.selectedSeats || []);
  const [passengers, setPassengers] = useState(savedState?.passengers || (user ? [{ name: user.name || "", age: "", gender: "Male", seat: "" }] : [{ ...initialPassenger }]));
  const [contact, setContact] = useState(savedState?.contact || (user ? { email: user.email || "", phone: user.phone || "", emergencyPhone: "" } : { email: "", phone: "", emergencyPhone: "" }));
  const [boardingPoint, setBoardingPoint] = useState(savedState?.boardingPoint || "");
  const [dropPoint, setDropPoint] = useState(savedState?.dropPoint || "");

  useEffect(() => {
    if (!user) return;
    setPassengers((current) => current.map((passenger, index) => index === 0 ? { ...passenger, name: passenger.name || user.name || "" } : passenger));
    setContact((current) => ({ ...current, email: current.email || user.email || "", phone: current.phone || user.phone || "" }));
  }, [user?.id]);

  useEffect(() => {
    const selectedRoute = activeJourney?.route;
    if (!selectedRoute?.id) return;
    const nextSavedState = bookingResumeState?.routeId === selectedRoute.id ? bookingResumeState : null;
    setStep(nextSavedState?.step || (selectedRoute.type === "bus" ? "seats" : "passenger"));
    setSelectedSeats(nextSavedState?.selectedSeats || []);
    setPassengers(nextSavedState?.passengers || (user ? [{ name: user.name || "", age: "", gender: "Male", seat: "" }] : [{ ...initialPassenger }]));
    setContact(nextSavedState?.contact || (user ? { email: user.email || "", phone: user.phone || "", emergencyPhone: "" } : { email: "", phone: "", emergencyPhone: "" }));
    setBoardingPoint(nextSavedState?.boardingPoint || "");
    setDropPoint(nextSavedState?.dropPoint || "");
    setLiveRoute({ ...selectedRoute, seatLayout: null, seatLayoutLoading: true, seatLayoutError: false });
    setLivePoints(null);
    if (selectedRoute.type !== "bus") {
      setStep("passenger");
      return;
    }
    api(`/transport/${selectedRoute.type}/${selectedRoute.id}/seats`).then((seatLayout) => {
      setLiveRoute((current) => ({ ...(current || selectedRoute), seatLayout, seatLayoutLoading: false, seatLayoutError: false }));
    }).catch(() => {
      setLiveRoute((current) => ({ ...(current || selectedRoute), seatLayout: null, seatLayoutLoading: false, seatLayoutError: true }));
    });
    api(`/transport/${selectedRoute.type}/${selectedRoute.id}/points`).then(setLivePoints).catch(() => {});
  }, [activeJourney?.route?.id]);

  useEffect(() => {
    if (!activeJourney?.route?.id) return;
    setBookingResumeState?.({
      routeId: activeJourney.route.id,
      step,
      selectedSeats,
      passengers,
      contact,
      boardingPoint,
      dropPoint
    });
  }, [activeJourney?.route?.id, step, selectedSeats, passengers, contact, boardingPoint, dropPoint]);

  if (!activeJourney) {
    return <section className="page-band"><div className="page-heading"><Bus size={34} /><div><h1>No journey selected</h1><p>Please choose a service from the search results first.</p></div></div><button className="primary" onClick={() => setPage("bus")}>Search buses</button></section>;
  }

  const { query } = activeJourney;
  const route = liveRoute || activeJourney.route;
  const isBus = route.type === "bus";

  const boardingPointOptions = livePoints?.boardingPoints?.length ? livePoints.boardingPoints : [];
  const droppingPointOptions = livePoints?.droppingPoints?.length ? livePoints.droppingPoints : [];
  const boardingPoints = uniqueDisplayNames(boardingPointOptions.map((point) => point.name));
  const droppingPoints = uniqueDisplayNames(droppingPointOptions.map((point) => point.name));
  const seats = isBus ? selectedSeats : [];
  const total = isBus && seats.length
    ? selectedSeatFareTotal(route, seats)
    : Number(route.price) * Math.max(isBus ? seats.length : passengers.length, 1);
  const canContinue = step === "points" ? boardingPoint && dropPoint : step === "seats" ? selectedSeats.length > 0 : true;

  const goBack = () => {
    if (step === "passenger" && isBus) return setStep("points");
    if (step === "points" && isBus) return setStep("seats");
    setPage(route.type || "bus");
  };

  const goPassenger = () => {
    if (!user) {
      setBookingResumeState?.({ routeId: route.id, step: "passenger", selectedSeats, passengers, contact, boardingPoint, dropPoint });
      setAuthReturnPage("booking");
      setPage("auth");
      return;
    }
    setStep("passenger");
  };

  const buy = () => {
    const selectedBoarding = boardingPointOptions.find((point) => point.name === boardingPoint);
    const selectedDrop = droppingPointOptions.find((point) => point.name === dropPoint);
    setBookingResumeState?.({ routeId: route.id, step: "passenger", selectedSeats, passengers, contact, boardingPoint, dropPoint });
    setPendingCheckout({ route, query, selectedSeats: seats, passengers, contact, boardingPoint, dropPoint, boardingPointId: selectedBoarding?.id, dropPointId: selectedDrop?.id, totalAmount: total });
    if (!user) setAuthReturnPage("checkout");
    setPage(user ? "checkout" : "auth");
  };

  return (
    <section className="booking-page">
      <div className="booking-window-head">
        <button className="window-close" onClick={goBack} aria-label={step === "points" ? "Close booking" : "Go back"}>
          {step === "points" ? <X size={26} /> : <ArrowLeft size={24} />}
        </button>
        <div className="booking-route-title"><b>{route.origin}</b><span>→</span><b>{route.destination}</b></div>
        <button type="button" className="booking-results-back" onClick={() => setPage(route.type || "bus")}><ArrowLeft size={16} /> Back to results</button>
        <div className="window-offer">Last min. 10% OFF</div>
      </div>
      <div className="wizard-tabs booking-tabs">
        {(isBus ? ["seats", "points", "passenger"] : ["passenger"]).map((item, index) => <button key={item} className={step === item ? "active" : ""} disabled={(item === "points" || item === "passenger") && !selectedSeats.length} onClick={() => item === "passenger" && !user ? (setBookingResumeState?.({ routeId: route.id, step: "passenger", selectedSeats, passengers, contact, boardingPoint, dropPoint }), setAuthReturnPage("booking"), setPage("auth")) : setStep(item)}>{index + 1}. {item === "points" ? "Board/Drop point" : item === "seats" ? "Select seats" : "Passenger Info"}</button>)}
      </div>
      {isBus && step === "points" && <BoardDropStep boardingPoints={boardingPoints} droppingPoints={droppingPoints} boardingPoint={boardingPoint} setBoardingPoint={setBoardingPoint} dropPoint={dropPoint} setDropPoint={setDropPoint} />}
      {isBus && step === "seats" && <div className="dedicated-seat-screen"><PortraitSeatChart route={route} selected={selectedSeats} setSelected={setSelectedSeats} /><BusProfilePanel route={route} /></div>}
      {step === "passenger" && <div className="passenger-screen"><div><PassengerForm query={query} selectedSeats={selectedSeats} passengers={passengers} setPassengers={setPassengers} contact={contact} setContact={setContact} mode={route.type} /><p className="identity-note">{isBus ? "The booking person must show Aadhaar card or any equivalent identity card to the bus attendant at the time of boarding." : "Traveller name and contact details should match the government ID used during travel."}</p></div><FareSummary total={total} route={route} boardingPoint={boardingPoint} dropPoint={dropPoint} seats={seats} /></div>}
      <div className="booking-bottom-bar">
        <div><span>Amount to pay</span><strong>₹{Number(total).toLocaleString("en-IN")}</strong></div>
        {step !== "passenger" ? <button className="primary" disabled={!canContinue} onClick={() => step === "seats" ? setStep("points") : goPassenger()}>Continue</button> : <button className="primary" onClick={buy}>{isBus ? "Buy ticket" : "Review booking"}</button>}
      </div>
    </section>
  );
}

function numberFrom(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function booleanFrom(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    const normalized = String(value).trim().toLowerCase();
    if (["true", "1", "yes", "y", "available"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "unavailable"].includes(normalized)) return false;
  }
  return false;
}

function extractSeatList(seatLayout) {
  if (!seatLayout) return [];
  const result = seatLayout.Result || {};
  const layoutObject = seatLayout.SeatLayout && !Array.isArray(seatLayout.SeatLayout) ? seatLayout.SeatLayout : result.SeatLayout || {};
  const source = seatLayout.SeatDetails || seatLayout.Seats || seatLayout.seats || layoutObject.SeatDetails || layoutObject.Seats || (Array.isArray(seatLayout.SeatLayout) ? seatLayout.SeatLayout : []);
  return Array.isArray(source) ? source.flat(Infinity).filter((seat) => seat && typeof seat === "object") : [];
}

function seatVisualType(seat, rawType) {
  const type = String(rawType || seat.rawType || seat.SeatType || seat.Type || seat.BerthType || "").toLowerCase();
  const htmlClass = String(seat.htmlClass || seat.className || "").toLowerCase();
  const seatName = String(seat.SeatName || seat.SeatNo || seat.SeatNumber || seat.label || seat.id || "");
  if (seat.visualType) return seat.visualType;
  const explicitlySeater = /(seat|chair|seater)/i.test(type) && !/(sleeper|berth)/i.test(type);
  if (/^[LU]\d+$/i.test(seatName) && !type && !htmlClass) return "berth";
  if (/^[LU]\d+$/i.test(seatName) && !explicitlySeater) return "berth";
  if (/^\d+(LA|LB|LC|UA|UB|UC)$/i.test(seatName) && !explicitlySeater) return "berth";
  if (type.includes("sleeper") || type.includes("berth") || htmlClass.includes("sleeper") || htmlClass.includes("berth")) return "berth";
  if (/\bb?hseat\b/.test(htmlClass) || type.includes("horizontal") || type === "2") return "horizontal-seat";
  return "seat";
}

function detectSeatDeck(seat) {
  const label = String(seat.SeatName || seat.SeatNo || seat.SeatNumber || seat.label || seat.id || "").trim().toLowerCase();
  const text = String(`${seat.Deck || seat.deck || ""} ${seat.ZIndex || seat.zIndex || ""} ${seat.DeckNo || ""} ${seat.deckIndex || ""}`).toLowerCase();
  if (text.includes("upper") || label.startsWith("u")) return "upper";
  if (text.includes("lower") || label.startsWith("l")) return "lower";
  const z = numberFrom(seat.ZIndex, seat.zIndex, seat.deckIndex, seat.DeckIndex, seat.DeckNo);
  return z === 1 ? "upper" : "lower";
}

function normalizeApiSeat(seat, index) {
  const column = numberFrom(seat.ColumnNo, seat.ColumnNumber, seat.Column, seat.SeatColumn, seat.column, seat.ColumnIndex, seat.ColNo, seat.Col, seat.X, seat.x);
  const row = numberFrom(seat.RowNo, seat.RowNumber, seat.Row, seat.SeatRow, seat.row, seat.RowIndex, seat.RowId, seat.Y, seat.y);
  if (!Number.isFinite(column) || !Number.isFinite(row)) return null;
  const width = Math.max(1, numberFrom(seat.Width, seat.SeatWidth, seat.width, seat.w) || 1);
  const height = Math.max(1, numberFrom(seat.Height, seat.SeatHeight, seat.height, seat.h) || 1);
  const id = String(seat.SeatName || seat.SeatNo || seat.SeatNumber || seat.id || seat.SeatIndex || index + 1);
  const deck = booleanFrom(seat.IsUpper, seat.Upper, seat.IsUpperDeck) ? "upper" : detectSeatDeck(seat);
  const rawType = String(seat.SeatType || seat.Type || seat.BerthType || seat.rawType || "").toLowerCase();
  const detectedVisualType = seatVisualType(seat, rawType);
  const explicitIsBerth = booleanFrom(
    seat.isBerth,
    seat.IsBerth,
    seat.is_berth,
    seat.IsSleeper,
    seat.isSleeper,
    seat.IsSleeperSeat
  );
  const isBerth = deck === "upper" || explicitIsBerth || detectedVisualType === "berth";
  const visualType = isBerth ? "berth" : detectedVisualType;
  const finalWidth = width;
  const finalHeight = isBerth && width === 1 && height === 1 ? 2 : height;
  return {
    ...seat,
    id,
    label: seat.SeatName || seat.label || id,
    deck,
    row,
    column,
    width: finalWidth,
    height: finalHeight,
    isBerth,
    visualType,
    isWalkway: Boolean(seat.isWalkway || seat.IsWalkway)
  };
}

function seatFareAmount(seat, fallbackFare = 0) {
  const candidates = [
    seat?.SeatFare,
    seat?.Price?.OfferedPrice,
    seat?.Price?.PublishedPrice,
    seat?.Price?.BasePrice,
    seat?.Price?.Price,
    seat?.fare,
    seat?.Fare,
    seat?.OfferedFare,
    seat?.PublishedFare
  ];
  for (const value of candidates) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return Number(fallbackFare) || 0;
}

function selectedSeatFareTotal(route, selectedSeatIds) {
  const seatIds = new Set(selectedSeatIds || []);
  if (!seatIds.size) return 0;
  const normalizedSeats = extractSeatList(route?.seatLayout).map(normalizeApiSeat).filter(Boolean);
  const byId = new Map(normalizedSeats.map((seat) => [seat.id, seat]));
  return [...seatIds].reduce((sum, seatId) => {
    const seat = byId.get(seatId);
    return sum + seatFareAmount(seat, route?.price);
  }, 0);
}

function seatIntervals(seats) {
  const byColumn = new Map();
  for (const seat of seats) {
    const start = seat.column;
    const end = seat.column + (seat.width || 1) - 1;
    const current = byColumn.get(start) || { start, end, count: 0 };
    current.end = Math.max(current.end, end);
    current.count += 1;
    byColumn.set(start, current);
  }
  return [...byColumn.values()].sort((a, b) => a.start - b.start);
}

function aisleAfterColumn(seats) {
  const intervals = seatIntervals(seats);
  if (intervals.length < 2) return null;
  let largestGap = { size: 0, after: null };
  for (let index = 0; index < intervals.length - 1; index += 1) {
    const gap = intervals[index + 1].start - intervals[index].end - 1;
    if (gap > largestGap.size) largestGap = { size: gap, after: intervals[index].end };
  }
  if (largestGap.size > 0) return largestGap.after;
  if (intervals.length >= 3) {
    const leftBlockSize = intervals.length === 3 ? 1 : Math.floor(intervals.length / 2);
    return intervals[Math.max(0, leftBlockSize - 1)].end;
  }
  return null;
}

function makeSeatFootprint(seat) {
  const width = Math.max(1, Math.round(seat.width || 1));
  const height = Math.max(1, Math.round(seat.height || 1));
  return { width, height };
}

function collides(seat, placed) {
  const { width, height } = makeSeatFootprint(seat);
  const left = seat.column;
  const right = left + width - 1;
  const top = seat.row;
  const bottom = top + height - 1;
  return placed.some((other) => {
    const otherSize = makeSeatFootprint(other);
    const otherLeft = other.column;
    const otherRight = otherLeft + otherSize.width - 1;
    const otherTop = other.row;
    const otherBottom = otherTop + otherSize.height - 1;
    return left <= otherRight && right >= otherLeft && top <= otherBottom && bottom >= otherTop;
  });
}

function resolveSeatCollisions(seats) {
  const placed = [];
  const ordered = [...seats].sort((a, b) => a.row - b.row || a.column - b.column || String(a.id).localeCompare(String(b.id)));
  for (const seat of ordered) {
    const shiftedSeat = { ...seat };
    let guard = 0;
    while (collides(shiftedSeat, placed) && guard < 40) {
      shiftedSeat.column += 1;
      guard += 1;
    }
    placed.push(shiftedSeat);
  }
  return placed;
}

function seatLabelParts(seat) {
  const label = String(seat.SeatName || seat.label || seat.id || "").trim().toUpperCase();
  const numericOnly = label.match(/^(\d+)$/);
  if (numericOnly) return { number: Number(numericOnly[1]), prefix: "", suffix: "N", label };
  const numberFirst = label.match(/^(\d+)([A-Z]+)$/);
  if (numberFirst) return { number: Number(numberFirst[1]), prefix: "", suffix: numberFirst[2], label };
  const letterFirst = label.match(/^([A-Z]+)(\d+)$/);
  if (letterFirst) return { number: Number(letterFirst[2]), prefix: letterFirst[1], suffix: letterFirst[1], label };
  return null;
}

function suffixOrder(suffix, suffixes) {
  const bdsdLowerOrder = ["B", "A", "N", "L"];
  const upperDeckOrder = ["UC", "UB", "UA", "U", "SU"];
  const lowerDeckOrder = ["E", "G", "D", "F", "LA", "LB", "LC"];
  const mixedOrder = ["C", "B", "A", "E", "G", "D", "F", "LA", "LB", "LC", "U", "L"];
  const order = suffixes.some((item) => upperDeckOrder.includes(item))
    ? upperDeckOrder
    : suffixes.some((item) => bdsdLowerOrder.includes(item))
      ? bdsdLowerOrder
      : suffixes.some((item) => lowerDeckOrder.includes(item))
      ? lowerDeckOrder
      : mixedOrder;
  const index = order.indexOf(suffix);
  return index >= 0 ? index : order.length;
}

function suffixSlot(suffix, suffixes) {
  if (suffixes.some((item) => ["B", "A", "N", "L"].includes(item))) {
    const bdsdLowerSlots = {
      B: { row: 1, subColumn: 1 },
      A: { row: 2, subColumn: 1 },
      N: { row: 1, subColumn: 1 },
      L: { row: 3, subColumn: 1, sleeper: true }
    };
    return bdsdLowerSlots[suffix] || null;
  }
  if (suffixes.some((item) => ["E", "G", "D", "F", "LA", "LB", "LC"].includes(item))) {
    const lowerSlots = {
      E: { row: 1, subColumn: 1 },
      G: { row: 1, subColumn: 2 },
      D: { row: 2, subColumn: 1 },
      F: { row: 2, subColumn: 2 },
      LA: { row: 3, subColumn: 1 },
      LB: { row: 3, subColumn: 2 },
      LC: { row: 4, subColumn: 1 }
    };
    return lowerSlots[suffix] || null;
  }
  if (suffixes.some((item) => ["UC", "UB", "UA"].includes(item))) {
    const upperSlots = {
      UC: { row: 1, subColumn: 1 },
      UB: { row: 2, subColumn: 1 },
      UA: { row: 3, subColumn: 1 }
    };
    return upperSlots[suffix] || null;
  }
  return null;
}

function isSingleSideBerthSuffix(suffix) {
  return ["L", "S", "SL", "SU"].includes(suffix);
}

function buildSuffixLaneLayout(parsed, laneRows, options = {}) {
  const groupKeys = [...new Set(parsed.map((item) => item.parts.number))].sort((a, b) => a - b);
  const columnByNumber = new Map(groupKeys.map((number, index) => [number, (index * (options.groupSpan || 2)) + 1]));
  const columns = Math.max(1, groupKeys.length * (options.groupSpan || 2));
  const suffixes = Object.keys(laneRows).filter((suffix) => suffix !== "DEFAULT");
  const existingLabels = new Set(parsed.map((item) => item.parts.label));
  const toLayoutSeat = ({ seat, parts, virtual = false }) => {
    const lane = laneRows[parts.suffix] || laneRows.DEFAULT || { row: 1, width: 1, visualType: "seat" };
    const isBerth = lane.visualType === "berth" || Boolean(lane.isBerth);
    const baseColumn = columnByNumber.get(parts.number) || 1;
    return {
      ...seat,
      id: seat.id || parts.label,
      label: seat.label || parts.label,
      row: lane.row,
      column: baseColumn + (lane.offset || 0),
      width: lane.width || (isBerth ? 2 : 1),
      height: 1,
      isBerth,
      visualType: isBerth ? "berth" : "seat",
      isUnavailable: Boolean(seat.isUnavailable || virtual),
      isVirtualSeat: virtual
    };
  };
  const orderedSeats = parsed.map((item) => toLayoutSeat(item));
  if (options.fillMissing) {
    groupKeys.forEach((number) => {
      suffixes.forEach((suffix) => {
        const label = `${number}${suffix}`;
        if (existingLabels.has(label)) return;
        orderedSeats.push(toLayoutSeat({
          virtual: true,
          seat: { id: label, label, SeatName: label },
          parts: { number, suffix, label }
        }));
      });
    });
  }
  const gridGap = columns > 14 ? 6 : 8;
  const targetWidth = options.targetWidth || (columns > 14 ? 760 : 680);
  const seatTrack = Math.max(options.minTrack || 24, Math.min(options.maxTrack || 42, Math.floor((targetWidth - Math.max(0, columns - 1) * gridGap) / Math.max(columns, 1))));
  const rows = Math.max(...Object.values(laneRows).map((lane) => lane.row || 1), options.aisleRow || 1);
  const rowTracks = Array.from({ length: rows }, (_, index) => index + 1 === options.aisleRow ? `${options.aisleTrack || 30}px` : `${seatTrack}px`).join(" ");
  return {
    seats: orderedSeats.sort((a, b) => a.row - b.row || a.column - b.column || String(a.id).localeCompare(String(b.id))),
    rows,
    columns,
    columnTracks: Array.from({ length: columns }, () => `${seatTrack}px`).join(" "),
    rowTracks,
    aisleRow: options.aisleRow,
    gridGap: `${gridGap}px ${gridGap}px`,
    rotated: false,
    orderedByLabel: true
  };
}

function laneFromApi(parsed, suffix, row) {
  const laneSeats = parsed.filter((item) => item.parts.suffix === suffix);
  const berthLike = laneSeats.some((item) => item.seat.isBerth || item.seat.visualType === "berth" || (item.seat.width || 1) > 1 || (item.seat.height || 1) > 1);
  return { row, width: berthLike ? 2 : 1, visualType: berthLike ? "berth" : "seat" };
}

function buildNumericOnlyLayout(parsed) {
  const ordered = [...parsed].sort((a, b) => a.parts.number - b.parts.number);
  const hasBerths = ordered.some((item) => item.seat.isBerth || item.seat.visualType === "berth");
  const groupSize = hasBerths ? 3 : 4;
  const groupCount = Math.ceil(ordered.length / groupSize);
  const columns = Math.max(1, groupCount * (hasBerths ? 2 : 2));
  const orderedSeats = ordered.map(({ seat, parts }, index) => {
    const groupIndex = Math.floor(index / groupSize);
    const remainder = index % groupSize;
    const row = hasBerths
      ? (remainder === 0 ? 1 : remainder === 1 ? 2 : 4)
      : (remainder === 0 ? 1 : remainder === 1 ? 2 : remainder === 2 ? 4 : 5);
    const column = (groupIndex * 2) + (hasBerths || remainder < 2 ? 1 : 2);
    return {
      ...seat,
      row,
      column,
      width: hasBerths ? 2 : 1,
      height: 1,
      isBerth: hasBerths,
      visualType: hasBerths ? "berth" : "seat"
    };
  });
  const gridGap = columns > 14 ? 6 : 8;
  const targetWidth = columns > 14 ? 760 : 650;
  const seatTrack = Math.max(columns > 14 ? 20 : 24, Math.min(hasBerths ? 38 : 34, Math.floor((targetWidth - Math.max(0, columns - 1) * gridGap) / Math.max(columns, 1))));
  const rows = hasBerths ? 4 : 5;
  const rowTracks = hasBerths
    ? `${seatTrack}px ${seatTrack}px 28px ${seatTrack}px`
    : `${seatTrack}px ${seatTrack}px 28px ${seatTrack}px ${seatTrack}px`;
  return {
    seats: orderedSeats,
    rows,
    columns,
    columnTracks: Array.from({ length: columns }, () => `${seatTrack}px`).join(" "),
    rowTracks,
    aisleRow: 3,
    gridGap: `${gridGap}px ${gridGap}px`,
    rotated: false,
    orderedByLabel: true
  };
}

function buildCompactDeckSeriesLayout(parsed, suffixSet) {
  const numericSeats = parsed
    .filter((item) => item.parts.suffix === "N")
    .sort((a, b) => a.parts.number - b.parts.number);
  const deckSeries = parsed
    .filter((item) => item.parts.suffix !== "N")
    .sort((a, b) => a.parts.number - b.parts.number);
  const isLowerMixedSeries = numericSeats.length > 0 && deckSeries.length > 0 &&
    [...suffixSet].every((suffix) => ["N", "LD"].includes(suffix));
  const isSingleDeckSeries = numericSeats.length === 0 && suffixSet.size === 1 &&
    ["LD", "UD"].includes(deckSeries[0]?.parts.suffix);

  if (!isLowerMixedSeries && !isSingleDeckSeries) return null;

  if (isLowerMixedSeries) {
    const seats = [
      ...numericSeats.map(({ seat }, index) => ({
        ...seat,
        row: (index % 2) + 1,
        column: Math.floor(index / 2) + 1,
        width: 1,
        height: 1
      })),
      ...deckSeries.map(({ seat }, index) => ({
        ...seat,
        row: 4,
        column: seat.isBerth ? (index * 2) + 1 : index + 1,
        width: seat.isBerth ? 2 : 1,
        height: 1
      }))
    ];
    return {
      seats,
      rows: 4,
      columns: Math.max(
        Math.ceil(numericSeats.length / 2),
        deckSeries.reduce((width, { seat }) => width + (seat.isBerth ? 2 : 1), 0)
      ),
      aisleRow: 3,
      rotated: false,
      orderedByLabel: true,
      labelPattern: "number-with-lower-deck-series"
    };
  }

  const seatsPerSide = Math.ceil(deckSeries.length / 2);
  const allUpperBerths = deckSeries.every(({ seat }) => seat.isBerth);
  if (allUpperBerths) {
    const berthRows = [1, 2, 4];
    return {
      seats: deckSeries.map(({ seat }, index) => ({
        ...seat,
        row: berthRows[index % berthRows.length],
        column: (Math.floor(index / berthRows.length) * 2) + 1,
        width: 2,
        height: 1,
        isBerth: true,
        visualType: "berth"
      })),
      rows: 4,
      columns: Math.ceil(deckSeries.length / berthRows.length) * 2,
      aisleRow: 3,
      rotated: false,
      orderedByLabel: true,
      labelPattern: "upper-2-plus-1-sleeper"
    };
  }
  const topSeries = deckSeries.slice(0, seatsPerSide);
  const bottomSeries = deckSeries.slice(seatsPerSide);
  const seriesColumn = (series, index) => series
    .slice(0, index)
    .reduce((column, { seat }) => column + (seat.isBerth ? 2 : 1), 1);
  return {
    seats: deckSeries.map(({ seat }, index) => {
      const top = index < seatsPerSide;
      const series = top ? topSeries : bottomSeries;
      const seriesIndex = top ? index : index - seatsPerSide;
      return {
      ...seat,
      row: top ? 1 : 4,
      column: seriesColumn(series, seriesIndex),
      width: seat.isBerth ? 2 : 1,
      height: 1
    }; }),
    rows: 4,
    columns: Math.max(
      topSeries.reduce((width, { seat }) => width + (seat.isBerth ? 2 : 1), 0),
      bottomSeries.reduce((width, { seat }) => width + (seat.isBerth ? 2 : 1), 0)
    ),
    aisleRow: 3,
    rotated: false,
    orderedByLabel: true,
    labelPattern: "deck-series"
  };
}

function buildLabelOrderedDeckLayout(seats) {
  const parsed = seats.map((seat) => ({ seat, parts: seatLabelParts(seat) })).filter((item) => item.parts);
  if (parsed.length < Math.max(4, Math.ceil(seats.length * 0.7))) return null;

  const suffixList = [...new Set(parsed.map((item) => item.parts.suffix))];
  const suffixSet = new Set(suffixList);
  const compactDeckSeries = buildCompactDeckSeriesLayout(parsed, suffixSet);
  if (compactDeckSeries) return compactDeckSeries;
  if (suffixList.length === 1 && suffixSet.has("N")) {
    return buildNumericOnlyLayout(parsed);
  }
  if (["E", "G", "D", "F"].every((suffix) => suffixSet.has(suffix)) && ["LA", "LB", "LC"].some((suffix) => suffixSet.has(suffix))) {
    return buildSuffixLaneLayout(parsed, {
      E: { row: 1, offset: 0, width: 1, visualType: "seat" },
      G: { row: 1, offset: 1, width: 1, visualType: "seat" },
      D: { row: 2, offset: 0, width: 1, visualType: "seat" },
      F: { row: 2, offset: 1, width: 1, visualType: "seat" },
      LA: laneFromApi(parsed, "LA", 4),
      LB: laneFromApi(parsed, "LB", 4),
      LC: laneFromApi(parsed, "LC", 4)
    }, { aisleRow: 3, groupSpan: 2, minTrack: 22, maxTrack: 34, targetWidth: 650, aisleTrack: 28, fillMissing: false });
  }
  if (["LA", "LB", "LC"].every((suffix) => suffixSet.has(suffix))) {
    return buildSuffixLaneLayout(parsed, {
      LA: laneFromApi(parsed, "LA", 1),
      LB: laneFromApi(parsed, "LB", 2),
      LC: laneFromApi(parsed, "LC", 4)
    }, { aisleRow: 3, groupSpan: 2, minTrack: 22, maxTrack: 34, targetWidth: 650, aisleTrack: 28, fillMissing: true });
  }
  if (suffixSet.has("UC") && suffixSet.has("UB")) {
    return buildSuffixLaneLayout(parsed, {
      UC: laneFromApi(parsed, "UC", 1),
      UB: laneFromApi(parsed, "UB", 2),
      UA: laneFromApi(parsed, "UA", 4)
    }, { aisleRow: 3, groupSpan: 2, minTrack: 22, maxTrack: 34, targetWidth: 650, aisleTrack: 28, fillMissing: suffixSet.has("UA") });
  }
  const hasOnlyUpperSeries = suffixList.length === 1 && suffixList[0] === "U";
  const hasUpperBerthSeries = suffixList.some((suffix) => ["U", "SU", "UA", "UB", "UC"].includes(suffix)) && suffixList.every((suffix) => ["U", "SU", "UA", "UB", "UC"].includes(suffix));
  if (!hasOnlyUpperSeries && hasUpperBerthSeries) {
    const upperRows = [...new Set(parsed.map((item) => item.seat.row))].sort((a, b) => a - b);
    const upperRowMap = new Map(upperRows.map((row, index) => [row, index === 0 ? 1 : index === 1 ? 2 : 4]));
    const upperColumns = [...new Set(parsed.map((item) => item.seat.column))].sort((a, b) => a - b);
    const upperColumnMap = new Map(upperColumns.map((column, index) => [column, (index * 2) + 1]));
    const columns = Math.max(2, upperColumns.length * 2);
    const orderedSeats = parsed.map(({ seat, parts }) => ({
      ...seat,
      row: upperRowMap.get(seat.row) || (parts.suffix === "U" ? 1 : 3),
      column: upperColumnMap.get(seat.column) || ((parts.number - 1) * 2) + 1,
      width: 2,
      height: 1,
      isBerth: true,
      visualType: "berth"
    }));
    const maxNumber = Math.max(...parsed.map((item) => item.parts.number).filter(Number.isFinite), 0);
    upperColumns.forEach((column, index) => {
      const label = `U${maxNumber + index + 1}`;
      orderedSeats.push({
        id: label,
        label,
        SeatName: label,
        row: 4,
        column: upperColumnMap.get(column) || (index * 2) + 1,
        width: 2,
        height: 1,
        isBerth: true,
        visualType: "berth",
        isUnavailable: true,
        isVirtualSeat: true
      });
    });
    const gridGap = 7;
    const targetWidth = 720;
    const compactSeatTrack = Math.max(18, Math.min(34, Math.floor((targetWidth - Math.max(0, columns - 1) * gridGap) / Math.max(columns, 1))));
    return {
      seats: orderedSeats.sort((a, b) => a.row - b.row || a.column - b.column || String(a.id).localeCompare(String(b.id))),
      rows: 4,
      columns,
      columnTracks: Array.from({ length: columns }, () => `${compactSeatTrack}px`).join(" "),
      rowTracks: `${compactSeatTrack}px ${compactSeatTrack}px 32px ${compactSeatTrack}px`,
      aisleRow: 3,
      rotated: false,
      orderedByLabel: true,
      labelPattern: "upper-u-pair"
    };
  }
  if (hasOnlyUpperSeries) {
    const orderedNumbers = [...new Set(parsed.map((item) => item.parts.number))].sort((a, b) => a - b);
    const groupCount = Math.ceil(orderedNumbers.length / 2);
    const columns = groupCount * 2;
    const numberToPair = new Map(orderedNumbers.map((number, index) => [number, Math.floor(index / 2)]));
    const maxNumber = Math.max(...orderedNumbers);
    const orderedSeats = parsed.map(({ seat, parts }) => {
      const pairIndex = numberToPair.get(parts.number) || 0;
      return {
        ...seat,
        row: parts.number % 2 === 0 ? 1 : 2,
        column: (pairIndex * 2) + 1,
        width: 2,
        height: 1,
        isBerth: true,
        visualType: "berth"
      };
    });
    for (let index = 0; index < groupCount; index += 1) {
      const label = `U${maxNumber + index + 1}`;
      orderedSeats.push({
        id: label,
        label,
        SeatName: label,
        row: 4,
        column: (index * 2) + 1,
        width: 2,
        height: 1,
        isBerth: true,
        visualType: "berth",
        isUnavailable: true,
        isVirtualSeat: true
      });
    }
    const gridGap = 8;
    const targetWidth = 680;
    const compactSeatTrack = Math.max(32, Math.min(46, Math.floor((targetWidth - Math.max(0, columns - 1) * gridGap) / Math.max(columns, 1))));
    return {
      seats: orderedSeats.sort((a, b) => a.row - b.row || a.column - b.column || String(a.id).localeCompare(String(b.id))),
      rows: 4,
      columns,
      columnTracks: Array.from({ length: columns }, () => `${compactSeatTrack}px`).join(" "),
      rowTracks: `${compactSeatTrack}px ${compactSeatTrack}px 34px ${compactSeatTrack}px`,
      aisleRow: 3,
      rotated: false,
      orderedByLabel: true,
      labelPattern: "upper-u-pair"
    };
  }

  const suffixes = suffixList.sort((a, b) => suffixOrder(a, suffixList) - suffixOrder(b, suffixList) || a.localeCompare(b));
  const slotMap = new Map(suffixes.map((suffix, index) => [suffix, suffixSlot(suffix, suffixes) || { row: index + 1, subColumn: 1 }]));
  const numbers = [...new Set(parsed.map((item) => item.parts.number))].sort((a, b) => a - b);
  const groupWidth = Math.max(...[...slotMap.values()].map((slot) => slot.subColumn || 1));
  const hasSingleSideBerths = suffixes.some(isSingleSideBerthSuffix);
  const hasBdsdLowerSeries = suffixes.some((suffix) => ["B", "A", "L"].includes(suffix)) || (suffixes.includes("N") && hasSingleSideBerths) || (suffixes.includes("R") && hasSingleSideBerths);
  if (hasBdsdLowerSeries) {
    const topRows = [...new Set(parsed.filter((item) => !isSingleSideBerthSuffix(item.parts.suffix)).map((item) => item.seat.row))].sort((a, b) => a - b);
    const rowToSeaterRow = new Map(topRows.map((row, index) => [row, index === 0 ? 1 : 2]));
    const topColumns = [...new Set(parsed.filter((item) => !isSingleSideBerthSuffix(item.parts.suffix)).map((item) => item.seat.column))].sort((a, b) => a - b);
    const topColumnMap = new Map(topColumns.map((column, index) => [column, index + 1]));
    const singleSideSeats = parsed
      .filter((item) => isSingleSideBerthSuffix(item.parts.suffix))
      .sort((a, b) => a.seat.column - b.seat.column || a.parts.number - b.parts.number);
    const singleSideColumnMap = new Map(singleSideSeats.map((item, index) => [item.parts.label, (index * 2) + 1]));
    const columns = Math.max(1, topColumns.length, singleSideSeats.length * 2);
    const orderedSeats = parsed.map(({ seat, parts }) => {
      const isSingleSide = isSingleSideBerthSuffix(parts.suffix);
      const isBerth = isSingleSide || Boolean(seat.isBerth);
      const seaterRow = parts.suffix === "B" ? 1 : parts.suffix === "A" ? 2 : rowToSeaterRow.get(seat.row) || 1;
      return {
        ...seat,
        row: isSingleSide ? 4 : seaterRow,
        column: isSingleSide ? singleSideColumnMap.get(parts.label) || ((parts.number - 1) * 2) + 1 : topColumnMap.get(seat.column) || parts.number,
        width: isSingleSide && isBerth ? 2 : 1,
        height: 1,
        isBerth,
        visualType: isBerth ? "berth" : "seat"
      };
    });
    const gridGap = columns > 18 ? 6 : 8;
    const targetWidth = columns > 18 ? 760 : 680;
    const seatTrack = Math.max(columns > 18 ? 18 : 28, Math.min(42, Math.floor((targetWidth - Math.max(0, columns - 1) * gridGap) / Math.max(columns, 1))));
    return {
      seats: orderedSeats.sort((a, b) => a.row - b.row || a.column - b.column || String(a.id).localeCompare(String(b.id))),
      rows: 4,
      columns,
      columnTracks: Array.from({ length: columns }, () => `${seatTrack}px`).join(" "),
      rowTracks: `${seatTrack}px ${seatTrack}px 34px ${seatTrack}px`,
      aisleRow: 3,
      rotated: false,
      orderedByLabel: true,
      labelPattern: "lower-numeric-single-berth"
    };
  }
  const lowerSeatNumbers = hasBdsdLowerSeries
    ? numbers.filter((number) => parsed.some((item) => item.parts.number === number && item.parts.suffix !== "L"))
    : numbers;
  const lowerAisleAfter = hasBdsdLowerSeries ? Math.ceil(lowerSeatNumbers.length / 2) : null;
  const numberToColumn = new Map(lowerSeatNumbers.map((number, index) => {
    const baseColumn = (index * groupWidth) + 1;
    return [number, hasBdsdLowerSeries && index >= lowerAisleAfter ? baseColumn + 1 : baseColumn];
  }));
  const rowCount = Math.max(...[...slotMap.values()].map((slot) => slot.row || 1));
  const columns = Math.max(1, lowerSeatNumbers.length * groupWidth, ...parsed.map(({ parts }) => {
    const slot = slotMap.get(parts.suffix);
    if (hasBdsdLowerSeries && parts.suffix === "L") {
      const sleeperBaseColumn = ((parts.number - 1) * 2) + (slot?.subColumn || 1);
      return parts.number > Math.ceil(numbers.filter((number) => parsed.some((item) => item.parts.number === number && item.parts.suffix === "L")).length / 2)
        ? sleeperBaseColumn + 1
        : sleeperBaseColumn;
    }
    return (numberToColumn.get(parts.number) || 1) + ((slot?.subColumn || 1) - 1);
  }));
  const hasBerths = seats.some((seat) => seat.isBerth);
  const targetWidth = hasBerths ? 690 : 580;
  const gridGap = 8;
  const aisleColumn = hasBdsdLowerSeries ? lowerAisleAfter + 1 : null;
  const aisleTrack = 64;
  const trackCount = aisleColumn ? columns - 1 : columns;
  const compactSeatTrack = Math.max(24, Math.min(34, Math.floor((targetWidth - (aisleColumn ? aisleTrack : 0) - Math.max(0, columns - 1) * gridGap) / Math.max(trackCount, 1))));
  const rowTrack = hasBerths ? "24px" : "30px";
  const columnTracks = Array.from({ length: columns }, (_, index) => aisleColumn && index + 1 === aisleColumn ? `${aisleTrack}px` : `${compactSeatTrack}px`).join(" ");
  const sleeperNumbers = numbers.filter((number) => parsed.some((item) => item.parts.number === number && item.parts.suffix === "L"));
  const sleeperAisleAfter = Math.ceil(sleeperNumbers.length / 2);
  const orderedSeats = parsed.map(({ seat, parts }) => {
    const slot = slotMap.get(parts.suffix) || { row: 1, subColumn: 1 };
    const column = hasBdsdLowerSeries && parts.suffix === "L"
      ? (((parts.number - 1) * 2) + (slot.subColumn || 1) + (parts.number > sleeperAisleAfter ? 1 : 0))
      : (numberToColumn.get(parts.number) || 1) + ((slot.subColumn || 1) - 1);
    return {
      ...seat,
      row: slot.row || 1,
      column,
      width: hasBdsdLowerSeries && parts.suffix === "L" ? 2 : 1,
      height: slot.sleeper ? 2 : 1,
      isBerth: Boolean(slot.sleeper),
      visualType: slot.sleeper ? "berth" : "seat"
    };
  });
  const actualRowCount = Math.max(...orderedSeats.map((seat) => seat.row + (seat.height || 1) - 1));

  return {
    seats: orderedSeats.sort((a, b) => a.row - b.row || a.column - b.column || String(a.id).localeCompare(String(b.id))),
    rows: Math.max(rowCount, actualRowCount),
    columns,
    aisleColumn,
    columnTracks,
    rowTrack,
    rotated: false,
    orderedByLabel: true
  };
}

function buildGeometryDeckLayout(measuredSeats) {
  const rawRows = [...new Set(measuredSeats.map((seat) => seat.row))].sort((a, b) => a - b);
  const rawColumns = [...new Set(measuredSeats.map((seat) => seat.column))].sort((a, b) => a - b);
  const shouldRotateLandscape = rawRows.length > rawColumns.length + 2 && rawRows.length > 5;
  const orientedSeats = measuredSeats.map((seat) => shouldRotateLandscape ? {
    ...seat,
    row: seat.column,
    column: seat.row,
    width: seat.height || 1,
    height: seat.width || 1
  } : seat);

  const minRow = Math.min(...orientedSeats.map((seat) => seat.row));
  const minColumn = Math.min(...orientedSeats.map((seat) => seat.column));
  const shiftedSeats = orientedSeats.map((seat) => ({
    ...seat,
    row: Math.max(1, Math.round(seat.row - minRow + 1)),
    column: Math.max(1, Math.round(seat.column - minColumn + 1)),
    width: Math.max(1, Math.round(seat.width || 1)),
    height: Math.max(1, Math.round(seat.height || 1))
  }));
  const intervals = seatIntervals(shiftedSeats);
  const allBerths = shiftedSeats.every((seat) => seat.isBerth);
  const largestGap = intervals.reduce((best, interval, index) => {
    const next = intervals[index + 1];
    if (!next) return best;
    const gap = next.start - interval.end - 1;
    return gap > best.gap ? { gap, index } : best;
  }, { gap: 0, index: -1 });
  const aisleAfterIndex = !allBerths && intervals.length >= 2
    ? (largestGap.index >= 0 ? largestGap.index : Math.max(0, Math.floor(intervals.length / 2) - 1))
    : -1;
  const columnStartToLane = new Map(intervals.map((interval, index) => [
    interval.start,
    index + 1 + (aisleAfterIndex >= 0 && index > aisleAfterIndex ? 1 : 0)
  ]));
  const aisleColumn = aisleAfterIndex >= 0 ? aisleAfterIndex + 2 : null;
  const normalizedSeats = shiftedSeats.map((seat) => ({
    ...seat,
    column: columnStartToLane.get(seat.column) || seat.column
  }));
  const compressedRowStarts = [...new Set(normalizedSeats.map((seat) => seat.row))].sort((a, b) => a - b);
  const rowStartToLane = new Map(compressedRowStarts.map((row, index) => [row, index + 1]));
  const rowCompressedSeats = normalizedSeats.map((seat) => ({
    ...seat,
    row: rowStartToLane.get(seat.row) || seat.row
  }));
  const collisionSafeSeats = resolveSeatCollisions(rowCompressedSeats);
  const initialRowCount = Math.max(...collisionSafeSeats.map((seat) => seat.row + (seat.height || 1) - 1));
  const hasBerths = collisionSafeSeats.some((seat) => seat.isBerth);
  const allBerthRows = collisionSafeSeats.every((seat) => seat.isBerth) && initialRowCount >= 3;
  const geometryAisleRow = allBerthRows ? initialRowCount : null;
  const layoutSeats = geometryAisleRow
    ? collisionSafeSeats.map((seat) => ({ ...seat, row: seat.row >= geometryAisleRow ? seat.row + 1 : seat.row }))
    : collisionSafeSeats;
  const rowCount = geometryAisleRow ? initialRowCount + 1 : initialRowCount;
  const columns = Math.max(...layoutSeats.map((seat) => seat.column + (seat.width || 1) - 1));
  const gridGap = 8;
  const targetWidth = hasBerths ? 560 : 520;
  const targetHeight = hasBerths ? 108 : 86;
  const compactSeatTrack = Math.max(hasBerths ? 16 : 18, Math.min(hasBerths ? 38 : 30, Math.floor((targetWidth - Math.max(0, columns - 1) * gridGap) / Math.max(columns, 1))));
  const compactRowTrack = Math.max(hasBerths ? 18 : 20, Math.min(hasBerths ? 32 : 28, Math.floor((targetHeight - Math.max(0, rowCount - 1) * gridGap) / Math.max(rowCount, 1))));
  const aisleTrack = Math.max(20, Math.min(28, compactSeatTrack));
  const seatTrack = `${compactSeatTrack}px`;
  const rowTrack = `${compactRowTrack}px`;
  const columnTracks = Array.from({ length: columns }, (_, index) => (index + 1 === aisleColumn ? `${aisleTrack}px` : seatTrack)).join(" ");
  const rowTracks = geometryAisleRow
    ? Array.from({ length: rowCount }, (_, index) => index + 1 === geometryAisleRow ? `${Math.max(28, compactRowTrack)}px` : rowTrack).join(" ")
    : undefined;
  return {
    seats: layoutSeats.sort((a, b) => a.row - b.row || a.column - b.column),
    rows: rowCount,
    columns,
    aisleRow: geometryAisleRow || undefined,
    columnTracks,
    rowTracks,
    rowTrack,
    rotated: shouldRotateLandscape,
    layoutSource: "geometry"
  };
}

function isUsableGeometryLayout(layout, originalSeats) {
  if (!layout?.seats?.length || layout.seats.length < Math.max(1, Math.floor(originalSeats.length * 0.9))) return false;
  if (!layout.rows || !layout.columns) return false;
  if (layout.rows > 7 || layout.columns > 32) return false;
  const maxArea = layout.rows * layout.columns;
  if (maxArea > 180) return false;
  return true;
}

function shouldPreferGeometryLayout(measuredSeats, geometryLayout, labelLayout) {
  if (!isUsableGeometryLayout(geometryLayout, measuredSeats)) return false;
  if (!labelLayout) return true;
  if (labelLayout.aisleRow || labelLayout.aisleColumn) return false;
  const suffixes = new Set(measuredSeats.map((seat) => seatLabelParts(seat)?.suffix).filter(Boolean));
  const stableLabelFamilies = [
    ["E", "G", "D", "F"],
    ["LA", "LB", "LC"],
    ["UA", "UB", "UC"]
  ];
  const hasStableLabelFamily = stableLabelFamilies.some((family) => family.some((suffix) => suffixes.has(suffix)));
  const riskyLabelFamily = [...suffixes].every((suffix) => ["N", "L", "U", "SL", "SU", "S"].includes(suffix));
  return riskyLabelFamily && !hasStableLabelFamily && geometryLayout.aisleRow;
}

function canonicalSeatOrder(seats) {
  return [...seats].sort((a, b) =>
    String(a.label || a.id).localeCompare(String(b.label || b.id), undefined, { numeric: true, sensitivity: "base" })
  );
}

function buildCanonicalUpperSleeperLayout(seats) {
  const ordered = canonicalSeatOrder(seats);
  const berthRows = [1, 2, 4, 5];
  return {
    seats: ordered.map((seat, index) => ({
      ...seat,
      row: berthRows[index % berthRows.length],
      column: (Math.floor(index / berthRows.length) * 2) + 1,
      width: 2,
      height: 1,
      isBerth: true,
      visualType: "berth"
    })),
    rows: 5,
    columns: Math.max(2, Math.ceil(ordered.length / berthRows.length) * 2),
    aisleRow: 3,
    rotated: false,
    layoutSource: "canonical-upper-2-plus-2"
  };
}

function buildCanonicalLowerSleeperLayout(seats) {
  const ordered = canonicalSeatOrder(seats);
  const rawLaneCount = new Set(ordered.map((seat) => seat.row)).size;
  const berthRows = rawLaneCount === 4 ? [1, 2, 4, 5] : [1, 2, 4];
  return {
    seats: ordered.map((seat, index) => ({
      ...seat,
      row: berthRows[index % berthRows.length],
      column: (Math.floor(index / berthRows.length) * 2) + 1,
      width: 2,
      height: 1,
      isBerth: true,
      visualType: "berth"
    })),
    rows: Math.max(...berthRows),
    columns: Math.max(2, Math.ceil(ordered.length / berthRows.length) * 2),
    aisleRow: 3,
    rotated: false,
    layoutSource: `canonical-lower-sleeper-${berthRows.length === 4 ? "2-plus-2" : "2-plus-1"}`
  };
}

function buildCanonicalLowerSeaterLayout(seats, seatRows = [1, 2, 4, 5]) {
  const ordered = canonicalSeatOrder(seats);
  return {
    seats: ordered.map((seat, index) => ({
      ...seat,
      row: seatRows[index % seatRows.length],
      column: Math.floor(index / seatRows.length) + 1,
      width: 1,
      height: 1,
      isBerth: false,
      visualType: seat.visualType === "horizontal-seat" ? "horizontal-seat" : "seat"
    })),
    rows: Math.max(...seatRows),
    columns: Math.max(1, Math.ceil(ordered.length / seatRows.length)),
    aisleRow: 3,
    rotated: false,
    layoutSource: "canonical-lower-2-plus-2"
  };
}

function buildDeckLayout(seats) {
  const measuredSeats = seats.map(normalizeApiSeat).filter(Boolean);
  if (!measuredSeats.length) return { seats: [], rows: [], columns: 0 };
  if (measuredSeats.every((seat) => seat.deck === "upper")) {
    return buildCanonicalUpperSleeperLayout(measuredSeats);
  }
  if (measuredSeats.every((seat) => seat.isBerth)) {
    return buildCanonicalLowerSleeperLayout(measuredSeats);
  }
  if (measuredSeats.every((seat) => !seat.isBerth)) {
    const providerLaneCount = new Set(measuredSeats.map((seat) => seat.row)).size;
    const lowerSeatRows = providerLaneCount === 3 ? [1, 2, 4] : [1, 2, 4, 5];
    return buildCanonicalLowerSeaterLayout(measuredSeats, lowerSeatRows);
  }
  const geometryLayout = buildGeometryDeckLayout(measuredSeats);
  const labelOrderedLayout = buildLabelOrderedDeckLayout(measuredSeats);
  const preferredLayout = shouldPreferGeometryLayout(measuredSeats, geometryLayout, labelOrderedLayout)
    ? geometryLayout
    : labelOrderedLayout || geometryLayout;

  // Some providers expose every seat in one or two coordinate rows. That is a
  // data ordering convention, not a usable bus shape, so rebuild standard
  // seater-only responses as a 2 + aisle + 2 cabin.
  const standardSeatsOnly = preferredLayout.seats.every((seat) =>
    !seat.isBerth && (seat.width || 1) === 1 && (seat.height || 1) === 1
  );
  if (standardSeatsOnly && preferredLayout.rows <= 2 && preferredLayout.columns > 10) {
    const ordered = [...preferredLayout.seats].sort((a, b) =>
      a.row - b.row || a.column - b.column || String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
    );
    return {
      ...preferredLayout,
      seats: ordered.map((seat, index) => ({
        ...seat,
        row: [1, 2, 4, 5][index % 4],
        column: Math.floor(index / 4) + 1
      })),
      rows: 5,
      columns: Math.ceil(ordered.length / 4),
      aisleRow: 3,
      aisleColumn: undefined,
      labelPattern: preferredLayout.labelPattern || "compact-seater-fallback"
    };
  }
  return preferredLayout;
}

function normalizeDeckVisualScale(layout) {
  if (!layout?.seats?.length) return layout;

  // API coordinates describe proportions, not pixels. A shared unit keeps seat
  // and berth dimensions identical across operators and across both decks.
  const gap = layout.columns > 14 ? 5 : layout.columns > 10 ? 6 : 8;
  const availableGridWidth = 620;
  const seatTrack = Math.max(20, Math.min(34,
    Math.floor((availableGridWidth - Math.max(0, layout.columns - 1) * gap) / Math.max(layout.columns, 1))
  ));
  const aisleTrack = 28;
  const columnTracks = Array.from({ length: layout.columns }, (_, index) =>
    index + 1 === layout.aisleColumn ? `${aisleTrack}px` : `${seatTrack}px`
  ).join(" ");
  const rowTracks = Array.from({ length: layout.rows }, (_, index) =>
    index + 1 === layout.aisleRow ? `${aisleTrack}px` : `${seatTrack}px`
  ).join(" ");

  return {
    ...layout,
    columnTracks,
    rowTracks,
    rowTrack: `${seatTrack}px`,
    gridGap: `${gap}px ${gap}px`
  };
}

function harmonizePairedUpperDeck(lower, upper) {
  if (lower?.seats?.length && upper?.seats?.length) {
    const lowerAisleRow = lower.aisleRow;
    const occupiedLowerRows = [...new Set(lower.seats.map((seat) => seat.row))].sort((a, b) => a - b);
    const upperBerthRows = lowerAisleRow
      ? occupiedLowerRows.filter((row) => row !== lowerAisleRow)
      : [];
    const upperAboveRows = upperBerthRows.filter((row) => row < lowerAisleRow);
    const upperBelowRows = upperBerthRows.filter((row) => row > lowerAisleRow);
    const orderedUpperSeats = canonicalSeatOrder(upper.seats);
    const upperFamilies = orderedUpperSeats.map((seat) => ({ seat, parts: seatLabelParts(seat) }));
    const pairedUpperSeats = upperFamilies.filter(({ parts }) => parts?.suffix === "U");
    const singleUpperSeats = upperFamilies.filter(({ parts }) => parts?.suffix === "SU");
    const hasUpperFamilyPattern = upperAboveRows.length === 2 && upperBelowRows.length === 1 &&
      pairedUpperSeats.length > 0 && singleUpperSeats.length > 0 &&
      pairedUpperSeats.length + singleUpperSeats.length === orderedUpperSeats.length &&
      pairedUpperSeats.length <= singleUpperSeats.length * 2 + 2;
    const familyPackedSeats = hasUpperFamilyPattern
      ? [
          ...pairedUpperSeats.map(({ seat }, index) => ({
            ...seat,
            row: upperAboveRows[index % 2],
            column: (Math.floor(index / 2) * 2) + 1,
            width: 2,
            height: 1,
            isBerth: true,
            visualType: "berth"
          })),
          ...singleUpperSeats.map(({ seat }, index) => ({
            ...seat,
            row: upperBelowRows[0],
            column: (index * 2) + 1,
            width: 2,
            height: 1,
            isBerth: true,
            visualType: "berth"
          }))
        ]
      : null;
    const mirroredUpper = upperBerthRows.length > 0
      ? {
          ...upper,
          seats: familyPackedSeats || orderedUpperSeats.map((seat, index) => ({
            ...seat,
            row: upperBerthRows[index % upperBerthRows.length],
            column: (Math.floor(index / upperBerthRows.length) * 2) + 1,
            width: 2,
            height: 1,
            isBerth: true,
            visualType: "berth"
          })),
          rows: lower.rows,
          columns: Math.max(2, familyPackedSeats
            ? Math.max(Math.ceil(pairedUpperSeats.length / 2), singleUpperSeats.length) * 2
            : Math.ceil(upper.seats.length / upperBerthRows.length) * 2),
          aisleRow: lowerAisleRow,
          aisleColumn: undefined,
          layoutSource: `mirrored-upper-${upperBerthRows.filter((row) => row < lowerAisleRow).length}-plus-${upperBerthRows.filter((row) => row > lowerAisleRow).length}`
        }
      : upper;
    const occupiedColumns = (layout) => Math.max(1, ...layout.seats.map((seat) => seat.column + (seat.width || 1) - 1));
    const lowerOccupiedColumns = occupiedColumns(lower);
    const upperOccupiedColumns = occupiedColumns(mirroredUpper);
    const sharedColumns = Math.max(lowerOccupiedColumns, upperOccupiedColumns);
    const sharedRows = Math.max(lower.rows || 0, mirroredUpper.rows || 0);
    const stretchToRear = (layout, contentColumns) => {
      if (contentColumns >= sharedColumns || contentColumns <= 1) return layout;
      return {
        ...layout,
        seats: layout.seats.map((seat) => {
          const width = seat.width || 1;
          const sourceTravel = Math.max(1, contentColumns - width);
          const targetTravel = Math.max(1, sharedColumns - width);
          return {
            ...seat,
            column: 1 + Math.round(((seat.column - 1) / sourceTravel) * targetTravel)
          };
        })
      };
    };
    const stretchedLower = stretchToRear(lower, lowerOccupiedColumns);
    const stretchedUpper = stretchToRear(mirroredUpper, upperOccupiedColumns);
    return {
      lower: normalizeDeckVisualScale({ ...stretchedLower, columns: sharedColumns, rows: sharedRows }),
      upper: normalizeDeckVisualScale({ ...stretchedUpper, columns: sharedColumns, rows: sharedRows })
    };
  }
  return {
    lower: normalizeDeckVisualScale(lower),
    upper: normalizeDeckVisualScale(upper)
  };
}

function PortraitSeatChart({ route, selected, setSelected }) {
  const unavailable = new Set(route.seatLayout?.unavailable || []);
  const layoutType = String(route.seatLayout?.type || route.classType || "").toLowerCase();
  const isSleeper = layoutType.includes("sleeper");
  const isMixed = layoutType.includes("mixed") || layoutType.includes("sleeper-seater");

  if (route.seatLayoutLoading) {
    return <div className="empty-results">Loading live seat layout...</div>;
  }

  const routeTypeText = String(route.classType || route.vehicleType || route.seatLayout?.type || "").toLowerCase();
  const sleeperOnlyRoute = routeTypeText.includes("sleeper") && !/(seat|seater|sitting|mixed)/.test(routeTypeText);
  const apiSeats = extractSeatList(route.seatLayout).map(normalizeApiSeat).filter(Boolean).map((seat) => sleeperOnlyRoute ? {
    ...seat,
    isBerth: true,
    visualType: "berth"
  } : seat);
  const visibleSeats = apiSeats.filter((seat) => !seat.isWalkway);
  if (route.seatLayoutError || !route.seatLayout || !visibleSeats.length) {
    return <div className="empty-results">No seats to show for this bus.</div>;
  }

  const lowerSeats = visibleSeats.filter((seat) => seat.deck !== "upper");
  const upperSeats = visibleSeats.filter((seat) => seat.deck === "upper");
  const builtLower = buildDeckLayout(lowerSeats);
  const builtUpper = buildDeckLayout(upperSeats);
  const { lower, upper } = harmonizePairedUpperDeck(builtLower, builtUpper);
  if (!lower.seats.length && !upper.seats.length) {
    return <div className="empty-results">No seats to show for this bus.</div>;
  }

  const toggle = (id) => {
    if (unavailable.has(id)) return;
    setSelected(selected.includes(id) ? selected.filter((seat) => seat !== id) : [...selected, id]);
  };

  return (
    <div className="portrait-chart-wrap">
      <div className="deck-lane">
        {lower.seats.length > 0
          ? <Deck title="Lower deck" layout={lower} unavailable={unavailable} selected={selected} toggle={toggle} sleeper={isSleeper} mixed={isMixed} baseFare={route.price} />
          : <DeckPlaceholder title="Lower deck" />}
      </div>
      <div className="deck-lane">
        {upper.seats.length > 0
          ? <Deck title="Upper deck" layout={upper} unavailable={unavailable} selected={selected} toggle={toggle} sleeper={isSleeper} mixed={isMixed} baseFare={route.price} />
          : <DeckPlaceholder title="Upper deck" />}
      </div>
      <div className="seat-legend vibrant"><span className="available-seat">Available</span><span className="selected-seat">Selected</span><span className="female-seat">Women</span><span className="sold-seat">Sold</span></div>
    </div>
  );
}

function DeckPlaceholder({ title }) {
  return (
    <article className="deck-card deck-placeholder" aria-label={`${title} not available`}>
      <div className="deck-head"><h3>{title}</h3><span>Empty</span></div>
      <div className="deck-empty-state">
        <Armchair size={22} />
        <b>No deck in API response</b>
        <small>This lane is reserved so single-deck buses do not stretch across the full seat area.</small>
      </div>
    </article>
  );
}

function Deck({ title, layout, unavailable, selected, toggle, sleeper, mixed, baseFare }) {
  const renderSeat = (seat) => {
    const sold = unavailable.has(seat.id) || booleanFrom(seat.isUnavailable, seat.IsBooked, seat.Booked, seat.IsBlocked, seat.Blocked, seat.Available === false ? true : null);
    const chosen = selected.includes(seat.id);
    const women = booleanFrom(seat.IsLadiesSeat, seat.LadiesSeat, seat.IsLadies, seat.ForLadies, seat.ladies);
    const isBerth = Boolean(seat.isBerth);
    const isHorizontalSeat = !isBerth && seat.visualType === "horizontal-seat";
    const isHorizontalBerth = isBerth && (seat.width || 1) > (seat.height || 1);
    const fare = seatFareAmount(seat, Math.round(Number(baseFare) * (seat.fareMultiplier || 1)));
    
    return (
      <button
        key={seat.id}
        className={`${isBerth ? "sleeper-berth" : "chair-seat"} ${isHorizontalSeat ? "horizontal-seat" : ""} ${isHorizontalBerth ? "horizontal-berth" : ""} ${sold ? "sold" : ""} ${chosen ? "chosen" : ""} ${women ? "women" : ""}`}
        onClick={() => toggle(seat.id)}
        disabled={sold}
        aria-label={`${title} seat ${seat.id}`}
        style={{
          gridColumnStart: seat.column,
          gridColumnEnd: `span ${seat.width || 1}`,
          gridRowStart: seat.row,
          gridRowEnd: `span ${seat.height || 1}`,
          alignSelf: "stretch",
          justifySelf: "stretch"
        }}
      >
        <b>{seat.SeatName || seat.label || seat.id}</b>
        {isBerth ? <span className="pillow" /> : <Armchair size={13} />}
        <small>{sold ? "Sold" : `₹${fare}`}</small>
      </button>
    );
  };

  return (
    <article className={`deck-card compact-deck-card ${layout.rotated ? "rotated-layout" : ""}`}>
      <div className="compact-deck-title"><h3>{title}</h3><span>Driver</span></div>
      <div className="deck-seat-scroll" aria-label={`${title} seat layout`}>
        <div className="portrait-seat-grid live-seat-grid" style={{
          gridTemplateColumns: layout.columnTracks || `repeat(${layout.columns || 4}, 46px)`,
          gridTemplateRows: layout.rowTracks || `repeat(${layout.rows || 1}, ${layout.rowTrack || "46px"})`,
          gap: layout.gridGap || "8px 10px",
          justifyContent: "start",
        }}>
          {layout.aisleRow && <div className="bus-aisle horizontal-aisle" style={{
            gridColumnStart: 1,
            gridColumnEnd: `span ${layout.columns || 1}`,
            gridRowStart: layout.aisleRow
          }} aria-label="Passenger walkway"><span>Passenger walkway</span></div>}
          {!layout.aisleRow && layout.aisleColumn && <div className="bus-aisle" style={{
            gridColumnStart: layout.aisleColumn,
            gridRowStart: 1,
            gridRowEnd: `span ${layout.rows || 1}`
          }} aria-label="Bus walkway" />}
          {layout.seats.map(renderSeat)}
        </div>
      </div>
    </article>
  );
}

function RouteInfoTabs({ route }) {
  const [activeTab, setActiveTab] = useState("highlights");
  const tabs = [
    ["highlights", "Highlights"],
    ["cancellation", "Cancellation policy"],
    ["boarding", "Boarding point"],
    ["dropping", "Dropping point"]
  ];
  const boardingPoints = routeBoardingPoints(route);
  const droppingPoints = routeDroppingPoints(route);

  return (
    <>
      <div className="detail-tabs">
        {tabs.map(([key, label]) => (
          <button key={key} type="button" className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key)}>{label}</button>
        ))}
      </div>
      {activeTab === "highlights" && (
        <div className="highlight-grid">
          <div><b>Top Comfort</b><p>Premium seating, clean cabin and regular maintenance checks.</p></div>
          <div><b>Bus Safety</b><p>GPS-enabled fleet with route assistance and emergency support.</p></div>
          <div><b>Highly On Time</b><p>Consistent departure performance on this route.</p></div>
          <div><b>Women Care</b><p>Priority assistance and dedicated support for women travellers.</p></div>
        </div>
      )}
      {activeTab === "cancellation" && (
        <div className="detail-tab-panel">
          <h3>Cancellation and refund policy</h3>
          <p className="detail-copy">Cancellations are processed as per operator rules. Refund amounts are calculated on the base fare after deducting applicable service charges.</p>
          <table>
            <tbody>
              <tr><th>Cancellation window</th><th>Refund</th></tr>
              {cancellationPolicyRows.map(([window, refund]) => <tr key={window}><td>{window}</td><td>{refund}</td></tr>)}
            </tbody>
          </table>
          <ul className="detail-list">
            <li>Convenience fee and payment gateway charges are non-refundable.</li>
            <li>Approved refunds are credited within 5–7 working days to the original payment method.</li>
            <li>One free date change may be allowed up to 12 hours before departure on selected services.</li>
            <li>If the operator cancels the service, you receive a full refund or free reschedule.</li>
          </ul>
        </div>
      )}
      {activeTab === "boarding" && (
        <div className="detail-tab-panel">
          <h3>Boarding points</h3>
          <p className="detail-copy">Please reach your selected boarding point at least 15 minutes before the scheduled pickup time. Carry a valid government-issued photo ID and your booking confirmation.</p>
          <div className="route-point-list">
            {boardingPoints.map((point) => (
              <article key={point.name} className="route-point-item">
                <b>{point.time}</b>
                <div><strong>{point.name}</strong><p>{point.note}</p></div>
              </article>
            ))}
          </div>
        </div>
      )}
      {activeTab === "dropping" && (
        <div className="detail-tab-panel">
          <h3>Dropping points</h3>
          <p className="detail-copy">Dropping times are approximate and may vary based on traffic, weather and route conditions on the day of travel.</p>
          <div className="route-point-list">
            {droppingPoints.map((point) => (
              <article key={point.name} className="route-point-item">
                <b>{point.time}</b>
                <div><strong>{point.name}</strong><p>{point.note}</p></div>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function BusProfilePanel({ route }) {
  return (
    <article className="bus-profile-panel">
      <div className="bus-profile-head">
        <div><b>{route.providerName}</b><p>{new Date(route.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(route.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div>
        <strong>★ {route.rating || 4.4}</strong>
      </div>
      <div className="bus-gallery">
        <img src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=700&q=80" alt="Bus front" />
        <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=700&q=80" alt="Bus journey" />
      </div>
      <RouteInfoTabs route={route} />
    </article>
  );
}

function BookingModal({ route, query, user, message, onClose, onBuy }) {
  const [step, setStep] = useState("points");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([{ ...initialPassenger }]);
  const [contact, setContact] = useState({ email: "", phone: "", emergencyPhone: "" });
  const [boardingPoint, setBoardingPoint] = useState("");
  const [dropPoint, setDropPoint] = useState("");
  const boardingPoints = [`${route.origin} Central`, `${route.origin} Circle`, `${route.origin} Bus Terminal`];
  const droppingPoints = [`${route.destination} Central`, `${route.destination} Market`, `${route.destination} Bus Terminal`];
  const seats = selectedSeats.length ? selectedSeats : passengers.map((_, index) => `AUTO-${index + 1}`);
  const total = selectedSeats.length ? selectedSeatFareTotal(route, selectedSeats) : Number(route.price) * Math.max(seats.length, passengers.length);
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  return (
    <div className="booking-modal-backdrop" role="dialog" aria-modal="true">
      <div className="booking-modal">
        <div className="wizard-tabs">
          {["points", "seats", "passenger"].map((item, index) => <button key={item} className={step === item ? "active" : ""} onClick={() => setStep(item)}>{index + 1}. {item === "points" ? "Board/Drop point" : item === "seats" ? "Select seats" : "Passenger Info"}</button>)}
        </div>
        <div className="modal-head">
          <div>
            <span>Complete your booking</span>
            <h2>{route.providerName}</h2>
            <p>{route.origin} to {route.destination} · {route.vehicleType} · {route.classType}</p>
          </div>
          <button className="modal-close" onClick={onClose}>Close</button>
        </div>
        {step === "points" && <BoardDropStep boardingPoints={boardingPoints} droppingPoints={droppingPoints} boardingPoint={boardingPoint} setBoardingPoint={setBoardingPoint} dropPoint={dropPoint} setDropPoint={setDropPoint} />}
        {step === "seats" && <SeatDetailsStep route={route} selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats} />}
        {step === "passenger" && <><PassengerForm query={query} selectedSeats={selectedSeats} passengers={passengers} setPassengers={setPassengers} contact={contact} setContact={setContact} mode={route.type} /><p className="identity-note">The booking person must show Aadhaar card or any equivalent identity card to the bus attendant at the time of boarding.</p><FareSummary total={total} route={route} boardingPoint={boardingPoint} dropPoint={dropPoint} seats={seats} /></>}
        <div className="modal-actions">
          <button className="secondary-action" onClick={onClose}>Back to results</button>
          {step !== "passenger" ? <button className="primary" onClick={() => setStep(step === "points" ? "seats" : "passenger")}>Continue</button> : <button className="primary" onClick={() => onBuy({ route, query, selectedSeats: seats, passengers, contact, boardingPoint, dropPoint, totalAmount: total })}>Buy ticket</button>}
        </div>
        {message && <div className="success-note">{message}</div>}
      </div>
    </div>
  );
}

function BoardDropStep({ boardingPoints, droppingPoints, boardingPoint, setBoardingPoint, dropPoint, setDropPoint }) {
  return <div className="point-grid"><PointList title="Boarding points" subtitle="Select boarding point" points={boardingPoints} selected={boardingPoint} setSelected={setBoardingPoint} start="06:45" /><PointList title="Dropping points" subtitle="Select dropping point" points={droppingPoints} selected={dropPoint} setSelected={setDropPoint} start="17:20" /></div>;
}

function PointList({ title, subtitle, points, selected, setSelected, start }) {
  const visiblePoints = uniqueDisplayNames(points);
  return <article className="point-card"><h3>{title}</h3><p>{subtitle}</p>{visiblePoints.map((point, index) => <button key={`${point}-${index}`} className={selected === point ? "active" : ""} onClick={() => setSelected(point)}><b>{index === 0 ? start : index === 1 ? "06:55" : "07:05"}</b><span>{point}<small>{point.toUpperCase()}</small></span><i /></button>)}</article>;
}

function SeatDetailsStep({ route, selectedSeats, setSelectedSeats }) {
  return (
    <div className="seat-info-layout">
      <div>
        <SeatMap route={route} selected={selectedSeats} setSelected={setSelectedSeats} />
        <div className="seat-legend"><span className="available-seat">Available</span><span className="selected-seat">Selected</span><span className="sold-seat">Sold</span></div>
      </div>
      <article className="bus-detail-panel">
        <div className="detail-top">
          <div><b>{route.providerName}</b><p>{new Date(route.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(route.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div>
          <strong>★ {route.rating || 4.3}</strong>
        </div>
        <RouteInfoTabs route={route} />
      </article>
    </div>
  );
}

function FareSummary({ total, route, boardingPoint, dropPoint, seats }) {
  const isBus = route.type === "bus";
  return <div className="fare-summary"><h3>Fare summary</h3><div><span>{isBus ? "Base fare" : "Fare"}</span><b>₹{Number(route.price).toLocaleString("en-IN")}{isBus ? ` × ${seats.length}` : ""}</b></div>{isBus ? <><div><span>Seats</span><b>{seats.join(", ")}</b></div><div><span>Boarding</span><b>{boardingPoint || "Select point"}</b></div><div><span>Dropping</span><b>{dropPoint || "Select point"}</b></div></> : <><div><span>From</span><b>{route.origin}</b></div><div><span>To</span><b>{route.destination}</b></div><div><span>Class</span><b>{route.classType || "Economy"}</b></div></>}<div className="fare-total"><span>Amount to pay</span><strong>₹{Number(total).toLocaleString("en-IN")}</strong></div></div>;
}

function JourneyResults({ type, results, query, onViewSeats }) {
  const [filters, setFilters] = useState([]);
  const [activeOperator, setActiveOperator] = useState("all");
  const [departureSlot, setDepartureSlot] = useState("any");
  const [sortBy, setSortBy] = useState("price-asc");
  const [popularTab, setPopularTab] = useState("boarding");
  const [selectedPoint, setSelectedPoint] = useState("");
  const [busPartner, setBusPartner] = useState("");
  const [expandedStateBoards, setExpandedStateBoards] = useState({});
  const routeMinPrice = results.length ? Math.min(...results.map((route) => Number(route.price || 0))) : 0;
  const routeMaxPrice = Math.max(...results.map((route) => Number(route.price || 0)), 0);
  const [minPrice, setMinPrice] = useState(routeMinPrice);
  const [maxPrice, setMaxPrice] = useState(routeMaxPrice);
  const stateTabs = type === "bus" ? operatorBrands.filter((brand) => results.some((route) => operatorBrand(route)?.key === brand.key)) : [];

  useEffect(() => {
    setMinPrice(routeMinPrice);
    setMaxPrice(routeMaxPrice);
    setActiveOperator("all");
    setDepartureSlot("any");
    setSortBy("price-asc");
    setSelectedPoint("");
    setBusPartner("");
    setFilters([]);
    setExpandedStateBoards({});
  }, [type, routeMinPrice, routeMaxPrice, results.length]);

  if (!results.length) return null;

  const filterOptions = [
    { key: "rated", label: "Highly rated", icon: Star, test: (route) => Number(route.rating || 0) >= 4.4 },
    { key: "free", label: "Free cancellation", icon: ShieldCheck, test: (route) => String(route.cancellationPolicy || "").toLowerCase().includes("free") || route.amenities?.includes("Free date change") },
    { key: "tracking", label: "Live tracking", icon: MapPinned, test: (route) => route.amenities?.some((item) => item.toLowerCase().includes("tracking")) },
    { key: "ac", label: "AC", icon: Snowflake, test: (route) => `${route.classType} ${route.vehicleType}`.toLowerCase().includes("ac") && !`${route.classType}`.toLowerCase().includes("non ac") },
    { key: "nonac", label: "Non-AC", icon: ThermometerSnowflake, test: (route) => `${route.classType} ${route.vehicleType}`.toLowerCase().includes("non ac") },
    { key: "sleeper", label: "Sleeper", icon: BedDouble, test: (route) => `${route.classType} ${route.vehicleType} ${route.seatLayout?.type}`.toLowerCase().includes("sleeper") },
    { key: "seater", label: "Seater", icon: Armchair, test: (route) => !`${route.classType} ${route.vehicleType} ${route.seatLayout?.type}`.toLowerCase().includes("sleeper") },
    { key: "newbus", label: "New buses", icon: Bus, test: (route) => Number(route.rating || 0) >= 4.5 },
    { key: "offers", label: "Offers", icon: Percent, test: (route) => route.amenities?.some((item) => /off|discount|save/i.test(item)) || String(route.cancellationPolicy || "").toLowerCase().includes("free") }
  ];

  const busTypeFilters = filterOptions.filter((item) => ["ac", "sleeper", "seater", "nonac", "tracking", "newbus", "offers"].includes(item.key));

  const departureSlots = [
    { key: "before10", label: "Before 10 AM", icon: Sunrise, test: (route) => new Date(route.departureTime).getHours() < 10 },
    { key: "day", label: "10 AM – 5 PM", icon: Sun, test: (route) => { const hour = new Date(route.departureTime).getHours(); return hour >= 10 && hour < 17; } },
    { key: "evening", label: "5 PM – 11 PM", icon: Sunset, test: (route) => { const hour = new Date(route.departureTime).getHours(); return hour >= 17 && hour < 23; } },
    { key: "night", label: "After 11 PM", icon: Moon, test: (route) => new Date(route.departureTime).getHours() >= 23 }
  ];

  const availableSeats = (route) => {
    const seats = route.seatLayout?.seats || [];
    const unavailable = new Set(route.seatLayout?.unavailable || []);
    return seats.filter((seat) => !seat.isWalkway && !unavailable.has(seat.id)).length;
  };

  const timeValue = (value) => {
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) return timestamp;
    const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : Number.POSITIVE_INFINITY;
  };

  const boardingPoints = uniqueDisplayNames(results.flatMap((route) => routeBoardingPoints(route).map((point) => point.name.split(" ")[0]))).slice(0, 8);
  const droppingPoints = uniqueDisplayNames(results.flatMap((route) => routeDroppingPoints(route).map((point) => point.name.split(" ")[0]))).slice(0, 8);
  const operators = [...new Set(results.map((route) => route.providerName))].slice(0, 8);

  const operatorFiltered = results;

  const filtered = operatorFiltered
    .filter((route) => Number(route.price) >= minPrice && Number(route.price) <= maxPrice)
    .filter((route) => departureSlot === "any" || departureSlots.find((slot) => slot.key === departureSlot)?.test(route))
    .filter((route) => !busPartner || route.providerName === busPartner)
    .filter((route) => !selectedPoint || routeBoardingPoints(route).some((point) => point.name.includes(selectedPoint)) || routeDroppingPoints(route).some((point) => point.name.includes(selectedPoint)) || route.providerName.includes(selectedPoint))
    .filter((route) => filters.every((key) => filterOptions.find((item) => item.key === key)?.test(route)))
    .sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      if (sortBy === "seats") return availableSeats(b) - availableSeats(a);
      if (sortBy === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === "arrival") return timeValue(a.arrivalTime) - timeValue(b.arrivalTime);
      if (sortBy === "departure") return timeValue(a.departureTime) - timeValue(b.departureTime);
      return 0;
    });

  const toggleFilter = (key) => setFilters((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  const clearFilters = () => { setFilters([]); setDepartureSlot("any"); setMinPrice(routeMinPrice); setMaxPrice(routeMaxPrice); setBusPartner(""); setSelectedPoint(""); setActiveOperator("all"); };

  const sortOptions = [
    ["price-asc", "Lowest fare"],
    ["price-desc", "Highest fare"],
    ["departure", "Earliest departure"],
    ["arrival", "Earliest arrival"],
    ["rating", "Top rated"],
    ["seats", "Most seats"]
  ];

  const offerCards = [
    { title: "Flash Offer", tone: "flash", icon: Tag },
    { title: "Advance Booking", tone: "advance", icon: CalendarDays },
    { title: "Price Drop", tone: "drop", icon: Percent }
  ];

  const stateBoardGroups = type === "bus"
    ? operatorBrands.filter((brand) => routeRelevantStateBoardKeys(query, filtered).has(brand.key)).map((brand) => ({
      brand,
      routes: filtered.filter((route) => operatorBrand(route)?.key === brand.key)
    }))
    : [];
  const privateRoutes = type === "bus" ? filtered.filter((route) => !operatorBrand(route)) : filtered;
  const visibleResultCount = type === "bus"
    ? privateRoutes.length + stateBoardGroups.reduce((count, group) => count + group.routes.length, 0)
    : filtered.length;
  const renderRouteCard = (route) => {
    const brand = operatorBrand(route);
    const seatsLeft = availableSeats(route);
    return (
      <article key={route.id} className={`result-card ${route.type}`}>
        <div className="result-card-head">
          <span className="operator-title">{brand && <img src={brand.logo} alt={`${brand.title} logo`} />}{route.providerName}</span>
          <span className="rating-badge"><Star size={14} strokeWidth={2.5} /> {formatRating(route.rating)}</span>
        </div>
        <div className="result-card-meta">
          <span>{route.vehicleType} · {route.classType}</span>
          {type === "bus" && seatsLeft > 0 && <span className="seats-left"><Armchair size={14} /> {seatsLeft} seats left</span>}
        </div>
        <div className="time-row"><b>{new Date(route.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b><span>{route.origin} to {route.destination}</span><b>{new Date(route.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b></div>
        <div className="amenities">{route.amenities?.map((item) => <span key={item}>{item}</span>)}</div>
        <div className="fare-row">
          <div><small>From</small><strong>₹{Number(route.price).toLocaleString("en-IN")}</strong></div>
          <button onClick={() => onViewSeats(route)}>{type === "bus" ? "Select Seats" : type === "flight" ? "Book Flight" : "Book Train"}</button>
        </div>
      </article>
    );
  };

  return (
    <section className="journey-results">
      <aside className="filter-panel">
        <div className="filter-head">
          <h3>Filters</h3>
          <button type="button" className="clear-filters" onClick={clearFilters}>Clear All</button>
        </div>

        {type === "bus" && (
          <div className="bus-type-grid">
            <span className="filter-section-label">Bus Type</span>
            <div className="type-icon-grid">
              {busTypeFilters.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.key} type="button" className={`type-icon-btn ${filters.includes(item.key) ? "active" : ""}`} onClick={() => toggleFilter(item.key)}>
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="range-filter dual-range">
          <span className="filter-section-label">Price Range</span>
          <div className="price-range-labels">
            <strong>₹{Number(minPrice).toLocaleString("en-IN")}</strong>
            <strong>₹{Number(maxPrice).toLocaleString("en-IN")}</strong>
          </div>
          <input type="range" min={routeMinPrice} max={routeMaxPrice} step="50" value={minPrice} onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice))} />
          <input type="range" min={routeMinPrice} max={routeMaxPrice} step="50" value={maxPrice} onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice))} />
        </div>

        <div className="departure-time-grid">
          <span className="filter-section-label">Departure Time</span>
          <div className="time-slot-grid">
            {departureSlots.map((slot) => {
              const Icon = slot.icon;
              return (
                <button key={slot.key} type="button" className={`time-slot-btn ${departureSlot === slot.key ? "active" : ""}`} onClick={() => setDepartureSlot(departureSlot === slot.key ? "any" : slot.key)}>
                  <Icon size={18} />
                  <span>{slot.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {type === "bus" && (
          <div className="partner-filter">
            <span className="filter-section-label">Bus Partner</span>
            <select value={busPartner} onChange={(event) => setBusPartner(event.target.value)}>
              <option value="">All operators</option>
              {operators.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        )}

        <div className="extra-filters">
          <span className="filter-section-label">More Filters</span>
          {filterOptions.filter((item) => !busTypeFilters.find((busItem) => busItem.key === item.key)).map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} type="button" className={filters.includes(item.key) ? "active" : ""} onClick={() => toggleFilter(item.key)}>
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="result-main">
        {type === "bus" && (
          <div className="offers-carousel">
            {offerCards.map((offer) => {
              const Icon = offer.icon;
              return (
                <article key={offer.title} className={`offer-chip ${offer.tone}`}>
                  <Icon size={20} />
                  <span>{offer.title}</span>
                </article>
              );
            })}
          </div>
        )}

        <div className="sort-bar">
          {sortOptions.map(([key, label]) => (
            <button key={key} type="button" className={sortBy === key ? "active" : ""} onClick={() => setSortBy(key)}>
              {label}
            </button>
          ))}
          <span className="result-count"><Bus size={16} /> Showing {visibleResultCount} {type === "bus" ? "buses" : type === "flight" ? "flights" : "trains"}{query?.from && query?.to ? ` · ${query.from} to ${query.to}` : ""} on this route</span>
        </div>

        {type === "bus" && (
          <div className="popular-filters">
            <div className="popular-tabs">
              {[["boarding", "Boarding Points"], ["dropping", "Dropping Points"], ["operators", "Operators"]].map(([key, label]) => (
                <button key={key} type="button" className={popularTab === key ? "active" : ""} onClick={() => { setPopularTab(key); setSelectedPoint(""); }}>{label}</button>
              ))}
            </div>
            <div className="popular-pills">
              {(popularTab === "boarding" ? boardingPoints : popularTab === "dropping" ? droppingPoints : operators).map((point) => (
                <button key={point} type="button" className={selectedPoint === point ? "active" : ""} onClick={() => setSelectedPoint(selectedPoint === point ? "" : point)}>{point}</button>
              ))}
            </div>
          </div>
        )}

        <div className="mini-offers"><article>Free cancellation</article><article>Flexible date change</article><article>Women traveller care</article></div>

        <div className="result-list">
          {type !== "bus" && stateBoardGroups.map(({ brand, routes }) => {
            const expanded = Boolean(expandedStateBoards[brand.key]);
            const hasRoutes = routes.length > 0;
            const minFare = hasRoutes ? Math.min(...routes.map((route) => Number(route.price || 0))) : null;
            const totalSeats = routes.reduce((count, route) => count + availableSeats(route), 0);
            const bestRating = Math.max(...routes.map((route) => Number(route.rating || 0)));
            return (
              <section key={brand.key} className={`state-board-block ${expanded ? "open" : ""} ${hasRoutes ? "" : "empty"}`}>
                <button
                  type="button"
                  className="state-board-card"
                  onClick={() => hasRoutes && setExpandedStateBoards((current) => ({ ...current, [brand.key]: !current[brand.key] }))}
                  aria-expanded={expanded}
                  disabled={!hasRoutes}
                >
                  <span className="state-board-logo"><img src={brand.logo} alt={`${brand.title} logo`} /></span>
                  <span className="state-board-copy">
                    <strong>{brand.title}</strong>
                    <small>{brand.subtitle}</small>
                    <em>{hasRoutes ? `${routes.length} buses · ${totalSeats} seats available ${bestRating ? `· ★ ${formatRating(bestRating)}` : ""}` : "No state-board buses returned for this search"}</em>
                  </span>
                  <span className="state-board-price">{hasRoutes ? <><small>From</small><b>₹{Number(minFare).toLocaleString("en-IN")}</b></> : <small>Unavailable</small>}</span>
                  <span className="state-board-action">{hasRoutes ? "View buses" : "No buses"} <ChevronDown size={18} /></span>
                </button>
                {expanded && <div className="state-board-routes">{routes.map(renderRouteCard)}</div>}
              </section>
            );
          })}
          {type === "bus" ? filtered.map(renderRouteCard) : privateRoutes.map(renderRouteCard)}
          {!visibleResultCount && <div className="empty-results">No services match these filters. Remove one filter to see more options.</div>}
        </div>
      </div>
    </section>
  );
}

function LoginInline({ setUser }) {
  const [form, setForm] = useState({ email: "customer@orbitatravels.com", password: "customer123" });
  const [message, setMessage] = useState("");
  const login = async () => {
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(form) });
      tokenStore.set(data.token);
      setUser(data.user);
      setMessage("Logged in. You can continue booking.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  return <div className="inline-login"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button onClick={login}>Login to continue</button>{message && <small>{message}</small>}</div>;
}

function SeatMap({ route, selected, setSelected }) {
  const unavailable = new Set(route.seatLayout?.unavailable || []);
  const layout = buildDeckLayout(extractSeatList(route.seatLayout));
  const seats = layout.seats;
  if (!route.seatLayout || !seats.length) return <div className="empty-results">No seats to show for this bus.</div>;
  const toggle = (id) => {
    if (unavailable.has(id)) return;
    setSelected(selected.includes(id) ? selected.filter((seat) => seat !== id) : [...selected, id]);
  };
  return (
    <div className="seat-landscape">
      <div className={`seat-map ${route.type}`} style={{
        gridTemplateColumns: `repeat(${layout.columns || 4}, 58px)`,
        gridTemplateRows: `repeat(${Math.max(...seats.map((seat) => seat.row + (seat.height || 1) - 1))}, 48px)`
      }}>
        {seats.map((seat) => {
          if (seat.isWalkway) {
            return <div key={seat.id} className="seat-walkway-landscape" />;
          }
          return (
            <button key={seat.id} className={`${unavailable.has(seat.id) ? "blocked" : ""} ${selected.includes(seat.id) ? "chosen" : ""}`} onClick={() => toggle(seat.id)} style={{
              gridColumn: `${seat.column} / span ${seat.width || 1}`,
              gridRow: `${seat.row} / span ${seat.height || 1}`
            }}>
              {seat.isBerth ? <BedDouble size={15} /> : <Armchair size={15} />}
              <span>{seat.id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PassengerForm({ query, selectedSeats, passengers, setPassengers, contact, setContact, mode = "bus" }) {
  useEffect(() => {
    const count = Math.max(query.travellers || 1, mode === "bus" ? selectedSeats.length || 1 : 1);
    setPassengers((current) => Array.from({ length: count }, (_, index) => ({
      ...(current[index] || initialPassenger),
      seat: mode === "bus" ? (selectedSeats[index] || "") : (current[index]?.seat || "")
    })));
  }, [query.travellers, selectedSeats.join(","), mode]);

  return (
    <div className="traveller-form">
      <h3>Passenger details</h3>
      {passengers.map((passenger, index) => (
        <div className="passenger-grid" key={index}>
          <input placeholder="Passenger name" value={passenger.name} onChange={(e) => setPassengers(passengers.map((p, i) => i === index ? { ...p, name: e.target.value } : p))} />
          <input placeholder="Age" type="number" value={passenger.age} onChange={(e) => setPassengers(passengers.map((p, i) => i === index ? { ...p, age: e.target.value } : p))} />
          <select value={passenger.gender} onChange={(e) => setPassengers(passengers.map((p, i) => i === index ? { ...p, gender: e.target.value } : p))}><option>Male</option><option>Female</option><option>Other</option></select>
          {mode === "bus" ? <input placeholder="Seat" value={selectedSeats[index] || passenger.seat} readOnly /> : <input placeholder="Class" value={mode === "flight" ? "Economy" : "Traveller"} readOnly />}
        </div>
      ))}
      <div className="contact-grid"><input placeholder="Contact email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /><input placeholder="Mobile number" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /><input placeholder="Emergency contact" value={contact.emergencyPhone} onChange={(e) => setContact({ ...contact, emergencyPhone: e.target.value })} /></div>
    </div>
  );
}

function OffersStrip() {
  const offers = [
    { icon: Bus, label: "Bus", title: "Premium bus journeys", detail: "Reserved seats, cleaner coaches and early boarding support.", code: "FIRST", kicker: "Up to 15% off" },
    { icon: CalendarDays, label: "Calendar", title: "Flexible date support", detail: "Switch eligible dates and keep the same journey context.", code: "FLEXI", kicker: "Free change" },
    { icon: Moon, label: "Clock", title: "Smart weekday fares", detail: "Low-demand travel windows surfaced for better ticket value.", code: "SKY", kicker: "Fare drop" }
  ];
  return (
    <section className="clean-section offers-section">
      <div className="section-title">
        <div>
          <span className="section-kicker">Travel deals</span>
          <h2>Offers for you</h2>
        </div>
        <a>View more</a>
      </div>
      <div className="offer-row">
        {offers.map(({ icon: Icon, label, title, detail, code, kicker }) => (
          <article key={code}>
            <span className="offer-card-glow" aria-hidden="true" />
            <div className="offer-card-top">
              <span className="offer-icon" title={label} aria-label={label}><Icon size={22} /></span>
              <small>{kicker}</small>
            </div>
            <h3>{title}</h3>
            <p>{detail}</p>
            <b>{code}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhatsNew() {
  const updates = [
    { image: newsCancellation, stat: "30 min", title: "Free cancellation window", copy: "Cancel selected services close to departure and keep more of your fare protected." },
    { image: newsTimetable, stat: "Live", title: "Bus timetable signals", copy: "Fresh local timing cues for routes where demand shifts through the day." },
    { image: newsAssurance, stat: "24/7", title: "Assurance support", copy: "Priority help for cancellations, delays and urgent journey concerns." }
  ];
  return (
    <section className="clean-section whats-new-section">
      <div className="section-title">
        <div>
          <span className="section-kicker">Platform updates</span>
          <h2>What's new</h2>
        </div>
      </div>
      <div className="news-row">
        {updates.map(({ image, stat, title, copy }) => (
          <article key={title}>
            <div className="news-icon-wrap"><img src={image} alt="" /></div>
            <strong>{stat}</strong>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GovernmentBuses() {
  const items = [
    { ...operatorBrands[2], services: 2100 },
    { ...operatorBrands[0], services: 1539 },
    { ...operatorBrands[1], services: 1450 }
  ];
  return <section className="clean-section narrow"><h2>Government and trusted operators</h2><div className="operator-row">{items.map((item) => <article key={item.key}><img className="operator-logo" src={item.logo} alt={`${item.title} logo`} /><h3>{item.title}</h3><p>{item.services} services including AC, sleeper, semi-sleeper and express routes</p><span>{item.subtitle}</span></article>)}</div></section>;
}

function PackagesPreview({ packages, setPage }) {
  return <section className="clean-section"><div className="section-title"><h2>Curated tours</h2><button onClick={() => setPage("packages")}>See more</button></div><div className="card-grid preview-grid">{packages.slice(0, 3).map((pkg) => <article className="travel-card" key={pkg.id}><img src={pkg.imageUrl} alt={pkg.title} /><div><span>{pkg.category}</span><h3>{pkg.title}</h3><p>{pkg.durationDays} days · {pkg.inclusions?.slice(0, 3).join(" · ")}</p></div></article>)}</div></section>;
}

function Testimonials() {
  const stories = [
    ["Anjali", "Frequent commuter", "Each bus was clean, punctual and easy to book. Orbita Travels made the whole journey seamless from search to boarding."],
    ["Rohan", "Corporate traveller", "Customer support responded fast and helped me choose the right boarding point. The experience felt polished and reliable."],
    ["Meera", "Weekend getaway", "Seat selection was smooth and updates were clear throughout the trip. This is a premium booking experience."]
  ];
  return (
    <section className="clean-section narrow testimonial-section">
      <div className="section-head">
        <span className="section-kicker">Traveller stories</span>
        <h2>Testimonials</h2>
        <p className="section-subtitle">Hear from travellers who plan journeys with Orbita Travels.</p>
      </div>
      <div className="testimonial-row">
        {stories.map(([name, role, quote]) => (
          <article key={name}>
            <div className="quote-mark">"</div>
            <p>{quote}</p>
            <footer>
              <span>{name.charAt(0)}</span>
              <div><strong>{name}</strong><small>{role}</small></div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function HotelsPage({ hotels, setPage, setPendingCheckout }) {
  const bookHotel = (hotel) => {
    const checkInDate = toDateInputValue(daysFromNow(1));
    const checkOutDate = toDateInputValue(daysFromNow(2));
    setPendingCheckout({
      route: {
        ...hotel,
        type: "hotel",
        providerName: hotel.name,
        origin: hotel.city,
        destination: hotel.city,
        price: hotel.pricePerNight
      },
      query: { date: checkInDate, checkInDate, checkOutDate, nights: 1, rooms: 1, travellers: 2 },
      selectedSeats: [],
      passengers: [{ ...initialPassenger }],
      contact: { email: "", phone: "", emergencyPhone: "" },
      totalAmount: Number(hotel.pricePerNight || 0)
    });
    setPage("auth");
  };

  return (
    <section className="catalog-page hotel-page">
      <div className="catalog-hero">
        <div>
          <span className="section-kicker">Stay collection</span>
          <div className="page-heading"><Hotel size={34} /><div><h1>Hotels</h1><p>Search stays for holidays, business trips and family travel.</p></div></div>
          <p className="catalog-lede">Choose city hotels, premium stays and family-friendly rooms that pair naturally with your bus, train or flight plans.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1100&q=80" alt="Hotel lobby and pool" />
      </div>
      <div className="catalog-feature-row">
        <article><strong>Verified comfort</strong><span>Hotels with practical amenities and clear nightly pricing.</span></article>
        <article><strong>Trip-ready stays</strong><span>Good for business nights, family breaks and onward journeys.</span></article>
        <article><strong>Easy checkout</strong><span>Review room details and confirm from the same Orbita flow.</span></article>
      </div>
      <div className="section-title"><h2>Available stays</h2><p>{hotels.length ? `${hotels.length} stays ready to book` : "No stays available right now"}</p></div>
      <div className="card-grid">{hotels.map((hotel) => <article className="travel-card" key={hotel.id || hotel.externalHotelCode || hotel.name}><img src={hotel.imageUrl} alt={hotel.name} /><div><span>{hotel.starRating} star · {hotel.city}</span><h3>{hotel.name}</h3><p>{hotel.amenities?.join(" · ")}</p></div><footer><b>₹{Number(hotel.pricePerNight).toLocaleString("en-IN")}/night</b><button onClick={() => bookHotel(hotel)}>Book room</button></footer></article>)}</div>{!hotels.length && <div className="empty-results">No hotels are available for the selected city/date right now.</div>}
    </section>
  );
}

function PackagesPage({ packages }) {
  return (
    <section className="catalog-page packages-page">
      <div className="catalog-hero">
        <div>
          <span className="section-kicker">Planned escapes</span>
          <div className="page-heading"><BriefcaseBusiness size={34} /><div><h1>Curated Packages</h1><p>Family tours, luxury getaways, honeymoon escapes and seasonal plans.</p></div></div>
          <p className="catalog-lede">Pick a prepared itinerary when you want transport, stays and experiences to feel connected instead of assembled in pieces.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=80" alt="Scenic travel package destination" />
      </div>
      <div className="catalog-feature-row">
        <article><strong>Handpicked routes</strong><span>Shortlist plans by category, inclusions and duration.</span></article>
        <article><strong>Seasonal ideas</strong><span>Weekend, honeymoon, family and premium getaway options.</span></article>
        <article><strong>Enquiry-first flow</strong><span>Start with a package and finalize details with support.</span></article>
      </div>
      <div className="section-title"><h2>Featured packages</h2><p>{packages.length ? `${packages.length} curated plans` : "Packages will appear here soon"}</p></div>
      <div className="card-grid">{packages.map((pkg) => <article className="travel-card" key={pkg.id}><img src={pkg.imageUrl} alt={pkg.title} /><div><span>{pkg.category}</span><h3>{pkg.title}</h3><p>{pkg.durationDays} days · {pkg.inclusions?.join(" · ")}</p></div><footer><b>₹{Number(pkg.price).toLocaleString("en-IN")}</b><button>Enquire</button></footer></article>)}</div>
    </section>
  );
}

function AuthPage({ user, setUser, setPage, pendingCheckout, authReturnPage, setAuthReturnPage, authMessage }) {
  const resetTokenFromUrl = new URLSearchParams(window.location.search).get("resetToken") || "";
  const [mode, setMode] = useState(resetTokenFromUrl ? "reset" : "login");
  const [form, setForm] = useState({ name: "", email: "customer@orbitatravels.com", phone: "", password: "customer123" });
  const [resetForm, setResetForm] = useState({ email: "", token: resetTokenFromUrl, password: "" });
  const [message, setMessage] = useState(authMessage || "");
  const returnToFlow = () => {
    if (authReturnPage === "booking" || pendingCheckout?.route?.type === "bus") return setPage("booking");
    if (authReturnPage === "checkout" && pendingCheckout) return setPage("checkout");
    setPage("bus");
  };

  useEffect(() => {
    if (authMessage) setMessage(authMessage);
  }, [authMessage]);

  const oauthLogin = async (provider) => {
    if (provider === "google") {
      setMessage("");
      const params = new URLSearchParams({ returnTo: window.location.origin });
      window.location.href = `${API_URL}/auth/google?${params}`;
      return;
    }
    try {
      const data = await api("/auth/oauth", {
        method: "POST",
        body: JSON.stringify({
          provider,
          providerId: `${provider}-${form.email}`,
          name: form.name || form.email.split("@")[0] || "Orbita Traveller",
          email: form.email,
          phone: form.phone
        })
      });
      tokenStore.set(data.token);
      setUser(data.user);
      setPage(authReturnPage || (pendingCheckout ? "checkout" : "dashboard"));
      setAuthReturnPage?.(null);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      const data = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(form) });
      tokenStore.set(data.token);
      setUser(data.user);
      setPage(authReturnPage || (pendingCheckout ? "checkout" : "dashboard"));
      setAuthReturnPage?.(null);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const requestReset = async (event) => {
    event.preventDefault();
    try {
      const data = await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: resetForm.email || form.email }) });
      setMessage(data.resetLink ? `${data.message} Reset link for testing: ${data.resetLink}` : data.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    try {
      const data = await api("/auth/reset-password", { method: "POST", body: JSON.stringify({ token: resetForm.token, password: resetForm.password }) });
      tokenStore.set(data.token);
      setUser(data.user);
      window.history.replaceState({}, "", "/");
      setPage(authReturnPage || (pendingCheckout ? "checkout" : "dashboard"));
      setAuthReturnPage?.(null);
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (user) {
    return <section className="page-band account-page"><div className="page-heading"><UserRound size={34} /><div><h1>You are logged in</h1><p>Continue to your dashboard or complete the selected booking.</p></div></div><button className="primary" onClick={() => { setPage(authReturnPage || (pendingCheckout ? "checkout" : "dashboard")); setAuthReturnPage?.(null); }}>Continue</button></section>;
  }

  return (
    <section className="page-band account-page">
      {(authReturnPage || pendingCheckout) && <button type="button" className="checkout-back" onClick={returnToFlow}><ArrowLeft size={18} /> Back to booking</button>}
      <div className="page-heading"><UserRound size={34} /><div><h1>{mode === "forgot" ? "Reset your password" : mode === "reset" ? "Create a new password" : mode === "login" ? "Login to Orbita Travels" : "Create your Orbita Travels account"}</h1><p>{mode === "forgot" ? "Enter your registered email and we will prepare reset instructions." : mode === "reset" ? "Use the secure reset token from your email to set a new password." : "Email and mobile number are collected so ticket email and SMS gateways can be enabled later."}</p></div></div>
      {mode === "forgot" ? (
        <form className="auth-card" onSubmit={requestReset}>
          <input placeholder="Registered email address" value={resetForm.email} onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })} />
          <button className="primary" type="submit">Send reset instructions</button>
          <button className="link-button" type="button" onClick={() => { setMode("login"); setMessage(""); }}>Back to login</button>
          {message && <div className="success-note">{message}</div>}
        </form>
      ) : mode === "reset" ? (
        <form className="auth-card" onSubmit={resetPassword}>
          <input placeholder="Reset token" value={resetForm.token} onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })} />
          <input placeholder="New password" type="password" value={resetForm.password} onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })} />
          <button className="primary" type="submit">Update password</button>
          <button className="link-button" type="button" onClick={() => { setMode("login"); setMessage(""); }}>Back to login</button>
          {message && <div className="success-note">{message}</div>}
        </form>
      ) : (
        <form className="auth-card" onSubmit={submit}>
          <div className="segmented-auth"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button><button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button></div>
          {mode === "register" && <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
          <input placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {mode === "register" && <input placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {mode === "login" && <button className="forgot-link" type="button" onClick={() => { setMode("forgot"); setResetForm({ ...resetForm, email: form.email }); setMessage(""); }}>Forgot password?</button>}
          <button className="primary" type="submit">{mode === "login" ? "Login" : "Create account"}</button>
          <div className="oauth-divider"><span>or continue securely with</span></div>
          <div className="oauth-row">
            <button type="button" aria-label="Continue with Google" title="Continue with Google" onClick={() => oauthLogin("google")}><span className="social-icon google-mark">G</span></button>
            <button type="button" aria-label="Continue with Facebook" title="Continue with Facebook" onClick={() => oauthLogin("facebook")}><span className="social-icon facebook-mark">f</span></button>
            <button type="button" aria-label="Continue with Apple" title="Continue with Apple" onClick={() => oauthLogin("apple")}><span className="social-icon apple-mark">A</span></button>
          </div>
          {message && <div className="success-note">{message}</div>}
        </form>
      )}
    </section>
  );
}

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error("Razorpay checkout could not be loaded"));
  document.body.appendChild(script);
});

function CheckoutPage({ user, setPage, pendingCheckout, setPendingCheckout, refreshBookings }) {
  const [confirmed, setConfirmed] = useState(null);
  const [message, setMessage] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  if (!pendingCheckout) {
    return <section className="page-band"><div className="page-heading"><CalendarDays size={34} /><div><h1>No ticket selected</h1><p>Please select a journey first.</p></div></div><button className="primary" onClick={() => setPage("bus")}>Search buses</button></section>;
  }

  if (!user) {
    return <section className="page-band"><div className="page-heading"><UserRound size={34} /><div><h1>Login required</h1><p>Please login or register to review and purchase this ticket.</p></div></div><button className="primary" onClick={() => setPage("auth")}>Login or register</button></section>;
  }

  const purchase = async () => {
    const draft = pendingCheckout;
    const draftType = draft.route.type || draft.type || "bus";
    setPurchasing(true);
    setMessage("");
    try {
      const routeLineText = draft.route.name || (draftType === "hotel" ? `${draft.route.city || draft.route.origin}` : `${draft.route.origin} to ${draft.route.destination}`);
      const order = await api("/bookings/payments/order", {
        method: "POST",
        body: JSON.stringify({
          amount: draft.totalAmount,
          type: draftType,
          routeLine: routeLineText
        })
      });
      const isRazorpayTestMode = String(order.keyId || "").startsWith("rzp_test_") || order.testMode;
      let payment;
      if (isRazorpayTestMode) {
        payment = {
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: "test_mode",
          simulated: true
        };
      } else {
        await loadRazorpayCheckout();
        payment = await new Promise((resolve, reject) => {
          const checkout = new window.Razorpay({
            key: order.keyId,
            amount: order.amount,
            currency: order.currency || "INR",
            name: "Orbita Travels",
            description: routeLineText,
            order_id: order.id,
            prefill: {
              name: user.name,
              email: user.email,
              contact: draft.contact?.phone || user.phone || ""
            },
            notes: {
              type: draftType,
              route: routeLineText
            },
            theme: { color: "#0f62b7" },
            handler: (response) => resolve(response),
            modal: {
              ondismiss: () => reject(new Error("Payment was not completed"))
            }
          });
          checkout.open();
        });
      }
      const booking = await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          type: draftType,
          itemId: draft.route.id,
          travelDate: draft.query.date,
          selectedSeats: draft.selectedSeats || [],
          passengers: (draft.passengers || []).map((passenger, index) => ({ ...passenger, seat: draft.selectedSeats?.[index] || "" })),
          contact: draft.contact,
          totalAmount: draft.totalAmount,
          payment,
          metadata: {
            origin: draft.route.origin,
            destination: draft.route.destination,
            tripType: draft.query.tripType,
            returnDate: draft.query.returnDate,
            checkInDate: draft.query.checkInDate,
            checkOutDate: draft.query.checkOutDate,
            rooms: draft.query.rooms,
            boardingPoint: draft.boardingPoint,
            dropPoint: draft.dropPoint,
            boardingPointId: draft.boardingPointId,
            dropPointId: draft.dropPointId
          }
        })
      });
      setConfirmed(booking);
      await refreshBookings();
      setMessage("Payment received. Ticket sent to your email and mobile number.");
    } catch (error) {
      setMessage(error.message || "Payment or booking failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const draft = pendingCheckout;
  const draftType = draft.route.type || draft.type || "bus";
  const isBus = draftType === "bus";
  const isHotel = draftType === "hotel";
  const routeLine = isHotel ? `${draft.route.name || draft.route.providerName} · ${draft.route.city || draft.route.origin}` : `${draft.route.origin} to ${draft.route.destination} · ${draft.query.date}`;
  const updateDraftPassengers = (nextPassengers) => {
    setPendingCheckout((current) => {
      const base = current || draft;
      const passengers = typeof nextPassengers === "function" ? nextPassengers(base.passengers || []) : nextPassengers;
      return { ...base, passengers };
    });
  };
  const updateDraftContact = (nextContact) => {
    setPendingCheckout((current) => {
      const base = current || draft;
      const contact = typeof nextContact === "function" ? nextContact(base.contact || {}) : nextContact;
      return { ...base, contact };
    });
  };
  return (
    <section className="page-band checkout-page">
      {!confirmed && isBus && <button type="button" className="checkout-back" onClick={() => setPage("booking")}><ArrowLeft size={18} /> Back to seats</button>}
      <div className="page-heading"><CalendarDays size={34} /><div><h1>{confirmed ? "Booking successful" : isHotel ? "Review your stay" : "Review your ticket"}</h1><p>{confirmed ? "Your printable Orbita Travels booking is ready." : "Confirm traveller details before purchasing."}</p></div></div>
      {confirmed ? <OperatorTicket booking={confirmed} /> : <article className="print-ticket">
        <div className="ticket-head"><Logo /><strong>{confirmed?.bookingCode || "PNR will be generated after purchase"}</strong></div>
        <h2>{draft.route.providerName}</h2>
        <p>{routeLine}</p>
        {isBus ? (
          <div className="ticket-grid"><span>Boarding point<b>{draft.boardingPoint || "Not selected"}</b></span><span>Dropping point<b>{draft.dropPoint || "Not selected"}</b></span><span>Seats<b>{draft.selectedSeats.join(", ")}</b></span><span>Amount<b>₹{Number(draft.totalAmount).toLocaleString("en-IN")}</b></span></div>
        ) : isHotel ? (
          <div className="ticket-grid"><span>Check-in<b>{draft.query.checkInDate}</b></span><span>Check-out<b>{draft.query.checkOutDate}</b></span><span>Rooms<b>{draft.query.rooms || 1}</b></span><span>Amount<b>₹{Number(draft.totalAmount).toLocaleString("en-IN")}</b></span></div>
        ) : (
          <div className="ticket-grid"><span>From<b>{draft.route.origin}</b></span><span>To<b>{draft.route.destination}</b></span><span>Class<b>{draft.route.classType || "Economy"}</b></span><span>Amount<b>₹{Number(draft.totalAmount).toLocaleString("en-IN")}</b></span></div>
        )}
        {confirmed ? (
          <>
            <h3>{isHotel ? "Guest details" : "Passengers"}</h3>
            {(draft.passengers || []).map((passenger, index) => <div className="ticket-passenger" key={index}><span>{passenger.name || `${isHotel ? "Guest" : "Passenger"} ${index + 1}`}</span><span>{passenger.age || "-"} yrs</span><span>{passenger.gender}</span><b>{isBus ? draft.selectedSeats[index] : draft.route.classType || draft.query.rooms || "-"}</b></div>)}
          </>
        ) : (
          <PassengerForm
            query={draft.query}
            selectedSeats={draft.selectedSeats || []}
            passengers={draft.passengers || []}
            setPassengers={updateDraftPassengers}
            contact={draft.contact || {}}
            setContact={updateDraftContact}
            mode={draftType}
          />
        )}
        <p className="identity-note">{isBus ? "The booking person must show Aadhaar card or any equivalent identity card to the bus attendant at the time of boarding." : "Please carry a valid government-issued ID matching the traveller or guest details."}</p>
        {!confirmed ? <button className="primary" onClick={purchase} disabled={purchasing}>{purchasing ? "Processing payment..." : isHotel ? "Pay and book room" : "Pay and purchase ticket"}</button> : <><button className="primary" onClick={() => window.print()}>Print booking</button><button className="secondary-action" onClick={() => setPage("dashboard")}>Back to dashboard</button></>}
        {message && <div className="success-note">{confirmed ? <span>Booking confirmed with PNR <strong>{confirmed.bookingCode}</strong>. {message}</span> : <span>{message}</span>}</div>}
      </article>}
      {confirmed && <div className="ticket-confirm-actions"><button className="primary" onClick={() => window.print()}>Print booking</button><button className="secondary-action" onClick={() => setPage("dashboard")}>Back to dashboard</button>{message && <div className="success-note">Booking confirmed with PNR <strong>{confirmed.bookingCode}</strong>. {message}</div>}</div>}
    </section>
  );
}

function DashboardPage({ user, setUser, setPage, bookings, refreshBookings }) {
  if (!user) return <AuthPage user={user} setUser={setUser} setPage={setPage} pendingCheckout={null} />;
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: user.name || "", phone: user.phone || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [accountMessage, setAccountMessage] = useState("");
  useEffect(() => {
    setProfileForm({ name: user.name || "", phone: user.phone || "" });
  }, [user.id, user.name, user.phone]);
  const sorted = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const current = [sorted[0]].filter(Boolean);
  const previous = sorted.slice(1);
  const totalSpend = bookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
  const paidSpend = bookings.filter((booking) => booking.paymentStatus === "paid").reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
  const refundedAmount = bookings.filter((booking) => booking.paymentStatus === "refunded").reduce((sum, booking) => sum + Number(booking.metadata?.cancellation?.refundAmount || booking.totalAmount || 0), 0);
  const upcoming = bookings.filter((booking) => !["completed", "cancelled"].includes(booking.status)).length;
  const earnedFromBookings = bookings.reduce((sum, booking) => sum + Math.max(25, Math.floor(Number(booking.totalAmount || 0) / 100)), 0);
  const rewardPoints = Math.max(Number(user.rewardPoints || 0), earnedFromBookings);
  const busTrips = bookings.filter((booking) => booking.type === "bus").length;
  const railAirTrips = bookings.filter((booking) => ["train", "flight"].includes(booking.type)).length;
  const cancelBooking = async (booking) => {
    if (!window.confirm("Request cancellation and refund as per policy?")) return;
    setAccountMessage("");
    try {
      const updated = await api(`/bookings/${booking.id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason: "Customer requested cancellation" }) });
      setAccountMessage(updated.status === "cancelled" ? "Cancellation completed and refund processed as per policy." : "Cancellation request captured. Our team will review the provider/refund response.");
      refreshBookings();
    } catch (error) {
      setAccountMessage(error.message);
    }
  };
  const updateProfile = async (event) => {
    event.preventDefault();
    setAccountMessage("");
    try {
      const data = await api("/auth/me", { method: "PATCH", body: JSON.stringify(profileForm) });
      setUser(data.user);
      setAccountMessage(data.message);
    } catch (error) {
      setAccountMessage(error.message);
    }
  };
  const changePassword = async (event) => {
    event.preventDefault();
    setAccountMessage("");
    try {
      const data = await api("/auth/change-password", { method: "POST", body: JSON.stringify(passwordForm) });
      setUser(data.user);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setAccountMessage(data.message);
    } catch (error) {
      setAccountMessage(error.message);
    }
  };
  return (
    <section className="page-band dashboard-page">
      <div className="page-heading"><UserRound size={34} /><div><h1>{user.name}'s Dashboard</h1><p>Manage bookings, rewards, support and journey tracking.</p></div></div>
      <div className="customer-metrics">
        <article><CalendarDays /><span>Total bookings</span><strong>{bookings.length}</strong></article>
        <article><Gift /><span>Reward points</span><strong>{rewardPoints.toLocaleString("en-IN")}</strong></article>
        <article><Bus /><span>Bus journeys</span><strong>{busTrips}</strong></article>
        <article><Sparkles /><span>Paid travel value</span><strong>₹{paidSpend.toLocaleString("en-IN")}</strong></article>
      </div>
      {accountMessage && <div className="dashboard-note">{accountMessage}</div>}
      <div className="dashboard-grid">
        <article className="dash-panel account-panel">
          <h3>Profile details</h3>
          <form className="account-form" onSubmit={updateProfile}>
            <label>Full name<input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></label>
            <label>Email<input value={user.email} disabled /></label>
            <label>Mobile number<input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></label>
            <button type="submit">Save profile</button>
          </form>
        </article>
        <article className="dash-panel account-panel">
          <h3>Change password</h3>
          <form className="account-form" onSubmit={changePassword}>
            <label>Current password<input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder={user.authProvider === "email" ? "Required" : "Optional for social login"} /></label>
            <label>New password<input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} /></label>
            <button type="submit">Update password</button>
          </form>
        </article>
        <article className="dash-panel wide-panel"><h3>Current bookings</h3>{current.map((booking) => <BookingCard key={booking.id} booking={booking} onCancel={() => cancelBooking(booking)} onViewTicket={() => setSelectedTicket(booking)} />)}{!current.length && <p>No current bookings yet.</p>}</article>
        <article className="dash-panel"><h3>Previous bookings</h3>{previous.map((booking) => <BookingCard key={booking.id} booking={booking} compact onViewTicket={() => setSelectedTicket(booking)} />)}{!previous.length && <p>No previous bookings yet.</p>}</article>
        <article className="dash-panel"><h3>Quick actions</h3><button onClick={() => setPage("bus")}>Book bus</button><button onClick={() => setPage("flight")}>Book flight</button><button onClick={() => setPage("train")}>Book train</button><button onClick={() => setPage("support")}>Raise support request</button></article>
        <article className="dash-panel reward-panel wide-panel"><h3>Orbita Rewards and wallet</h3><strong>{rewardPoints.toLocaleString("en-IN")} points</strong><p>Earn points on every confirmed booking. Refunds are pushed to the original Razorpay payment method after cancellation approval.</p><div><span>Upcoming trips</span><b>{upcoming}</b></div><div><span>Rail and air trips</span><b>{railAirTrips}</b></div><div><span>Total booked value</span><b>₹{totalSpend.toLocaleString("en-IN")}</b></div><div><span>Refunded value</span><b>₹{refundedAmount.toLocaleString("en-IN")}</b></div></article>
      </div>
      {selectedTicket && <TicketWindow booking={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </section>
  );
}

function BookingCard({ booking, onCancel, compact, onViewTicket }) {
  const title = booking.TransportRoute?.providerName || booking.Hotel?.name || booking.TourPackage?.title || booking.metadata?.title || "Orbita Travels booking";
  const refund = booking.metadata?.cancellation?.refundAmount;
  const canCancel = !compact && !["cancel_requested", "cancelled", "completed"].includes(booking.status);
  return <div className="booking-card"><div><b>{booking.bookingCode}</b><span>{booking.type} · {title}</span></div><div><small>{booking.travelDate}</small><strong>₹{Number(booking.totalAmount).toLocaleString("en-IN")}</strong></div><div className="booking-finance-row"><span>Booking status <b>{booking.status}</b></span><span>Payment <b>{booking.paymentStatus}</b></span>{refund !== undefined && <span>Refund <b>₹{Number(refund).toLocaleString("en-IN")}</b></span>}</div><div className="tracking-line">Provider updates · {booking.metadata?.cancellation?.status || booking.metadata?.bdsdBookingError || "synced"}</div><div className="booking-actions"><button onClick={onViewTicket}>View ticket</button>{!compact && <><button>Modify</button>{canCancel && <button onClick={onCancel}>Cancel and refund</button>}<button>Re-book</button></>}</div></div>;
}

const ticketDate = (value, options = {}) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", ...options });
};

const ticketTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const ticketMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function ticketServiceNumber(booking) {
  return booking.TransportRoute?.externalRouteId || booking.TransportRoute?.routeCode || booking.metadata?.serviceNo || booking.bookingCode;
}

function ticketProviderPnr(booking) {
  const bdsd = booking.metadata?.bdsdBooking || {};
  return bdsd.PNR || bdsd.pnr || bdsd.TicketNo || bdsd.ticketNo || bdsd.BookingId || bdsd.bookingId || booking.bookingCode;
}

function OperatorTicket({ booking }) {
  const providerName = booking.TransportRoute?.providerName || booking.Hotel?.name || booking.TourPackage?.title || booking.metadata?.title || "Orbita Travels";
  const from = booking.metadata?.origin || booking.TransportRoute?.origin || booking.Hotel?.city || "-";
  const to = booking.metadata?.destination || booking.TransportRoute?.destination || booking.Hotel?.city || "-";
  const seats = booking.selectedSeats?.length ? booking.selectedSeats : (booking.passengers || []).map((passenger) => passenger.seat).filter(Boolean);
  const passengers = booking.passengers?.length ? booking.passengers : [{ name: "Passenger details not available", age: "-", gender: "-", seat: seats[0] || "-" }];
  const total = Number(booking.totalAmount || 0);
  const payment = booking.metadata?.payment || {};
  const cancellation = booking.metadata?.cancellation || {};
  const travelDate = booking.travelDate || booking.metadata?.travelDate;
  const departureTime = booking.TransportRoute?.departureTime || travelDate;
  const arrivalTime = booking.TransportRoute?.arrivalTime || booking.metadata?.arrivalTime;
  const busType = [booking.TransportRoute?.vehicleType, booking.TransportRoute?.classType].filter(Boolean).join(", ") || booking.type?.toUpperCase() || "Travel service";
  return (
    <article className="operator-ticket">
      <div className="ticket-print-meta"><span>{ticketDate(booking.createdAt, { hour: "2-digit", minute: "2-digit" })}</span><b>Ticket - Orbita Travels</b><span>1/1</span></div>
      <div className="ticket-promo-banner">
        <div><strong>ORBITA TRAVELS</strong><span>Confirmed journey ticket</span></div>
        <i aria-hidden="true" />
      </div>
      <div className="operator-brand-row"><Logo /><span>Support: Help and Support inside Orbita account</span></div>
      <div className="ticket-title-row">
        <div><h2>Orbita Ticket</h2><p>Booked on {ticketDate(booking.createdAt, { hour: "2-digit", minute: "2-digit" })}</p></div>
        <div><span>Booking ID: <b>{booking.bookingCode}</b></span><span>Bus Partner PNR: <b>{ticketProviderPnr(booking)}</b></span></div>
      </div>
      <div className="ticket-operator-row">
        <div><h3>{providerName}</h3><p>{seats.length || passengers.length} passenger(s) · {busType}</p><small>Bus start time: {ticketTime(departureTime)}</small></div>
        <div><h3>Service # {ticketServiceNumber(booking)}</h3><p>{providerName}</p><small>Payment: {booking.paymentStatus || "paid"} · Status: {booking.status || "confirmed"}</small></div>
      </div>
      <div className="ticket-trip-row">
        <div><span>Departure</span><h3>{from}</h3><p>{ticketDate(travelDate)}</p><b>{ticketTime(departureTime)}</b></div>
        <div><span>Boarding Point:</span><p>{booking.metadata?.boardingPoint || from}</p></div>
        <strong>→</strong>
        <div><span>Arrival</span><h3>{to}</h3><b>{ticketTime(arrivalTime)}</b></div>
        <div><span>Dropping Point:</span><p>{booking.metadata?.dropPoint || to}</p></div>
      </div>
      <div className="ticket-two-column">
        <section>
          <h3>Passenger Details</h3>
          <table>
            <thead><tr><th>Name</th><th>Gender</th><th>Age</th><th>Seat No</th></tr></thead>
            <tbody>{passengers.map((passenger, index) => <tr key={index}><td>{passenger.name || `Passenger ${index + 1}`}</td><td>{passenger.gender || "-"}</td><td>{passenger.age || "-"}</td><td>{passenger.seat || seats[index] || "-"}</td></tr>)}</tbody>
          </table>
        </section>
        <section>
          <h3>Payment Details</h3>
          <dl className="ticket-payment-list">
            <div><dt>Total fare</dt><dd>{ticketMoney(total)}</dd></div>
            <div><dt>Payment provider</dt><dd>{payment.provider || "Razorpay"}</dd></div>
            <div><dt>Payment ID</dt><dd>{payment.paymentId || "-"}</dd></div>
            <div className="amount-paid"><dt>Amount Paid</dt><dd>{ticketMoney(total)}</dd></div>
          </dl>
        </section>
      </div>
      <section className="ticket-info-block">
        <h3>Important information</h3>
        <ul>
          <li>Please reach the boarding point before the reporting time shared by the operator.</li>
          <li>Carry Aadhaar card or any valid government identity card while boarding.</li>
          <li>For operator or refund issues, raise a request from Help and Support with this booking ID.</li>
        </ul>
      </section>
      <div className="ticket-footer-grid">
        <section>
          <h3>Terms and Conditions</h3>
          <ul>
            <li>Departure and arrival times are tentative and may vary due to traffic, weather or operational changes.</li>
            <li>Passengers should reach the selected boarding point at least 15 minutes before scheduled departure.</li>
            <li>Orbita is not responsible for personal belongings left inside the vehicle.</li>
            <li>Cancellation charges are applied as per operator policy and original payment method timelines.</li>
          </ul>
        </section>
        <section>
          <h3>Cancellation Policy</h3>
          <table>
            <thead><tr><th>Cancellation Time</th><th>Refund</th><th>Refund Amount</th></tr></thead>
            <tbody>
              <tr><td>Before 24 hours</td><td>90%</td><td>{ticketMoney(Math.round(total * 0.9))}</td></tr>
              <tr><td>12 - 24 hours</td><td>75%</td><td>{ticketMoney(Math.round(total * 0.75))}</td></tr>
              <tr><td>6 - 12 hours</td><td>50%</td><td>{ticketMoney(Math.round(total * 0.5))}</td></tr>
              <tr><td>After cancellation</td><td>{cancellation.refundPercent ?? "-"}%</td><td>{cancellation.refundAmount !== undefined ? ticketMoney(cancellation.refundAmount) : "-"}</td></tr>
            </tbody>
          </table>
        </section>
      </div>
      <div className="ticket-copyright">Copyright Orbita Travels. All rights reserved.</div>
    </article>
  );
}

function TicketWindow({ booking, onClose }) {
  return (
    <div className="ticket-window-backdrop" role="dialog" aria-modal="true">
      <article className="ticket-window">
        <div className="ticket-window-head">
          <div>
            <span>Orbita Travels e-ticket</span>
            <h3>{booking.bookingCode}</h3>
          </div>
          <button className="ticket-window-close" onClick={onClose}>Close</button>
        </div>
        <div className="ticket-window-body">
          <OperatorTicket booking={booking} />
        </div>
      </article>
    </div>
  );
}

function SupportPage({ user, bookings }) {
  return <section className="page-band support-page"><div className="page-heading"><Headphones size={34} /><div><h1>Help and Support</h1><p>Get help with booking, boarding, cancellations, tracking, emergencies and feedback.</p></div></div><SupportForm user={user} bookings={bookings} /></section>;
}

function SupportForm({ user, bookings }) {
  const [support, setSupport] = useState({ bookingId: "", category: "general", priority: "normal", subject: "", message: "" });
  const [message, setMessage] = useState("");
  const createTicket = async () => {
    if (!user) return setMessage("Please login so our support team can connect this request to your account.");
    await api("/support/tickets", { method: "POST", body: JSON.stringify(support) });
    setMessage("Your request has been shared with Orbita Travels support.");
  };
  return <div className="support-card"><select value={support.bookingId} onChange={(e) => setSupport({ ...support, bookingId: e.target.value })}><option value="">Select booking if available</option>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.bookingCode}</option>)}</select><select value={support.category} onChange={(e) => setSupport({ ...support, category: e.target.value })}><option value="general">General</option><option value="boarding">Boarding</option><option value="technical_issue">Technical issue</option><option value="accident">Accident / emergency</option><option value="cancellation">Cancellation</option><option value="grievance">Grievance</option><option value="feedback">Feedback</option></select><select value={support.priority} onChange={(e) => setSupport({ ...support, priority: e.target.value })}><option value="normal">Normal</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option></select><input placeholder="Subject" value={support.subject} onChange={(e) => setSupport({ ...support, subject: e.target.value })} /><textarea placeholder="Tell us what happened" value={support.message} onChange={(e) => setSupport({ ...support, message: e.target.value })} /><button className="primary" onClick={createTicket}>Send request</button>{message && <div className="success-note">{message}</div>}</div>;
}

function FloatingAssistant({ user, bookings }) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([{ sender: "assistant", message: "Hi, I'm Tiara. I can help with booking, cancellation, boarding, tracking, emergencies and feedback." }]);
  const [text, setText] = useState("");
  const send = async (intent = "travel_assistance") => {
    if (!text.trim()) return;
    const outgoing = { sender: "customer", message: text };
    setChat((items) => [...items, outgoing]);
    if (user) {
      const data = await api("/support/chat", { method: "POST", body: JSON.stringify({ message: text, intent, bookingId: bookings[0]?.id || null }) });
      setChat((items) => [...items, { sender: "assistant", message: data.assistantMessage.message }]);
    } else {
      setChat((items) => [...items, { sender: "assistant", message: "I can guide you now. Login when you want us to attach this support to your booking." }]);
    }
    setText("");
  };
  return <div className={`floating-chat ${open ? "open" : ""}`}><button className="chat-launch" onClick={() => setOpen(!open)}><Sparkles size={22} /> Ask Tiara</button>{open && <div className="chat-panel"><h3><span><Bot size={19} /> Orbita Travels Assistant</span><button onClick={() => setOpen(false)} aria-label="Close assistant">×</button></h3><div className="chat-window">{chat.map((item, index) => <div key={index} className={`chat-bubble ${item.sender}`}>{item.message}</div>)}</div><textarea placeholder="Ask about booking, boarding, cancellation, tracking, accident support or feedback" value={text} onChange={(e) => setText(e.target.value)} /><div className="chat-actions"><button onClick={() => send("travel_assistance")}><MessageSquare size={16} /> Send</button><button className="urgent" onClick={() => send("emergency")}>Urgent help</button></div></div>}</div>;
}

const footerModalContent = {
  home: {
    eyebrow: "Orbita Travels",
    title: "Home",
    intro: "Orbita Travels brings buses, flights, trains, hotels and curated packages into one booking experience for Indian travellers.",
    bullets: ["Search trusted transport operators.", "Compare fares, timings and service details.", "Manage checkout, account and support from one place."]
  },
  offers: {
    eyebrow: "Travel Deals",
    title: "Offers",
    intro: "Offers are seasonal benefits across buses, hotels, flights and package journeys. Availability depends on route, operator and travel date.",
    bullets: ["Use visible offer codes only on eligible bookings.", "Discounts may not combine with every wallet, bank or operator promotion.", "Final benefits are shown before checkout."]
  },
  about: {
    eyebrow: "About",
    title: "About Orbita Travels",
    intro: "Orbita Travels is designed as a clean travel desk for planning, booking and managing journeys with practical support before and after departure.",
    bullets: ["Built for city-to-city travel discovery.", "Focused on transparent fares and passenger details.", "Support flows cover booking, boarding, cancellation and feedback."]
  },
  contact: {
    eyebrow: "Contact",
    title: "Contact Orbita Travels",
    intro: "For booking help, trip questions or service feedback, use the Help and Support page or the Tiara assistant available on the site.",
    bullets: ["Share your booking code when available.", "Use urgent priority for time-sensitive boarding or cancellation issues.", "Logged-in users can attach support requests to bookings."]
  },
  faqs: {
    eyebrow: "Help",
    title: "Frequently Asked Questions",
    intro: "Common questions are handled through support categories so the right team can respond with the correct booking context.",
    bullets: ["Can I cancel a ticket? Yes, according to the operator-specific cancellation window.", "Can I track a trip? Tracking details appear where live tracking is supported.", "Can I update passenger details? Contact support before travel if a correction is needed."]
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms",
    intro: "These general terms explain the commercial relationship between Orbita Travels, travellers and listed travel partners.",
    bullets: ["Orbita Travels presents travel inventory from operators and partners.", "Bookings are subject to availability, fare changes and partner rules.", "Customers are responsible for accurate passenger, contact and identity details."]
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy Notice",
    intro: "Orbita Travels collects only the details needed to search, book, support and communicate about journeys.",
    bullets: ["Contact details support ticket emails, SMS notifications and account communication.", "Booking details are used for confirmations, support and trip history.", "Payment processing is handled through secure payment partners when enabled."]
  },
  disclosure: {
    eyebrow: "Security",
    title: "Responsible Disclosure",
    intro: "We appreciate reports that help keep travellers and booking data safe.",
    bullets: ["Report suspected vulnerabilities with clear reproduction steps.", "Do not access, modify or expose another traveller's data.", "Give the team reasonable time to investigate before public disclosure."]
  },
  operators: {
    eyebrow: "Partners",
    title: "Operators",
    intro: "Orbita Travels lists transport and stay partners so travellers can compare practical options in one place.",
    bullets: ["Operator amenities, timings and cancellation rules may vary.", "Official logos and names remain trademarks of their respective owners.", "Service quality feedback helps improve future recommendations."]
  },
  routes: {
    eyebrow: "Routes",
    title: "Routes",
    intro: "Route pages help travellers discover popular city connections and start a bus search quickly.",
    bullets: ["Popular routes are grouped by travel demand and coverage.", "Availability depends on date, city pair and operator inventory.", "Use the search page for live fares and seat options."]
  },
  careers: {
    eyebrow: "Careers",
    title: "Careers",
    intro: "Orbita Travels is building tools for travel discovery, support and booking operations.",
    bullets: ["Product, support, operations and engineering roles may open as the platform expands.", "Customer empathy and reliability matter across every team.", "Use Contact or Support to register hiring-related interest."]
  },
  management: {
    eyebrow: "Company",
    title: "Our Management",
    intro: "Orbita Travels is managed with a focus on transparent journeys, useful support and dependable booking workflows.",
    bullets: ["Leadership priorities include service quality, traveller trust and partner coverage.", "Operational teams monitor support, fulfilment and product experience.", "Management updates will be published as the company grows."]
  },
  investors: {
    eyebrow: "Company",
    title: "Investors Relations",
    intro: "Investor updates will cover product expansion, partner coverage and customer experience milestones.",
    bullets: ["Current focus is product readiness and trusted travel workflows.", "Formal financial disclosures will be shared through approved company channels.", "Use Contact for investor communication requests."]
  },
  termsOfUse: {
    eyebrow: "Legal",
    title: "Terms of Use",
    intro: "These terms govern how customers use the Orbita Travels website, account features, search tools and support flows.",
    bullets: ["Do not misuse search, booking, support or account features.", "Keep login credentials secure and notify support about unauthorized activity.", "Website content, interface and data may not be copied or scraped without permission."]
  },
  career: {
    eyebrow: "Careers",
    title: "Career",
    intro: "Career enquiries can be shared with Orbita Travels as the product and support teams expand.",
    bullets: ["Include your area of interest and relevant experience.", "Support and operations roles value clear communication.", "Product and engineering roles value reliable execution and user empathy."]
  },
  customerService: {
    eyebrow: "Support",
    title: "Customer Service",
    intro: "Customer service helps with booking questions, boarding issues, cancellations, tracking and feedback.",
    bullets: ["Use Help and Support for requests tied to a booking.", "Choose urgent or emergency priority only for time-sensitive issues.", "Tiara can guide you before a support request is submitted."]
  },
  cancellation: {
    eyebrow: "Cancellation & Refunds",
    title: "Orbita Travels cancellation policy",
    intro: "Orbita Travels follows standard operator cancellation rules to keep refunds fair and transparent for every booking.",
    table: {
      headers: ["Cancellation window", "Refund"],
      rows: cancellationPolicyRows
    },
    bullets: [
      "Cancel more than 24 hours before departure to receive up to 90% of the base fare.",
      "Partial refunds apply for cancellations made between 6 and 24 hours before departure.",
      "No refund is provided for no-shows or cancellations within 6 hours of departure.",
      "Convenience and payment gateway charges are non-refundable.",
      "Approved refunds are processed within 5-7 working days to the original payment method.",
      "Operator cancellations qualify for a full refund or free rescheduling.",
      "One free date change may be allowed up to 12 hours before departure on selected services."
    ]
  }
};

function FooterInfoModal({ modalKey, onClose }) {
  const content = footerModalContent[modalKey] || footerModalContent.about;
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  return (
    <div className="policy-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="policy-title" onClick={onClose}>
      <article className="policy-modal" onClick={(event) => event.stopPropagation()}>
        <div className="policy-modal-head">
          <div>
            <span>{content.eyebrow}</span>
            <h2 id="policy-title">{content.title}</h2>
          </div>
          <button type="button" className="policy-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="policy-modal-body">
          <p>{content.intro}</p>
          {content.table && (
            <table>
              <tbody>
                <tr>{content.table.headers.map((header) => <th key={header}>{header}</th>)}</tr>
                {content.table.rows.map((row) => <tr key={row.join("-")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}
              </tbody>
            </table>
          )}
          <ul>{content.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </article>
    </div>
  );
}

function Footer({ setPage }) {
  const [footerTab, setFooterTab] = useState("routes");
  const [activeFooterModal, setActiveFooterModal] = useState(null);
  const activeLinks = footerRouteTabs[footerTab].links;
  const openFooterModal = (key) => setActiveFooterModal(key);

  return (
    <>
      <footer className="site-footer">
        <div className="footer-top">
          <img className="footer-logo" src={footerLogo} alt="Orbita Travels logo" />
          <p className="footer-tagline">Comfortable journeys, handpicked stays and memorable holidays across India.</p>
        </div>

        <div className="footer-tabs">
          {Object.entries(footerRouteTabs).map(([key, tab]) => (
            <button key={key} type="button" className={footerTab === key ? "active" : ""} onClick={() => setFooterTab(key)}>{tab.label}</button>
          ))}
        </div>

        <div className="footer-link-columns">
          {activeLinks.map((link) => (
            <button key={link} type="button" className="footer-route-link" onClick={() => setPage("bus")}>{link}</button>
          ))}
        </div>

        <div className="footer-important-links">
          {[
            ["home", "Home"],
            ["offers", "Offers"],
            ["about", "About"],
            ["contact", "Contact"],
            ["faqs", "FAQ's"],
            ["terms", "Terms"],
            ["privacy", "Privacy"],
            ["disclosure", "Responsible Disclosure"],
            ["operators", "Operators"],
            ["routes", "Routes"],
            ["careers", "Careers"],
            ["management", "Our Management"],
            ["investors", "Investors Relations"]
          ].map(([key, label]) => (
            <button key={label} type="button" onClick={() => openFooterModal(key)}>{label}</button>
          ))}
        </div>

        <div className="footer-bottom-bar">
          <span>Orbita Travels © {new Date().getFullYear()}. All brands are trademarks of their respective owners.</span>
          <div className="footer-legal">
            <button type="button" onClick={() => openFooterModal("privacy")}>Privacy</button>
            <button type="button" onClick={() => openFooterModal("termsOfUse")}>Terms of Use</button>
            <button type="button" onClick={() => openFooterModal("career")}>Career</button>
            <button type="button" onClick={() => openFooterModal("customerService")}>Customer Service</button>
            <button type="button" className="policy-link" onClick={() => openFooterModal("cancellation")}>Cancellation Policy</button>
          </div>
          <div className="footer-social">
            {["f", "X", "in", "▶"].map((icon) => (
              <a key={icon} href="#" aria-label={`Social ${icon}`} onClick={(event) => event.preventDefault()}>{icon}</a>
            ))}
          </div>
        </div>
      </footer>
      {activeFooterModal && <FooterInfoModal modalKey={activeFooterModal} onClose={() => setActiveFooterModal(null)} />}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
