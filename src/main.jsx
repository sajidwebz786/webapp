import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Armchair, BedDouble, Bot, BriefcaseBusiness, Bus, CalendarDays, Gift, Headphones, Hotel, LogOut, MapPin, MessageSquare, Plane, Search, ShieldCheck, Sparkles, Train, UserRound } from "lucide-react";
import { api, tokenStore } from "./services/api";
import { Logo } from "./components/Logo";
import apsrtcLogo from "./assets/images/apsrtc-logo.png";
import ksrtcLogo from "./assets/images/ksrtc-logo.png";
import tgsrtcLogo from "./assets/images/tgsrtc-logo.jpg";
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

  const refreshBookings = () => user && api("/bookings/mine").then(setBookings).catch(() => {});

  useEffect(() => {
    api("/catalog/cities").then(setCities);
    api("/catalog/packages").then(setPackages);
    api("/catalog/hotels").then(setHotels);
    api("/auth/me").then((data) => setUser(data.user)).catch(() => {});
  }, []);

  useEffect(() => {
    const finishGoogleLogin = async () => {
      if (!window.location.pathname.includes("/auth/google/callback") || !window.location.hash.includes("access_token")) return;
      const hash = new URLSearchParams(window.location.hash.slice(1));
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
    finishGoogleLogin().catch(() => setPage("auth"));
  }, []);

  useEffect(() => { refreshBookings(); }, [user]);
  const immersiveBooking = page === "booking";

  return (
    <main>
      {!immersiveBooking && <TopNav page={page} setPage={setPage} user={user} setUser={setUser} />}
      {page === "bus" && <HomePage cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} packages={packages} pendingRoute={pendingRoute} setPendingRoute={setPendingRoute} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} />}
      {page === "flight" && <ServicePage type="flight" cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} />}
      {page === "train" && <ServicePage type="train" cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} />}
      {page === "hotels" && <HotelsPage hotels={hotels} user={user} refreshBookings={refreshBookings} />}
      {page === "packages" && <PackagesPage packages={packages} user={user} refreshBookings={refreshBookings} />}
      {page === "dashboard" && <DashboardPage user={user} setUser={setUser} setPage={setPage} bookings={bookings} refreshBookings={refreshBookings} />}
      {page === "support" && <SupportPage user={user} bookings={bookings} />}
      {page === "auth" && <AuthPage user={user} setUser={setUser} setPage={setPage} pendingCheckout={pendingCheckout} />}
      {page === "booking" && <BookingPage activeJourney={activeJourney} setPage={setPage} user={user} setPendingCheckout={setPendingCheckout} />}
      {page === "checkout" && <CheckoutPage user={user} setPage={setPage} pendingCheckout={pendingCheckout} setPendingCheckout={setPendingCheckout} refreshBookings={refreshBookings} />}
      {!immersiveBooking && <FloatingAssistant user={user} bookings={bookings} />}
      {!immersiveBooking && <Footer setPage={setPage} />}
    </main>
  );
}

function TopNav({ page, setPage, user, setUser }) {
  return (
    <header className="top-shell">
      <nav className="top-nav">
        <button className="brand-button" onClick={() => setPage("bus")}><Logo /></button>
        <div className="service-nav">
          {services.map(({ key, label, icon: Icon }) => (
            <button key={key} className={page === key ? "active" : ""} onClick={() => setPage(key)}>
              <Icon size={24} /><span>{label}</span>
            </button>
          ))}
        </div>
        <div className="utility-nav">
          <button onClick={() => setPage(user ? "dashboard" : "auth")}><CalendarDays size={20} /> Bookings</button>
          <button onClick={() => setPage("support")}><Headphones size={20} /> Help</button>
          {user ? (
            <button onClick={() => { tokenStore.clear(); setUser(null); setPage("auth"); }}><LogOut size={20} /> Logout</button>
          ) : (
            <button onClick={() => setPage("auth")}><UserRound size={20} /> Account</button>
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
        <div className="hero-copy">
          <span className="eyebrow">Travel across India with confidence</span>
          <h1>India’s refined bus ticket booking experience</h1>
          <p>Compare trusted operators, choose seats, manage trips and get help before, during and after your journey.</p>
        </div>
      </div>
      <JourneySearch type="bus" cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} pendingRoute={pendingRoute} setPendingRoute={setPendingRoute} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} compactHero />
    </section>
  );
}

function ServicePage({ type, cities, user, setUser, setPage, refreshBookings, setPendingCheckout, setActiveJourney }) {
  const copy = {
    flight: ["Flights", "Fly between Indian cities with clear fares and smooth traveller details.", Plane],
    train: ["Train Tickets", "Plan comfortable rail journeys with class options, passenger details and support.", Train]
  };
  const [title, text, Icon] = copy[type];
  return (
    <section className="page-band service-page">
      <div className="page-heading"><Icon size={34} /><div><h1>{title}</h1><p>{text}</p></div></div>
      <JourneySearch type={type} cities={cities} user={user} setUser={setUser} setPage={setPage} refreshBookings={refreshBookings} setPendingCheckout={setPendingCheckout} setActiveJourney={setActiveJourney} />
    </section>
  );
}

function JourneySearch({ type, cities, user, setUser, setPage, refreshBookings, compactHero, setPendingCheckout, setActiveJourney }) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const resultsRef = useRef(null);
  const selectedCities = cities.filter((city) => query.scope === "international" ? city.isInternational : !city.isInternational);
  const canSearch = query.from && query.to && query.from !== query.to && query.date && (type === "flight" ? true : query.scope === "domestic");

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
      if (!silent) {
        window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (type !== "flight" && query.scope !== "domestic") {
      setQuery({ ...query, scope: "domestic", from: "", to: "" });
    }
    setResults([]);
    setMessage("");
  }, [type, query.scope]);

  return (
    <div className={`journey-module ${compactHero ? "hero-search" : ""}`}>
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
      <div className="main-search-row">
        <label><span>{type === "bus" ? <Bus /> : type === "flight" ? <Plane /> : <Train />} From</span><select value={query.from} onChange={(e) => { setResults([]); setQuery({ ...query, from: e.target.value }); }}><option value="">Select from city</option>{selectedCities.map((city) => <option key={city.id} value={city.name}>{city.name}</option>)}</select></label>
        <label><span><MapPin /> To</span><select value={query.to} onChange={(e) => { setResults([]); setQuery({ ...query, to: e.target.value }); }}><option value="">Select destination</option>{selectedCities.map((city) => <option key={city.id} value={city.name}>{city.name}</option>)}</select></label>
        <label><span><CalendarDays /> Date of journey</span><input type="date" value={query.date} onChange={(e) => setQuery({ ...query, date: e.target.value })} /></label>
        {query.tripType === "round-trip" && <label><span><CalendarDays /> Return</span><input type="date" value={query.returnDate} onChange={(e) => setQuery({ ...query, returnDate: e.target.value })} /></label>}
        <label><span><UserRound /> Travellers</span><input type="number" min="1" max="6" value={query.travellers} onChange={(e) => setQuery({ ...query, travellers: Number(e.target.value) })} /></label>
      </div>
      <button className={`search-pill ${searching ? "is-loading" : ""}`} onClick={() => search(false)} disabled={searching || !canSearch}>
        <Search size={22} /> {searching ? "Finding best options..." : `Search ${type === "bus" ? "buses" : type === "flight" ? "flights" : "trains"}`}
      </button>
      {query.scope === "international" && <p className="soft-note">International destinations will be enabled in the next expansion.</p>}
      {searching && <div className="search-feedback">Checking timings, fares and available seats for your route.</div>}
      {message && <div className="search-feedback">{message}</div>}
      <div ref={resultsRef}>
      <JourneyResults type={type} results={results} onViewSeats={(route) => { setActiveJourney({ route, query, type }); setPage("booking"); }} />
      </div>
    </div>
  );
}

function BookingPage({ activeJourney, setPage, user, setPendingCheckout }) {
  const [step, setStep] = useState("points");
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

  if (!activeJourney) {
    return <section className="page-band"><div className="page-heading"><Bus size={34} /><div><h1>No journey selected</h1><p>Please choose a service from the search results first.</p></div></div><button className="primary" onClick={() => setPage("bus")}>Search buses</button></section>;
  }

  const { route, query } = activeJourney;
  const boardingPoints = [`${route.origin} Central`, `${route.origin} Circle`, `${route.origin} Bus Terminal`, `${route.origin} Highway Pickup`];
  const droppingPoints = [`${route.destination} Central`, `${route.destination} Market`, `${route.destination} Bus Terminal`, `${route.destination} City Drop`];
  const seats = selectedSeats.length ? selectedSeats : passengers.map((_, index) => `AUTO-${index + 1}`);
  const total = Number(route.price) * Math.max(seats.length, passengers.length);
  const canContinue = step === "points" ? boardingPoint && dropPoint : step === "seats" ? selectedSeats.length > 0 : true;

  const buy = () => {
    setPendingCheckout({ route, query, selectedSeats: seats, passengers, contact, boardingPoint, dropPoint, totalAmount: total });
    setPage(user ? "checkout" : "auth");
  };

  return (
    <section className="booking-page">
      <div className="booking-window-head">
        <button className="window-close" onClick={() => setPage(route.type || "bus")}>×</button>
        <div className="booking-route-title"><b>{route.origin}</b><span>→</span><b>{route.destination}</b></div>
        <div className="window-offer">Last min. 10% OFF</div>
      </div>
      <div className="wizard-tabs booking-tabs">
        {["points", "seats", "passenger"].map((item, index) => <button key={item} className={step === item ? "active" : ""} onClick={() => setStep(item)}>{index + 1}. {item === "points" ? "Board/Drop point" : item === "seats" ? "Select seats" : "Passenger Info"}</button>)}
      </div>
      {step === "points" && <BoardDropStep boardingPoints={boardingPoints} droppingPoints={droppingPoints} boardingPoint={boardingPoint} setBoardingPoint={setBoardingPoint} dropPoint={dropPoint} setDropPoint={setDropPoint} />}
      {step === "seats" && <div className="dedicated-seat-screen"><PortraitSeatChart route={route} selected={selectedSeats} setSelected={setSelectedSeats} /><BusProfilePanel route={route} /></div>}
      {step === "passenger" && <div className="passenger-screen"><div><PassengerForm query={query} selectedSeats={selectedSeats} passengers={passengers} setPassengers={setPassengers} contact={contact} setContact={setContact} /><p className="identity-note">The booking person must show Aadhaar card or any equivalent identity card to the bus attendant at the time of boarding.</p></div><FareSummary total={total} route={route} boardingPoint={boardingPoint} dropPoint={dropPoint} seats={seats} /></div>}
      <div className="booking-bottom-bar">
        <div><span>Amount to pay</span><strong>₹{Number(total).toLocaleString("en-IN")}</strong></div>
        {step !== "passenger" ? <button className="primary" disabled={!canContinue} onClick={() => setStep(step === "points" ? "seats" : "passenger")}>Continue</button> : <button className="primary" onClick={buy}>Buy ticket</button>}
      </div>
    </section>
  );
}

function PortraitSeatChart({ route, selected, setSelected }) {
  const unavailable = new Set(route.seatLayout?.unavailable || []);
  const layoutType = String(route.seatLayout?.type || route.classType || "").toLowerCase();
  const isSleeper = layoutType.includes("sleeper");
  const isMixed = layoutType.includes("mixed") || layoutType.includes("sleeper-seater");
  const seats = route.seatLayout?.seats || [];
  const seatsPerRow = isSleeper || isMixed ? 3 : 4;
  const rowsPerDeck = isSleeper || isMixed ? 10 : 11;
  
  const lower = completeDeckSeats(
    isSleeper || isMixed
      ? seats.filter((seat) => seat.deck === "lower" && !seat.isWalkway)
      : seats.filter((seat) => !seat.isWalkway),
    "L",
    seatsPerRow,
    rowsPerDeck,
    route.price
  );
  
  const upper = completeDeckSeats(
    isSleeper || isMixed
      ? seats.filter((seat) => seat.deck === "upper" && !seat.isWalkway)
      : [],
    "U",
    seatsPerRow,
    rowsPerDeck,
    route.price
  );

  const toggle = (id) => {
    if (unavailable.has(id)) return;
    setSelected(selected.includes(id) ? selected.filter((seat) => seat !== id) : [...selected, id]);
  };

  return (
    <div className="portrait-chart-wrap">
      <Deck title="Lower deck" seats={lower} unavailable={unavailable} selected={selected} toggle={toggle} sleeper={isSleeper} mixed={isMixed} baseFare={route.price} />
      {(isSleeper || isMixed) && <Deck title="Upper deck" seats={upper} unavailable={unavailable} selected={selected} toggle={toggle} sleeper={isSleeper} mixed={isMixed} baseFare={route.price} />}
      <div className="seat-legend vibrant"><span className="available-seat">Available</span><span className="selected-seat">Selected</span><span className="female-seat">Women</span><span className="sold-seat">Sold</span></div>
    </div>
  );
}

function completeDeckSeats(seats, prefix, seatsPerRow, rowsPerDeck, baseFare) {
  const minimum = seatsPerRow * rowsPerDeck;
  const roundedRealCount = Math.ceil(Math.max(seats.length, minimum) / seatsPerRow) * seatsPerRow;
  const targetCount = Math.max(minimum, roundedRealCount);
  const existing = new Set(seats.map((seat) => seat.id));
  const completed = [...seats];
  for (let index = seats.length; index < targetCount; index += 1) {
    let id = `${prefix}${index + 1}`;
    while (existing.has(id)) id = `${prefix}${index + 1}-${existing.size}`;
    existing.add(id);
    completed.push({
      id,
      fareMultiplier: index % 5 === 0 ? 1.1 : index % 4 === 0 ? 0.92 : 1,
      generated: true,
      baseFare,
    });
  }
  return completed;
}

function Deck({ title, seats, unavailable, selected, toggle, sleeper, mixed, baseFare }) {
  const isSleeperLayout = sleeper || mixed;

  const renderSeat = (seat, index) => {
    const sold = unavailable.has(seat.id);
    const chosen = selected.includes(seat.id);
    const women = index % 7 === 2;
    const berth = sleeper || mixed;

    return (
      <button
        key={seat.id}
        className={`${berth ? "sleeper-berth" : "chair-seat"} ${sold ? "sold" : ""} ${chosen ? "chosen" : ""} ${women ? "women" : ""}`}
        onClick={() => toggle(seat.id)}
        aria-label={`${title} seat ${seat.id}`}
      >
        {berth ? <span className="pillow" /> : <Armchair size={17} />}
        <small>{sold ? "Sold" : `₹${Math.round(Number(baseFare) * (seat.fareMultiplier || 1))}`}</small>
      </button>
    );
  };

  if (!isSleeperLayout) {
    return (
      <article className="deck-card">
        <div className="deck-head"><h3>{title}</h3><span>☸</span></div>
        <div className="portrait-seat-grid seater-grid">
          {seats.map(renderSeat)}
        </div>
      </article>
    );
  }

  const rows = [];
  for (let i = 0; i < seats.length; i += 3) {
    rows.push(seats.slice(i, i + 3));
  }

  const rowElements = rows.flatMap((row, rowIndex) => [
    row[0] ? renderSeat(row[0], rowIndex * 3) : <div key={`left-empty-${rowIndex}`} />,
    <div key={`walkway-${rowIndex}`} className="walkway" />,
    row[1] ? renderSeat(row[1], rowIndex * 3 + 1) : <div key={`middle-empty-${rowIndex}`} />,
    row[2] ? renderSeat(row[2], rowIndex * 3 + 2) : <div key={`right-empty-${rowIndex}`} />,
  ]);

  return (
    <article className="deck-card">
      <div className="deck-head"><h3>{title}</h3><span>☸</span></div>
      <div className="portrait-seat-grid sleeper-grid">
        {rowElements}
      </div>
    </article>
  );
}

function BusProfilePanel({ route }) {
  return <article className="bus-profile-panel"><div className="bus-profile-head"><div><b>{route.providerName}</b><p>{new Date(route.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(route.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div><strong>★ {route.rating || 4.4}</strong></div><div className="bus-gallery"><img src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=700&q=80" alt="Bus front" /><img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=700&q=80" alt="Bus journey" /></div><div className="detail-tabs"><span className="active">Highlights</span><span>Cancellation policy</span><span>Boarding point</span><span>Dropping point</span></div><div className="highlight-grid"><div><b>Top Comfort</b><p>Premium seating and clean cabin</p></div><div><b>Bus Safety</b><p>Tracked route assistance</p></div><div><b>Highly On Time</b><p>Consistent recent trips</p></div><div><b>Women Care</b><p>Priority support</p></div></div><h3>Cancellation policy</h3><table><tbody><tr><th>Time window</th><th>Refund</th></tr><tr><td>Before journey day</td><td>90%</td></tr><tr><td>On journey day</td><td>70%</td></tr></tbody></table></article>;
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
        {step === "passenger" && <><PassengerForm query={query} selectedSeats={selectedSeats} passengers={passengers} setPassengers={setPassengers} contact={contact} setContact={setContact} /><p className="identity-note">The booking person must show Aadhaar card or any equivalent identity card to the bus attendant at the time of boarding.</p><FareSummary total={total} route={route} boardingPoint={boardingPoint} dropPoint={dropPoint} seats={seats} /></>}
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
  return <div className="seat-info-layout"><div><SeatMap route={route} selected={selectedSeats} setSelected={setSelectedSeats} /><div className="seat-legend"><span className="available-seat">Available</span><span className="selected-seat">Selected</span><span className="sold-seat">Sold</span></div></div><article className="bus-detail-panel"><div className="detail-top"><div><b>{route.providerName}</b><p>{new Date(route.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(route.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div><strong>★ {route.rating || 4.3}</strong></div><div className="detail-tabs"><span className="active">Highlights</span><span>Cancellation policy</span><span>Boarding point</span><span>Dropping point</span></div><div className="highlight-grid"><div><b>Highly On Time</b><p>Consistent recent trips</p></div><div><b>Bus Safety</b><p>Available</p></div><div><b>Top Comfort</b><p>Premium seating</p></div></div><h3>Cancellation policy</h3><table><tbody><tr><th>Time window</th><th>Refund</th></tr><tr><td>Before journey day</td><td>90%</td></tr><tr><td>On journey day</td><td>70%</td></tr></tbody></table></article></div>;
}

function FareSummary({ total, route, boardingPoint, dropPoint, seats }) {
  return <div className="fare-summary"><h3>Fare summary</h3><div><span>Base fare</span><b>₹{Number(route.price).toLocaleString("en-IN")} × {seats.length}</b></div><div><span>Seats</span><b>{seats.join(", ")}</b></div><div><span>Boarding</span><b>{boardingPoint || "Select point"}</b></div><div><span>Dropping</span><b>{dropPoint || "Select point"}</b></div><div className="fare-total"><span>Amount to pay</span><strong>₹{Number(total).toLocaleString("en-IN")}</strong></div></div>;
}

function JourneyResults({ type, results, onViewSeats }) {
  const [filters, setFilters] = useState([]);
  const [activeOperator, setActiveOperator] = useState("private");
  const [timing, setTiming] = useState("any");
  const routeMaxPrice = Math.max(...results.map((route) => Number(route.price || 0)), 0);
  const [maxPrice, setMaxPrice] = useState(routeMaxPrice);
  const stateTabs = type === "bus" ? operatorBrands.filter((brand) => results.some((route) => operatorBrand(route)?.key === brand.key)) : [];

  useEffect(() => {
    setMaxPrice(routeMaxPrice);
    setActiveOperator("private");
    setTiming("any");
    setFilters([]);
  }, [type, routeMaxPrice, results.length]);

  if (!results.length) return null;

  const filterOptions = [
    { key: "rated", label: "Highly rated", test: (route) => Number(route.rating || 0) >= 4.4 },
    { key: "free", label: "Free cancellation", test: (route) => String(route.cancellationPolicy || "").toLowerCase().includes("free") || route.amenities?.includes("Free date change") },
    { key: "tracking", label: "Live tracking", test: (route) => route.amenities?.some((item) => item.toLowerCase().includes("tracking")) },
    { key: "ac", label: "AC", test: (route) => `${route.classType} ${route.vehicleType}`.toLowerCase().includes("ac") && !`${route.classType}`.toLowerCase().includes("non ac") },
    { key: "nonac", label: "Non-AC", test: (route) => `${route.classType} ${route.vehicleType}`.toLowerCase().includes("non ac") },
    { key: "sleeper", label: "Sleeper / semi sleeper", test: (route) => `${route.classType} ${route.vehicleType} ${route.seatLayout?.type}`.toLowerCase().includes("sleeper") }
  ];

  const timingTest = (route) => {
    const hour = new Date(route.departureTime).getHours();
    if (timing === "early") return hour < 10;
    if (timing === "day") return hour >= 10 && hour < 17;
    if (timing === "night") return hour >= 17;
    return true;
  };

  const operatorFiltered = type === "bus" && stateTabs.length
    ? results.filter((route) => activeOperator === "private" ? !operatorBrand(route) : operatorBrand(route)?.key === activeOperator)
    : results;
  const filtered = operatorFiltered
    .filter((route) => Number(route.price) <= maxPrice)
    .filter(timingTest)
    .filter((route) => filters.every((key) => filterOptions.find((item) => item.key === key)?.test(route)))
    .sort((a, b) => timing === "early" ? new Date(a.departureTime) - new Date(b.departureTime) : Number(a.price) - Number(b.price));
  const toggleFilter = (key) => setFilters((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);

  return (
    <section className="journey-results">
      <aside className="filter-panel">
        <h3>Filter {type === "bus" ? "buses" : type === "flight" ? "flights" : "trains"}</h3>
        {filterOptions.map((item) => <button key={item.key} className={filters.includes(item.key) ? "active" : ""} onClick={() => toggleFilter(item.key)}>{item.label}</button>)}
        <div className="range-filter">
          <span>Price up to</span>
          <strong>₹{Number(maxPrice || 0).toLocaleString("en-IN")}</strong>
          <input type="range" min="0" max={routeMaxPrice || 0} step="50" value={maxPrice || 0} onChange={(event) => setMaxPrice(Number(event.target.value))} />
        </div>
        <div className="timing-filter">
          <span>Timing preference</span>
          {[
            ["any", "Any time"],
            ["early", "Earliest"],
            ["day", "Day"],
            ["night", "Evening / night"]
          ].map(([key, label]) => <button key={key} className={timing === key ? "active" : ""} onClick={() => setTiming(key)}>{label}</button>)}
        </div>
      </aside>
      <div className="result-main">
        {type === "bus" && stateTabs.length > 0 && (
          <div className="operator-tabs">
            <button className={activeOperator === "private" ? "active" : ""} onClick={() => setActiveOperator("private")}>Private buses</button>
            {stateTabs.map((brand) => <button key={brand.key} className={activeOperator === brand.key ? "active" : ""} onClick={() => setActiveOperator(brand.key)}><img src={brand.logo} alt={`${brand.title} logo`} /> {brand.title}</button>)}
          </div>
        )}
        <div className="mini-offers"><article>Free cancellation</article><article>Flexible date change</article><article>Women traveller care</article></div>
        <div className="result-summary"><b>{filtered.length} options found</b><span>{timing === "early" ? "Sorted by earliest departure" : "Sorted by lowest price"}</span></div>
        <div className="result-list">
          {filtered.map((route) => {
            const brand = operatorBrand(route);
            return (
              <article key={route.id} className={`result-card ${route.type}`}>
                <div className="result-card-head"><span className="operator-title">{brand && <img src={brand.logo} alt={`${brand.title} logo`} />}{route.providerName}</span><span>{route.vehicleType} · {route.classType}</span></div>
                <div className="time-row"><b>{new Date(route.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b><span>{route.origin} to {route.destination}</span><b>{new Date(route.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b></div>
                <div className="amenities">{route.amenities?.map((item) => <span key={item}>{item}</span>)}</div>
                <div className="fare-row"><strong>₹{Number(route.price).toLocaleString("en-IN")}</strong><button onClick={() => onViewSeats(route)}>View seats</button></div>
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
  const [form, setForm] = useState({ email: "customer@traveltimes.com", password: "customer123" });
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
  const toggle = (id) => {
    if (unavailable.has(id)) return;
    setSelected(selected.includes(id) ? selected.filter((seat) => seat !== id) : [...selected, id]);
  };
  return (
    <div className="seat-landscape">
      <div className={`seat-map ${route.type}`}>
        {(route.seatLayout?.seats || []).map((seat) => {
          // Skip rendering walkway seats in landscape view
          if (seat.isWalkway) {
            return <div key={seat.id} className="seat-walkway-landscape" />;
          }
          return (
            <button key={seat.id} className={`${unavailable.has(seat.id) ? "blocked" : ""} ${selected.includes(seat.id) ? "chosen" : ""}`} onClick={() => toggle(seat.id)}>
              {route.seatLayout?.type === "sleeper" ? <BedDouble size={15} /> : <Armchair size={15} />}
              <span>{seat.id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PassengerForm({ query, selectedSeats, passengers, setPassengers, contact, setContact }) {
  useEffect(() => {
    const count = Math.max(query.travellers, selectedSeats.length || 1);
    setPassengers((current) => Array.from({ length: count }, (_, index) => current[index] || { ...initialPassenger, seat: selectedSeats[index] || "" }));
  }, [query.travellers, selectedSeats.join(",")]);

  return (
    <div className="traveller-form">
      <h3>Passenger details</h3>
      {passengers.map((passenger, index) => (
        <div className="passenger-grid" key={index}>
          <input placeholder="Passenger name" value={passenger.name} onChange={(e) => setPassengers(passengers.map((p, i) => i === index ? { ...p, name: e.target.value } : p))} />
          <input placeholder="Age" type="number" value={passenger.age} onChange={(e) => setPassengers(passengers.map((p, i) => i === index ? { ...p, age: e.target.value } : p))} />
          <select value={passenger.gender} onChange={(e) => setPassengers(passengers.map((p, i) => i === index ? { ...p, gender: e.target.value } : p))}><option>Male</option><option>Female</option><option>Other</option></select>
          <input placeholder="Seat" value={selectedSeats[index] || passenger.seat} readOnly />
        </div>
      ))}
      <div className="contact-grid"><input placeholder="Contact email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /><input placeholder="Mobile number" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /><input placeholder="Emergency contact" value={contact.emergencyPhone} onChange={(e) => setContact({ ...contact, emergencyPhone: e.target.value })} /></div>
    </div>
  );
}

function OffersStrip() {
  const offers = [
    [Bus, "Bus", "Save on premium bus journeys", "FIRST"],
    [Train, "Train", "Flexible date change support", "FLEXI"],
    [Plane, "Flight", "Smart weekday fares", "SKY"],
    [Hotel, "Hotel", "Stay more, save more", "STAY"]
  ];
  return <section className="clean-section"><div className="section-title"><h2>Offers for you</h2><a>View more</a></div><div className="offer-row">{offers.map(([Icon, label, title, code]) => <article key={code}><span className="offer-icon" title={label} aria-label={label}><Icon size={22} /></span><h3>{title}</h3><p>Valid this season</p><b>{code}</b></article>)}</div></section>;
}

function WhatsNew() {
  return <section className="clean-section"><h2>What’s new</h2><div className="news-row"><article><Sparkles /><h3>Free cancellation window</h3><p>Enjoy more flexibility on selected bus services.</p></article><article><CalendarDays /><h3>Live bus timetable</h3><p>View local timing signals for popular routes.</p></article><article><ShieldCheck /><h3>Assurance support</h3><p>Help for cancellations, delays and urgent journey concerns.</p></article></div></section>;
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
  return (
    <section className="clean-section narrow testimonial-section">
      <div className="section-head">
        <h2>Testimonials</h2>
        <p className="section-subtitle">Hear from travellers who plan journeys with TravelTimes.</p>
      </div>
      <div className="testimonial-row">
        <article>
          <p>“Each bus was clean, punctual and easy to book. TravelTimes made the whole journey seamless from search to boarding.”</p>
          <footer>— Anjali, frequent commuter</footer>
        </article>
        <article>
          <p>“Customer support responded fast and helped me choose the right boarding point. The experience felt polished and reliable.”</p>
          <footer>— Rohan, corporate traveller</footer>
        </article>
        <article>
          <p>“Seat selection was smooth and updates were clear throughout the trip. This is a premium booking experience.”</p>
          <footer>— Meera, weekend getaway</footer>
        </article>
      </div>
    </section>
  );
}

function HotelsPage({ hotels, user, refreshBookings }) {
  return <section className="page-band"><div className="page-heading"><Hotel size={34} /><div><h1>Hotels</h1><p>Handpicked stays for holidays, business trips and family travel.</p></div></div><div className="card-grid">{hotels.map((hotel) => <article className="travel-card" key={hotel.id}><img src={hotel.imageUrl} alt={hotel.name} /><div><span>{hotel.starRating} star · {hotel.city}</span><h3>{hotel.name}</h3><p>{hotel.amenities?.join(" · ")}</p></div><footer><b>₹{Number(hotel.pricePerNight).toLocaleString("en-IN")}/night</b><button>Book</button></footer></article>)}</div></section>;
}

function PackagesPage({ packages }) {
  return <section className="page-band"><div className="page-heading"><BriefcaseBusiness size={34} /><div><h1>Curated Packages</h1><p>Family tours, luxury getaways, honeymoon escapes and seasonal plans.</p></div></div><div className="card-grid">{packages.map((pkg) => <article className="travel-card" key={pkg.id}><img src={pkg.imageUrl} alt={pkg.title} /><div><span>{pkg.category}</span><h3>{pkg.title}</h3><p>{pkg.durationDays} days · {pkg.inclusions?.join(" · ")}</p></div><footer><b>₹{Number(pkg.price).toLocaleString("en-IN")}</b><button>Enquire</button></footer></article>)}</div></section>;
}

function AuthPage({ user, setUser, setPage, pendingCheckout }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "customer@traveltimes.com", phone: "", password: "customer123" });
  const [message, setMessage] = useState("");

  const oauthLogin = async (provider) => {
    if (provider === "google") {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setMessage("Google sign-in needs VITE_GOOGLE_CLIENT_ID in webapp/.env. Account chooser will open after it is configured.");
        return;
      }
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: `${window.location.origin}/auth/google/callback`,
        response_type: "token",
        scope: "openid email profile",
        prompt: "select_account"
      });
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      return;
    }
    try {
      const data = await api("/auth/oauth", {
        method: "POST",
        body: JSON.stringify({
          provider,
          providerId: `${provider}-${form.email}`,
          name: form.name || form.email.split("@")[0] || "TravelTimes Traveller",
          email: form.email,
          phone: form.phone
        })
      });
      tokenStore.set(data.token);
      setUser(data.user);
      setPage(pendingCheckout ? "checkout" : "dashboard");
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
      setPage(pendingCheckout ? "checkout" : "dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (user) {
    return <section className="page-band account-page"><div className="page-heading"><UserRound size={34} /><div><h1>You are logged in</h1><p>Continue to your dashboard or complete the selected booking.</p></div></div><button className="primary" onClick={() => setPage(pendingCheckout ? "checkout" : "dashboard")}>Continue</button></section>;
  }

  return (
    <section className="page-band account-page">
      <div className="page-heading"><UserRound size={34} /><div><h1>{mode === "login" ? "Login to TravelTimes" : "Create your TravelTimes account"}</h1><p>Email and mobile number are collected so ticket email and SMS gateways can be enabled later.</p></div></div>
      <form className="auth-card" onSubmit={submit}>
        <div className="segmented-auth"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button><button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button></div>
        {mode === "register" && <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        <input placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {mode === "register" && <input placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="primary" type="submit">{mode === "login" ? "Login" : "Create account"}</button>
        <div className="oauth-divider"><span>or continue securely with</span></div>
        <div className="oauth-row">
          <button type="button" aria-label="Continue with Google" title="Continue with Google" onClick={() => oauthLogin("google")}><span className="social-icon google-mark">G</span></button>
          <button type="button" aria-label="Continue with Facebook" title="Continue with Facebook" onClick={() => oauthLogin("facebook")}><span className="social-icon facebook-mark">f</span></button>
          <button type="button" aria-label="Continue with Apple" title="Continue with Apple" onClick={() => oauthLogin("apple")}><span className="social-icon apple-mark">A</span></button>
        </div>
        {message && <div className="success-note">{message}</div>}
      </form>
    </section>
  );
}

function CheckoutPage({ user, setPage, pendingCheckout, setPendingCheckout, refreshBookings }) {
  const [confirmed, setConfirmed] = useState(null);
  const [message, setMessage] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  if (!pendingCheckout) {
    return <section className="page-band"><div className="page-heading"><TicketIcon /><div><h1>No ticket selected</h1><p>Please select a journey first.</p></div></div><button className="primary" onClick={() => setPage("bus")}>Search buses</button></section>;
  }

  if (!user) {
    return <section className="page-band"><div className="page-heading"><UserRound size={34} /><div><h1>Login required</h1><p>Please login or register to review and purchase this ticket.</p></div></div><button className="primary" onClick={() => setPage("auth")}>Login or register</button></section>;
  }

  const purchase = async () => {
    const draft = pendingCheckout;
    setPurchasing(true);
    setMessage("");
    try {
      const booking = await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          type: draft.route.type,
          itemId: draft.route.id,
          travelDate: draft.query.date,
          selectedSeats: draft.selectedSeats,
          passengers: draft.passengers.map((passenger, index) => ({ ...passenger, seat: draft.selectedSeats[index] })),
          contact: draft.contact,
          totalAmount: draft.totalAmount,
          metadata: { origin: draft.route.origin, destination: draft.route.destination, tripType: draft.query.tripType, returnDate: draft.query.returnDate, boardingPoint: draft.boardingPoint, dropPoint: draft.dropPoint }
        })
      });
      setConfirmed(booking);
      await refreshBookings();
      setMessage("Ticket sent to your email and mobile number.");
    } catch (error) {
      setMessage(error.message || "Booking failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const draft = pendingCheckout;
  return (
    <section className="page-band checkout-page">
      <div className="page-heading"><CalendarDays size={34} /><div><h1>{confirmed ? "Booking successful" : "Review your ticket"}</h1><p>{confirmed ? "Your printable TravelTimes ticket is ready." : "Confirm traveller details before purchasing the ticket."}</p></div></div>
      <article className="print-ticket">
        <div className="ticket-head"><Logo /><strong>{confirmed?.bookingCode || "PNR will be generated after purchase"}</strong></div>
        <h2>{draft.route.providerName}</h2>
        <p>{draft.route.origin} to {draft.route.destination} · {draft.query.date}</p>
        <div className="ticket-grid"><span>Boarding point<b>{draft.boardingPoint || "Not selected"}</b></span><span>Dropping point<b>{draft.dropPoint || "Not selected"}</b></span><span>Seats<b>{draft.selectedSeats.join(", ")}</b></span><span>Amount<b>₹{Number(draft.totalAmount).toLocaleString("en-IN")}</b></span></div>
        <h3>Passengers</h3>
        {draft.passengers.map((passenger, index) => <div className="ticket-passenger" key={index}><span>{passenger.name || `Passenger ${index + 1}`}</span><span>{passenger.age || "-"} yrs</span><span>{passenger.gender}</span><b>{draft.selectedSeats[index]}</b></div>)}
        <p className="identity-note">The booking person must show Aadhaar card or any equivalent identity card to the bus attendant at the time of boarding.</p>
        {!confirmed ? <button className="primary" onClick={purchase} disabled={purchasing}>{purchasing ? "Processing..." : "Purchase ticket"}</button> : <><button className="primary" onClick={() => window.print()}>Print ticket</button><button className="secondary-action" onClick={() => setPage("dashboard")}>Back to dashboard</button></>}
        {message && <div className="success-note">{confirmed ? <span>Booking confirmed with PNR <strong>{confirmed.bookingCode}</strong>. {message}</span> : <span>{message}</span>}</div>}
      </article>
    </section>
  );
}

function TicketIcon() {
  return <CalendarDays size={34} />;
}

function DashboardPage({ user, setUser, setPage, bookings, refreshBookings }) {
  if (!user) return <AuthPage user={user} setUser={setUser} setPage={setPage} pendingCheckout={null} />;
  const [selectedTicket, setSelectedTicket] = useState(null);
  const sorted = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const current = [sorted[0]].filter(Boolean);
  const previous = sorted.slice(1);
  const totalSpend = bookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
  const upcoming = bookings.filter((booking) => !["completed", "cancelled"].includes(booking.status)).length;
  const earnedFromBookings = bookings.reduce((sum, booking) => sum + Math.max(25, Math.floor(Number(booking.totalAmount || 0) / 100)), 0);
  const rewardPoints = Math.max(Number(user.rewardPoints || 0), earnedFromBookings);
  const busTrips = bookings.filter((booking) => booking.type === "bus").length;
  const railAirTrips = bookings.filter((booking) => ["train", "flight"].includes(booking.type)).length;
  const cancelBooking = async (booking) => {
    await api(`/bookings/${booking.id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason: "Customer requested cancellation" }) });
    refreshBookings();
  };
  return (
    <section className="page-band dashboard-page">
      <div className="page-heading"><UserRound size={34} /><div><h1>{user.name}'s Dashboard</h1><p>Manage bookings, rewards, support and journey tracking.</p></div></div>
      <div className="customer-metrics">
        <article><CalendarDays /><span>Total bookings</span><strong>{bookings.length}</strong></article>
        <article><Gift /><span>Reward points</span><strong>{rewardPoints.toLocaleString("en-IN")}</strong></article>
        <article><Bus /><span>Bus journeys</span><strong>{busTrips}</strong></article>
        <article><Sparkles /><span>Total travel value</span><strong>₹{totalSpend.toLocaleString("en-IN")}</strong></article>
      </div>
      <div className="dashboard-grid">
        <article className="dash-panel wide-panel"><h3>Current bookings</h3>{current.map((booking) => <BookingCard key={booking.id} booking={booking} onCancel={() => cancelBooking(booking)} onViewTicket={() => setSelectedTicket(booking)} />)}{!current.length && <p>No current bookings yet.</p>}</article>
        <article className="dash-panel"><h3>Previous bookings</h3>{previous.map((booking) => <BookingCard key={booking.id} booking={booking} compact onViewTicket={() => setSelectedTicket(booking)} />)}{!previous.length && <p>No previous bookings yet.</p>}</article>
        <article className="dash-panel"><h3>Quick actions</h3><button onClick={() => setPage("bus")}>Book bus</button><button onClick={() => setPage("flight")}>Book flight</button><button onClick={() => setPage("train")}>Book train</button><button onClick={() => setPage("support")}>Raise support request</button></article>
        <article className="dash-panel reward-panel wide-panel"><h3>TravelTimes Rewards</h3><strong>{rewardPoints.toLocaleString("en-IN")} points</strong><p>Earn points on every confirmed booking and redeem them for journey benefits when offers are enabled.</p><div><span>Upcoming trips</span><b>{upcoming}</b></div><div><span>Rail and air trips</span><b>{railAirTrips}</b></div></article>
      </div>
      {selectedTicket && <TicketWindow booking={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </section>
  );
}

function BookingCard({ booking, onCancel, compact, onViewTicket }) {
  const title = booking.TransportRoute?.providerName || booking.Hotel?.name || booking.TourPackage?.title || booking.metadata?.title || "TravelTimes booking";
  return <div className="booking-card"><div><b>{booking.bookingCode}</b><span>{booking.type} · {title}</span></div><div><small>{booking.travelDate}</small><strong>₹{Number(booking.totalAmount).toLocaleString("en-IN")}</strong></div><div className="tracking-line">Live updates · {booking.status}</div><div className="booking-actions"><button onClick={onViewTicket}>View ticket</button>{!compact && <><button>Modify</button><button onClick={onCancel}>Request cancellation</button><button>Re-book</button></>}</div></div>;
}

function TicketWindow({ booking, onClose }) {
  const providerName = booking.TransportRoute?.providerName || booking.Hotel?.name || booking.TourPackage?.title || booking.metadata?.title || "TravelTimes";
  const from = booking.metadata?.origin || booking.TransportRoute?.origin || "-";
  const to = booking.metadata?.destination || booking.TransportRoute?.destination || "-";
  const seats = booking.selectedSeats?.length ? booking.selectedSeats : (booking.passengers || []).map((passenger) => passenger.seat).filter(Boolean);
  return (
    <div className="ticket-window-backdrop" role="dialog" aria-modal="true">
      <article className="ticket-window">
        <div className="ticket-window-head">
          <div>
            <span>TravelTimes e-ticket</span>
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
              <span>Type<b>{booking.type}</b></span>
              <span>Seats<b>{seats.length ? seats.join(", ") : "-"}</b></span>
              <span>Amount<b>₹{Number(booking.totalAmount).toLocaleString("en-IN")}</b></span>
            </div>
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
  return <section className="page-band"><div className="page-heading"><Headphones size={34} /><div><h1>Help and Support</h1><p>Get help with booking, boarding, cancellations, tracking, emergencies and feedback.</p></div></div><SupportForm user={user} bookings={bookings} /></section>;
}

function SupportForm({ user, bookings }) {
  const [support, setSupport] = useState({ bookingId: "", category: "general", priority: "normal", subject: "", message: "" });
  const [message, setMessage] = useState("");
  const createTicket = async () => {
    if (!user) return setMessage("Please login so our support team can connect this request to your account.");
    await api("/support/tickets", { method: "POST", body: JSON.stringify(support) });
    setMessage("Your request has been shared with TravelTimes support.");
  };
  return <div className="support-card"><select value={support.bookingId} onChange={(e) => setSupport({ ...support, bookingId: e.target.value })}><option value="">Select booking if available</option>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.bookingCode}</option>)}</select><select value={support.category} onChange={(e) => setSupport({ ...support, category: e.target.value })}><option value="general">General</option><option value="boarding">Boarding</option><option value="technical_issue">Technical issue</option><option value="accident">Accident / emergency</option><option value="cancellation">Cancellation</option><option value="grievance">Grievance</option><option value="feedback">Feedback</option></select><select value={support.priority} onChange={(e) => setSupport({ ...support, priority: e.target.value })}><option value="normal">Normal</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option></select><input placeholder="Subject" value={support.subject} onChange={(e) => setSupport({ ...support, subject: e.target.value })} /><textarea placeholder="Tell us what happened" value={support.message} onChange={(e) => setSupport({ ...support, message: e.target.value })} /><button className="primary" onClick={createTicket}>Send request</button>{message && <div className="success-note">{message}</div>}</div>;
}

function FloatingAssistant({ user, bookings }) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([{ sender: "assistant", message: "Hi, I’m Tiara. I can help with booking, cancellation, boarding, tracking, emergencies and feedback." }]);
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
  return <div className={`floating-chat ${open ? "open" : ""}`}><button className="chat-launch" onClick={() => setOpen(!open)}><Sparkles size={22} /> Ask Tiara</button>{open && <div className="chat-panel"><h3><span><Bot size={19} /> TravelTimes Assistant</span><button onClick={() => setOpen(false)} aria-label="Close assistant">×</button></h3><div className="chat-window">{chat.map((item, index) => <div key={index} className={`chat-bubble ${item.sender}`}>{item.message}</div>)}</div><textarea placeholder="Ask about booking, boarding, cancellation, tracking, accident support or feedback" value={text} onChange={(e) => setText(e.target.value)} /><div className="chat-actions"><button onClick={() => send("travel_assistance")}><MessageSquare size={16} /> Send</button><button className="urgent" onClick={() => send("emergency")}>Urgent help</button></div></div>}</div>;
}

function Footer({ setPage }) {
  return <footer className="site-footer"><Logo /><div><button onClick={() => setPage("packages")}>Tour Packages</button><button onClick={() => setPage("hotels")}>Hotels</button><button onClick={() => setPage("support")}>Contact Us</button><button>About Us</button><button>Services</button></div><span className="footer-note">Comfortable journeys, handpicked stays and memorable holidays.</span></footer>;
}

createRoot(document.getElementById("root")).render(<App />);
