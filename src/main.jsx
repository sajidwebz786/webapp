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
const operatorBrands = [
  { key: "apsrtc", match: "apsrtc", title: "APSRTC", logo: apsrtcLogo, subtitle: "Andhra Pradesh state services" },
  { key: "tgsrtc", match: "tgsrtc", title: "TGSRTC", logo: tgsrtcLogo, subtitle: "Telangana state services" },
  { key: "ksrtc", match: "ksrtc", title: "KSRTC", logo: ksrtcLogo, subtitle: "Karnataka state services" }
];

function operatorBrand(routeOrName) {
  const value = typeof routeOrName === "string" ? routeOrName : routeOrName?.providerName || "";
  return operatorBrands.find((brand) => value.toLowerCase().includes(brand.match));
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
      let score = index + 1000;
      if (!searchTerm) score = index;
      else if (normalizedName === searchTerm) score = -100;
      else if (normalizedName.startsWith(searchTerm)) score = -90;
      else if (words.some((word) => normalizeSearch(word).startsWith(searchTerm))) score = -80;
      else if (initials.startsWith(searchTerm)) score = -70;
      else if (normalizedName.includes(searchTerm)) score = -60;
      else score = Infinity;
      return { city, score };
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score || String(a.city.name).localeCompare(String(b.city.name)));
  const visibleCities = scoredCities.slice(0, 80).map(({ city }) => city);

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
            {city.name}
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
            value={open ? query : value}
            placeholder={open && value ? value : placeholder}
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
  const [authReturnPage, setAuthReturnPage] = useState(null);
  const [authMessage, setAuthMessage] = useState("");

  const refreshBookings = () => user && api("/bookings/mine").then(setBookings).catch(() => {});

  useEffect(() => {
    api("/catalog/cities").then(setCities);
    api("/catalog/packages").then(setPackages);
    api("/catalog/hotels").then(setHotels);
    api("/auth/me").then((data) => setUser(data.user)).catch(() => {});
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
        setPage("dashboard");
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
      setPage("dashboard");
    };
    finishGoogleLogin().catch((error) => {
      setAuthMessage(error.message || "Google sign-in failed. Please try again.");
      window.history.replaceState({}, "", "/");
      setPage("auth");
    });
  }, []);

  useEffect(() => { refreshBookings(); }, [user]);
  const immersiveBooking = page === "booking";

  return (
    <main>
      {!immersiveBooking && <TopNav page={page} setPage={setPage} user={user} setUser={setUser} />}
      {page === "bus" && <HomePage cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} packages={packages} pendingRoute={pendingRoute} setPendingRoute={setPendingRoute} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} />}
      {page === "flight" && <ServicePage type="flight" cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} />}
      {page === "train" && <ServicePage type="train" cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} />}
      {page === "hotels" && <HotelsPage hotels={hotels} setPage={setPage} setPendingCheckout={setPendingCheckout} />}
      {page === "packages" && <PackagesPage packages={packages} user={user} refreshBookings={refreshBookings} />}
      {page === "dashboard" && <DashboardPage user={user} setUser={setUser} setPage={setPage} bookings={bookings} refreshBookings={refreshBookings} />}
      {page === "support" && <SupportPage user={user} bookings={bookings} />}
      {page === "auth" && <AuthPage user={user} setUser={setUser} setPage={setPage} pendingCheckout={pendingCheckout} authReturnPage={authReturnPage} setAuthReturnPage={setAuthReturnPage} authMessage={authMessage} />}
      {page === "booking" && <BookingPage activeJourney={activeJourney} setPage={setPage} user={user} setPendingCheckout={setPendingCheckout} setAuthReturnPage={setAuthReturnPage} />}
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

function BusHero({ cities, user, setUser, setPage, refreshBookings, pendingRoute, setPendingRoute, setPendingCheckout, setActiveJourney }) {
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
      <JourneySearch type="bus" cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} pendingRoute={pendingRoute} setPendingRoute={setPendingRoute} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} compactHero />
    </section>
  );
}

function ServicePage({ type, cities, user, setUser, setPage, refreshBookings, setPendingCheckout, setActiveJourney }) {
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
      <JourneySearch type={type} cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} />
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

function JourneySearch({ type, cities, user, setUser, setPage, refreshBookings, compactHero, setPendingCheckout, setActiveJourney }) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const resultsRef = useRef(null);
  const selectedCities = cities.filter((city) => {
    const inScope = query.scope === "international" ? city.isInternational : !city.isInternational;
    const supportsMode = city.transportModes?.includes(type);
    return inScope && supportsMode;
  });
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
      setResults(data);
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
    setResults([]);
    setMessage("");
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
            <label><span>{type === "flight" ? <Plane /> : <Train />} From</span><select value={query.from} onChange={(e) => { const from = e.target.value; setResults([]); setQuery({ ...query, from, to: from === query.to ? "" : query.to }); }}><option value="">Select from city</option>{fromCities.map((city) => <option key={city.id} value={city.name}>{city.name}</option>)}</select></label>
            <label><span><MapPin /> To</span><select value={query.to} onChange={(e) => { const to = e.target.value; setResults([]); setQuery({ ...query, to, from: to === query.from ? "" : query.from }); }}><option value="">Select destination</option>{toCities.map((city) => <option key={city.id} value={city.name}>{city.name}</option>)}</select></label>
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

function BookingPage({ activeJourney, setPage, user, setPendingCheckout, setAuthReturnPage }) {
  const [step, setStep] = useState("points");
  const [liveRoute, setLiveRoute] = useState(null);
  const [livePoints, setLivePoints] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState(user ? [{ name: user.name || "", age: "", gender: "Male", seat: "" }] : [{ ...initialPassenger }]);
  const [contact, setContact] = useState(user ? { email: user.email || "", phone: user.phone || "", emergencyPhone: "" } : { email: "", phone: "", emergencyPhone: "" });
  const [boardingPoint, setBoardingPoint] = useState("");
  const [dropPoint, setDropPoint] = useState("");

  useEffect(() => {
    if (!user) return;
    setPassengers((current) => current.map((passenger, index) => index === 0 ? { ...passenger, name: passenger.name || user.name || "" } : passenger));
    setContact((current) => ({ ...current, email: current.email || user.email || "", phone: current.phone || user.phone || "" }));
  }, [user?.id]);

  useEffect(() => {
    const selectedRoute = activeJourney?.route;
    if (!selectedRoute?.id) return;
    setLiveRoute({ ...selectedRoute, seatLayout: null, seatLayoutLoading: true, seatLayoutError: false });
    setLivePoints(null);
    setSelectedSeats([]);
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

  if (!activeJourney) {
    return <section className="page-band"><div className="page-heading"><Bus size={34} /><div><h1>No journey selected</h1><p>Please choose a service from the search results first.</p></div></div><button className="primary" onClick={() => setPage("bus")}>Search buses</button></section>;
  }

  const { query } = activeJourney;
  const route = liveRoute || activeJourney.route;
  const isBus = route.type === "bus";

  const boardingPointOptions = livePoints?.boardingPoints?.length ? livePoints.boardingPoints : [];
  const droppingPointOptions = livePoints?.droppingPoints?.length ? livePoints.droppingPoints : [];
  const boardingPoints = boardingPointOptions.map((point) => point.name);
  const droppingPoints = droppingPointOptions.map((point) => point.name);
  const seats = isBus ? selectedSeats : [];
  const total = Number(route.price) * Math.max(isBus ? seats.length : passengers.length, 1);
  const canContinue = step === "points" ? boardingPoint && dropPoint : step === "seats" ? selectedSeats.length > 0 : true;

  const goBack = () => {
    if (step === "passenger" && isBus) return setStep("seats");
    if (step === "seats" && isBus) return setStep("points");
    setPage(route.type || "bus");
  };

  const goPassenger = () => {
    if (!user) {
      setAuthReturnPage("booking");
      setPage("auth");
      return;
    }
    setStep("passenger");
  };

  const buy = () => {
    const selectedBoarding = boardingPointOptions.find((point) => point.name === boardingPoint);
    const selectedDrop = droppingPointOptions.find((point) => point.name === dropPoint);
    setPendingCheckout({ route, query, selectedSeats: seats, passengers, contact, boardingPoint, dropPoint, boardingPointId: selectedBoarding?.id, dropPointId: selectedDrop?.id, totalAmount: total });
    setPage(user ? "checkout" : "auth");
  };

  return (
    <section className="booking-page">
      <div className="booking-window-head">
        <button className="window-close" onClick={goBack} aria-label={step === "points" ? "Close booking" : "Go back"}>
          {step === "points" ? <X size={26} /> : <ArrowLeft size={24} />}
        </button>
        <div className="booking-route-title"><b>{route.origin}</b><span>→</span><b>{route.destination}</b></div>
        <div className="window-offer">Last min. 10% OFF</div>
      </div>
      <div className="wizard-tabs booking-tabs">
        {(isBus ? ["points", "seats", "passenger"] : ["passenger"]).map((item, index) => <button key={item} className={step === item ? "active" : ""} onClick={() => item === "passenger" && !user ? (setAuthReturnPage("booking"), setPage("auth")) : setStep(item)}>{index + 1}. {item === "points" ? "Board/Drop point" : item === "seats" ? "Select seats" : "Passenger Info"}</button>)}
      </div>
      {isBus && step === "points" && <BoardDropStep boardingPoints={boardingPoints} droppingPoints={droppingPoints} boardingPoint={boardingPoint} setBoardingPoint={setBoardingPoint} dropPoint={dropPoint} setDropPoint={setDropPoint} />}
      {isBus && step === "seats" && <div className="dedicated-seat-screen"><PortraitSeatChart route={route} selected={selectedSeats} setSelected={setSelectedSeats} /><BusProfilePanel route={route} /></div>}
      {step === "passenger" && <div className="passenger-screen"><div><PassengerForm query={query} selectedSeats={selectedSeats} passengers={passengers} setPassengers={setPassengers} contact={contact} setContact={setContact} mode={route.type} /><p className="identity-note">{isBus ? "The booking person must show Aadhaar card or any equivalent identity card to the bus attendant at the time of boarding." : "Traveller name and contact details should match the government ID used during travel."}</p></div><FareSummary total={total} route={route} boardingPoint={boardingPoint} dropPoint={dropPoint} seats={seats} /></div>}
      <div className="booking-bottom-bar">
        <div><span>Amount to pay</span><strong>₹{Number(total).toLocaleString("en-IN")}</strong></div>
        {step !== "passenger" ? <button className="primary" disabled={!canContinue} onClick={() => step === "points" ? setStep("seats") : goPassenger()}>Continue</button> : <button className="primary" onClick={buy}>{isBus ? "Buy ticket" : "Review booking"}</button>}
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
  if (/^[LU]\d+$/i.test(seatName)) return "berth";
  if (type.includes("sleeper") || type.includes("berth") || htmlClass.includes("sleeper") || htmlClass.includes("berth")) return "berth";
  if (/\bb?hseat\b/.test(htmlClass) || type.includes("horizontal") || type === "2") return "horizontal-seat";
  return "seat";
}

function normalizeApiSeat(seat, index) {
  const column = numberFrom(seat.ColumnNo, seat.ColumnNumber, seat.Column, seat.SeatColumn, seat.column, seat.X, seat.x, seat.ColumnIndex, seat.ColNo, seat.Col);
  const row = numberFrom(seat.RowNo, seat.RowNumber, seat.Row, seat.SeatRow, seat.row, seat.Y, seat.y, seat.RowIndex, seat.RowId);
  if (!Number.isFinite(column) || !Number.isFinite(row)) return null;
  const width = Math.max(1, numberFrom(seat.Width, seat.SeatWidth, seat.width, seat.w) || 1);
  const height = Math.max(1, numberFrom(seat.Height, seat.SeatHeight, seat.height, seat.h) || 1);
  const isUpper = Boolean(seat.IsUpper || seat.Upper || seat.IsUpperDeck || String(seat.Deck || seat.deck || "").toLowerCase().includes("upper") || String(seat.DeckNo || "").toLowerCase() === "1");
  const id = String(seat.SeatName || seat.SeatNo || seat.SeatNumber || seat.id || seat.SeatIndex || index + 1);
  const rawType = String(seat.SeatType || seat.Type || seat.BerthType || seat.rawType || "").toLowerCase();
  const visualType = seatVisualType(seat, rawType);
  const isBerth = Boolean(seat.isBerth || visualType === "berth");
  const finalWidth = isBerth && width > height ? Math.max(1, height) : width;
  const finalHeight = isBerth && width > height ? Math.max(2, width) : (isBerth ? Math.max(2, height) : height);
  return {
    ...seat,
    id,
    label: seat.SeatName || seat.label || id,
    deck: isUpper ? "upper" : "lower",
    row,
    column,
    width: finalWidth,
    height: finalHeight,
    isBerth,
    visualType,
    isWalkway: Boolean(seat.isWalkway || seat.IsWalkway)
  };
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

function buildDeckLayout(seats) {
  const measuredSeats = seats.map(normalizeApiSeat).filter(Boolean);
  if (!measuredSeats.length) return { seats: [], rows: [], columns: 0 };

  const rawRows = [...new Set(measuredSeats.map((seat) => seat.row))].sort((a, b) => a - b);
  const rawColumns = [...new Set(measuredSeats.map((seat) => seat.column))].sort((a, b) => a - b);
  const shouldRotateLandscape = rawColumns.length > rawRows.length + 2 && rawColumns.length > 5;
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
  const aisleAfter = aisleAfterColumn(shiftedSeats);
  const normalizedSeats = shiftedSeats.map((seat) => ({
    ...seat,
    column: aisleAfter !== null && seat.column > aisleAfter ? seat.column + 1 : seat.column
  }));
  const collisionSafeSeats = resolveSeatCollisions(normalizedSeats);
  const rowCount = Math.max(...collisionSafeSeats.map((seat) => seat.row + (seat.height || 1) - 1));
  const columns = Math.max(...collisionSafeSeats.map((seat) => seat.column + (seat.width || 1) - 1));
  const hasBerths = collisionSafeSeats.some((seat) => seat.isBerth);
  const seatTrack = hasBerths ? "54px" : "42px";
  const rowTrack = hasBerths ? "52px" : "44px";
  const columnTracks = Array.from({ length: columns }, (_, index) => (index + 1 === (aisleAfter || 0) + 1 ? "38px" : seatTrack)).join(" ");
  return {
    seats: collisionSafeSeats.sort((a, b) => a.row - b.row || a.column - b.column),
    rows: rowCount,
    columns,
    columnTracks,
    rowTrack,
    rotated: shouldRotateLandscape
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

  const apiSeats = extractSeatList(route.seatLayout).map(normalizeApiSeat).filter(Boolean);
  const visibleSeats = apiSeats.filter((seat) => !seat.isWalkway);
  if (route.seatLayoutError || !route.seatLayout || !visibleSeats.length) {
    return <div className="empty-results">No seats to show for this bus.</div>;
  }

  const lowerSeats = visibleSeats.filter((seat) => seat.deck !== "upper");
  const upperSeats = visibleSeats.filter((seat) => seat.deck === "upper");
  const lower = buildDeckLayout(lowerSeats);
  const upper = buildDeckLayout(upperSeats);
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
    const sold = unavailable.has(seat.id);
    const chosen = selected.includes(seat.id);
    const women = Boolean(seat.IsLadiesSeat || seat.ladies);
    const isBerth = Boolean(seat.isBerth);
    const isHorizontalSeat = !isBerth && seat.visualType === "horizontal-seat";
    const fare = Number(seat.SeatFare || seat.Price?.OfferedPrice || seat.fare || 0) || Math.round(Number(baseFare) * (seat.fareMultiplier || 1));
    
    return (
      <button
        key={seat.id}
        className={`${isBerth ? "sleeper-berth" : "chair-seat"} ${isHorizontalSeat ? "horizontal-seat" : ""} ${sold ? "sold" : ""} ${chosen ? "chosen" : ""} ${women ? "women" : ""}`}
        onClick={() => toggle(seat.id)}
        aria-label={`${title} seat ${seat.id}`}
        style={{
          gridColumnStart: seat.column,
          gridColumnEnd: `span ${seat.width || 1}`,
          gridRowStart: seat.row,
          gridRowEnd: `span ${seat.height || 1}`,
          alignSelf: isBerth ? "start" : "stretch",
          justifySelf: isBerth ? "center" : "stretch",
          ...(isBerth ? { width: 46, height: Math.max(104, Math.min(132, ((seat.height || 2) * 52) + (((seat.height || 2) - 1) * 12))) } : {})
        }}
      >
        <b>{seat.SeatName || seat.label || seat.id}</b>
        {isBerth ? <span className="pillow" /> : <Armchair size={17} />}
        <small>{sold ? "Sold" : `₹${fare}`}</small>
      </button>
    );
  };

  return (
    <article className={`deck-card ${layout.rotated ? "rotated-layout" : ""}`}>
      <div className="deck-head"><h3>{title}</h3><span>Driver</span></div>
      <div className="bus-front-marker"><i /> <b>FRONT OF VEHICLE</b></div>
      <div className="vehicle-icons"><span>WC</span><span>Door</span></div>
      <div className="deck-seat-scroll" aria-label={`${title} seat layout`}>
        <div className="portrait-seat-grid live-seat-grid" style={{
          gridTemplateColumns: layout.columnTracks || `repeat(${layout.columns || 4}, 46px)`,
          gridTemplateRows: `repeat(${layout.rows || 1}, ${layout.rowTrack || "46px"})`,
          gap: "12px 14px",
          justifyContent: "center",
        }}>
          {layout.seats.map(renderSeat)}
        </div>
      </div>
      <div className="rear-marker">REAR</div>
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
  const total = Number(route.price) * Math.max(seats.length, passengers.length);
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
  return <article className="point-card"><h3>{title}</h3><p>{subtitle}</p>{points.map((point, index) => <button key={point} className={selected === point ? "active" : ""} onClick={() => setSelected(point)}><b>{index === 0 ? start : index === 1 ? "06:55" : "07:05"}</b><span>{point}<small>{point.toUpperCase()}</small></span><i /></button>)}</article>;
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
  const [sortBy, setSortBy] = useState("price");
  const [popularTab, setPopularTab] = useState("boarding");
  const [selectedPoint, setSelectedPoint] = useState("");
  const [busPartner, setBusPartner] = useState("");
  const routeMinPrice = Math.min(...results.map((route) => Number(route.price || 0)), 0);
  const routeMaxPrice = Math.max(...results.map((route) => Number(route.price || 0)), 0);
  const [minPrice, setMinPrice] = useState(routeMinPrice);
  const [maxPrice, setMaxPrice] = useState(routeMaxPrice);
  const stateTabs = type === "bus" ? operatorBrands.filter((brand) => results.some((route) => operatorBrand(route)?.key === brand.key)) : [];

  useEffect(() => {
    setMinPrice(routeMinPrice);
    setMaxPrice(routeMaxPrice);
    setActiveOperator("all");
    setDepartureSlot("any");
    setSortBy("price");
    setSelectedPoint("");
    setBusPartner("");
    setFilters([]);
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

  const boardingPoints = [...new Set(results.flatMap((route) => routeBoardingPoints(route).map((point) => point.name.split(" ")[0])))].slice(0, 8);
  const droppingPoints = [...new Set(results.flatMap((route) => routeDroppingPoints(route).map((point) => point.name.split(" ")[0])))].slice(0, 8);
  const operators = [...new Set(results.map((route) => route.providerName))].slice(0, 8);

  const operatorFiltered = type === "bus" && stateTabs.length
    ? results.filter((route) => activeOperator === "all" ? true : activeOperator === "private" ? !operatorBrand(route) : operatorBrand(route)?.key === activeOperator)
    : results;

  const filtered = operatorFiltered
    .filter((route) => Number(route.price) >= minPrice && Number(route.price) <= maxPrice)
    .filter((route) => departureSlot === "any" || departureSlots.find((slot) => slot.key === departureSlot)?.test(route))
    .filter((route) => !busPartner || route.providerName === busPartner)
    .filter((route) => !selectedPoint || routeBoardingPoints(route).some((point) => point.name.includes(selectedPoint)) || routeDroppingPoints(route).some((point) => point.name.includes(selectedPoint)) || route.providerName.includes(selectedPoint))
    .filter((route) => filters.every((key) => filterOptions.find((item) => item.key === key)?.test(route)))
    .sort((a, b) => {
      if (sortBy === "price") return Number(a.price) - Number(b.price);
      if (sortBy === "seats") return availableSeats(b) - availableSeats(a);
      if (sortBy === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === "arrival") return new Date(a.arrivalTime) - new Date(b.arrivalTime);
      if (sortBy === "departure") return new Date(a.departureTime) - new Date(b.departureTime);
      return 0;
    });

  const toggleFilter = (key) => setFilters((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  const clearFilters = () => { setFilters([]); setDepartureSlot("any"); setMinPrice(routeMinPrice); setMaxPrice(routeMaxPrice); setBusPartner(""); setSelectedPoint(""); setActiveOperator("all"); };

  const sortOptions = [
    ["price", "Price"],
    ["seats", "Seats"],
    ["rating", "Ratings"],
    ["arrival", "Arrival Time"],
    ["departure", "Departure Time"]
  ];

  const offerCards = [
    { title: "Flash Offer", tone: "flash", icon: Tag },
    { title: "Advance Booking", tone: "advance", icon: CalendarDays },
    { title: "Price Drop", tone: "drop", icon: Percent }
  ];

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
              {label} ↑
            </button>
          ))}
          <span className="result-count"><Bus size={16} /> Showing {filtered.length} {type === "bus" ? "buses" : type === "flight" ? "flights" : "trains"}{query?.from && query?.to ? ` · ${query.from} to ${query.to}` : ""} on this route</span>
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

        {type === "bus" && stateTabs.length > 0 && (
          <div className="operator-tabs">
            <button className={activeOperator === "all" ? "active" : ""} onClick={() => setActiveOperator("all")}>All buses</button>
            <button className={activeOperator === "private" ? "active" : ""} onClick={() => setActiveOperator("private")}>Private buses</button>
            {stateTabs.map((brand) => <button key={brand.key} className={activeOperator === brand.key ? "active" : ""} onClick={() => setActiveOperator(brand.key)}><img src={brand.logo} alt={`${brand.title} logo`} /> {brand.title}</button>)}
          </div>
        )}

        <div className="mini-offers"><article>Free cancellation</article><article>Flexible date change</article><article>Women traveller care</article></div>

        <div className="result-list">
          {filtered.map((route) => {
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
          })}
          {!filtered.length && <div className="empty-results">No services match these filters. Remove one filter to see more options.</div>}
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
      await loadRazorpayCheckout();
      const payment = await new Promise((resolve, reject) => {
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
      <article className="print-ticket">
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
      </article>
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

function TicketWindow({ booking, onClose }) {
  const providerName = booking.TransportRoute?.providerName || booking.Hotel?.name || booking.TourPackage?.title || booking.metadata?.title || "Orbita Travels";
  const from = booking.metadata?.origin || booking.TransportRoute?.origin || "-";
  const to = booking.metadata?.destination || booking.TransportRoute?.destination || "-";
  const seats = booking.selectedSeats?.length ? booking.selectedSeats : (booking.passengers || []).map((passenger) => passenger.seat).filter(Boolean);
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
          <article className="print-ticket">
            <div className="ticket-head"><Logo /><strong>{booking.bookingCode}</strong></div>
            <h2>{providerName}</h2>
            <p>{from} to {to} · {booking.travelDate}</p>
            <div className="ticket-grid">
              <span>Status<b>{booking.status}</b></span>
              <span>Payment<b>{booking.paymentStatus}</b></span>
              <span>Seats<b>{seats.length ? seats.join(", ") : "-"}</b></span>
              <span>Amount<b>₹{Number(booking.totalAmount).toLocaleString("en-IN")}</b></span>
            </div>
            {booking.metadata?.payment && <div className="ticket-grid">
              <span>Payment provider<b>{booking.metadata.payment.provider || "razorpay"}</b></span>
              <span>Order ID<b>{booking.metadata.payment.orderId || "-"}</b></span>
              <span>Payment ID<b>{booking.metadata.payment.paymentId || "-"}</b></span>
              <span>Verified<b>{booking.metadata.payment.verified ? "Yes" : "Pending"}</b></span>
            </div>}
            {booking.metadata?.cancellation && <div className="ticket-grid">
              <span>Cancellation<b>{booking.metadata.cancellation.status}</b></span>
              <span>Refund policy<b>{booking.metadata.cancellation.refundPercent}%</b></span>
              <span>Refund amount<b>₹{Number(booking.metadata.cancellation.refundAmount || 0).toLocaleString("en-IN")}</b></span>
              <span>Refund ID<b>{booking.metadata.cancellation.refund?.id || booking.metadata.cancellation.refund?.error || "-"}</b></span>
            </div>}
            <h3>Passengers</h3>
            {(booking.passengers || []).map((passenger, index) => (
              <div className="ticket-passenger" key={index}>
                <span>{passenger.name || `Passenger ${index + 1}`}</span>
                <span>{passenger.age || "-"} yrs</span>
                <span>{passenger.gender || "-"}</span>
                <b>{passenger.seat || seats[index] || "-"}</b>
              </div>
            ))}
            {!(booking.passengers || []).length && <div className="ticket-passenger"><span>Passenger details not available</span><span>-</span><span>-</span><b>-</b></div>}
            <p className="identity-note">Please carry a valid ID proof while boarding.</p>
          </article>
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
