import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Compass, Users, Video, Link, Menu, X, Globe, DollarSign, Calendar, Clock, MapPin, Loader2, CreditCard } from 'lucide-react';

// ====================================================================
// SECTION 1: MOCK DATA & SERVICE LAYER 
// ====================================================================

// --- Mock Data ---
const initialCardData = [
  { id: 101, img: "https://placehold.co/600x400/3B82F6/ffffff?text=Amazon+Jungle", tag: "Adventure", title: "Explore the hidden waterfall deep inside the Amazon Jungle" },
  { id: 102, img: "https://placehold.co/600x400/10B981/ffffff?text=Bali+Cruise", tag: "Luxury", title: "Travel through the Islands of Bali in a Private Cruise" },
  { id: 103, img: "https://placehold.co/600x400/9333EA/ffffff?text=Uncharted+Waters", tag: "Mystery", title: "Set Sail in the Atlantic Ocean visiting Uncharted Waters" },
  { id: 104, img: "https://placehold.co/600x400/F59E0B/ffffff?text=Himalayan+Football", tag: "Adventure", title: "Experience Football on Top of the Himalayan Mountains" },
  { id: 105, img: "https://placehold.co/600x400/EF4444/ffffff?text=Sahara+Desert+Camels", tag: "Adrenaline", title: "Ride through the Sahara Desert on a guided camel tour" },
];

const mockTours = [
  {
    id: 1,
    name: "European Discovery Tour",
    destination: "Paris, Rome & Berlin",
    price: 1850.00,
    duration: 10,
    description: "Experience the historical grandeur and modern vibrancy of three iconic European capitals over ten unforgettable days. Includes all major landmarks and local cuisine tasting.",
    availableDates: "May 2026 - Sept 2026",
    activityLevel: "Moderate",
    inclusions: "Flights, 4-star hotels, Breakfast, City Passes",
    itinerary: [
      { day: "Day 1-3", details: "Arrival in Paris, Eiffel Tower, Louvre Museum." },
      { day: "Day 4-6", details: "Travel to Rome, Colosseum, Vatican City." },
      { day: "Day 7-10", details: "Travel to Berlin, Brandenburg Gate, Museum Island." }
    ]
  },
  {
    id: 2,
    name: "Thai Island Hopper",
    destination: "Phuket, Krabi & Phi Phi",
    price: 980.50,
    duration: 7,
    description: "A week-long adventure exploring the beautiful beaches and crystal-clear waters of Thailand's Andaman coast. Perfect for relaxation and snorkeling.",
    availableDates: "Nov 2025 - Apr 2026",
    activityLevel: "Easy",
    inclusions: "Accommodation, Ferry Tickets, Snorkel Gear, One Thai Massage",
    itinerary: [
      { day: "Day 1-2", details: "Arrival in Phuket, Patong Beach exploration." },
      { day: "Day 3-4", details: "Ferry to Phi Phi Islands, Maya Bay visit." },
      { day: "Day 5-7", details: "Krabi, Railay Beach, departure." }
    ]
  },
  {
    id: 3,
    name: "Himalayan Trekking Expedition",
    destination: "Annapurna Base Camp, Nepal",
    price: 2500.00,
    duration: 14,
    description: "Challenging but rewarding trek to the heart of the Himalayas, offering unparalleled views of some of the world's highest peaks.",
    availableDates: "Mar 2026, Oct 2026",
    activityLevel: "Challenging",
    inclusions: "Permits, Guide/Porters, Basic Lodge Accommodation, All Meals during trek",
    itinerary: []
  }
];

let mockBookings = {};

const getTours = () => Promise.resolve({ data: [...mockTours, ...initialCardData.map(c => ({...c, id: c.id, name: c.title, destination: c.tag, price: 500, duration: 3, description: c.title, availableDates: "Anytime", activityLevel: "Easy", inclusions: "Basic Package"}))] });
const getTourById = (id) => {
  const tour = mockTours.find(t => t.id === parseInt(id)) || initialCardData.find(c => c.id === parseInt(id));
  return tour ? Promise.resolve({ data: tour }) : Promise.reject(new Error("Tour not found"));
};
const createBookingMock = (bookingData) => {
    const newBookingId = Math.floor(Math.random() * 100000) + 1000;
    const tour = mockTours.find(t => t.id === parseInt(bookingData.tourId)) || initialCardData.find(c => c.id === parseInt(bookingData.tourId));
    
    const tourPrice = tour ? tour.price : 500;
    const numGuests = parseInt(bookingData.numberOfGuests, 10);

    const newBooking = {
        id: newBookingId,
        ...bookingData,
        tourName: tour ? tour.name : 'Unknown Tour',
        totalCost: tourPrice * numGuests,
        paymentStatus: 'PENDING'
    };
    mockBookings[newBookingId] = newBooking;
    
    return Promise.resolve({ data: newBooking }); 
};
const getBookingDetailsMock = (bookingId) => {
    const booking = mockBookings[parseInt(bookingId)];
    return booking ? Promise.resolve({ data: booking }) : Promise.reject(new Error("Booking not found"));
};
const processPaymentMock = (bookingId) => {
    const booking = mockBookings[parseInt(bookingId)];
    if (booking) {
        booking.paymentStatus = 'PAID';
        return Promise.resolve({ data: booking });
    }
    return Promise.reject(new Error("Booking not found for payment update"));
};

const TourService = {
  getAllTours: () => getTours(),
  getTourById: (id) => getTourById(id),
  createBooking: (bookingData) => createBookingMock(bookingData),
  getBookingDetails: (bookingId) => getBookingDetailsMock(bookingId),
  processPaymentMock: (bookingId) => processPaymentMock(bookingId)
};


// ====================================================================
// SECTION 2: UI COMPONENTS 
// ====================================================================

/**
 * Custom Modal Component to replace unsupported alert()
 */
const ModalComponent = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform scale-100 border-t-4 border-blue-600">
        <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" /> Notification
        </h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};


/**
 * Loading Spinner Component (Tailwind Version)
 */
const LoadingSpinnerComponent = ({ message = "Loading data..." }) => (
  <div className="flex flex-col items-center justify-center p-8 text-blue-600">
    <Loader2 className="w-8 h-8 animate-spin" />
    <p className="mt-3 text-lg font-medium">{message}</p>
  </div>
);

/**
 * Navbar Component with Routing
 */
const NavbarComponent = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItem = (name, routeName) => (
    <a href="#" onClick={() => navigate(routeName)} className="hover:text-blue-400 transition font-medium">
      {name}
    </a>
  );

  return (
    <nav className="bg-[#111] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-wide flex items-center cursor-pointer" onClick={() => navigate('home')}>
          <Compass className="w-6 h-6 mr-2 text-blue-400" /> TRVL
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-8 items-center">
          <li>{navItem("Home", "home")}</li>
          <li>{navItem("Tour Packages", "tours")}</li>
          <li>{navItem("My Bookings", "bookings")}</li>
          
          {/* Sign Up Button (now Bookings button) */}
          <li className="ml-6">
            <button 
              onClick={() => navigate('tours')}
              className="bg-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition font-semibold shadow-lg"
            >
              Book Adventure
            </button>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#222] absolute w-full shadow-lg">
          <ul className="flex flex-col space-y-3 p-4">
            <li><a href="#" onClick={() => { setIsOpen(false); navigate('home'); }} className="block py-2 hover:text-blue-400 border-b border-gray-700">Home</a></li>
            <li><a href="#" onClick={() => { setIsOpen(false); navigate('tours'); }} className="block py-2 hover:text-blue-400 border-b border-gray-700">Tour Packages</a></li>
            <li><a href="#" onClick={() => { setIsOpen(false); navigate('bookings'); }} className="block py-2 hover:text-blue-400 border-b border-gray-700">My Bookings</a></li>
            <li className="pt-2">
              <button onClick={() => { setIsOpen(false); navigate('tours'); }} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Book Adventure
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};


/**
 * Tour Card Component (Tailwind styled version of TourCard.jsx)
 */
const TourCardComponent = ({ tour, navigate }) => {
  const fallbackImg = `https://placehold.co/400x250/3b82f6/ffffff?text=${tour.destination.split(',')[0]}`;
  const { id, name = 'Untitled Tour', destination = 'Unknown', price = 0, duration = 1 } = tour;

  return (
    <div className="h-full rounded-xl shadow-xl overflow-hidden cursor-pointer bg-white hover:shadow-2xl transform hover:scale-[1.03] transition duration-300 border border-gray-100 flex flex-col">
      <div className="relative h-48 w-full">
        <img
          src={`https://picsum.photos/seed/${id}/400/250`}
          className="object-cover w-full h-full"
          alt={name}
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
        />
        <span className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-sm font-bold py-1 px-3 rounded-full shadow-md">
          {duration} Days
        </span>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h5 className="text-xl font-bold text-blue-600 mb-2">{name}</h5>
        <h6 className="text-sm font-semibold mb-3 text-gray-500 flex items-center">
          <MapPin className="w-4 h-4 mr-1" /> {destination}
        </h6>
        
        <p className="text-gray-700 mb-4 flex-grow">
          Price: <strong className="text-lg text-green-600">${price.toFixed(2)}</strong> per person
        </p>

        <div className="mt-auto flex justify-between gap-3">
          <button 
            onClick={() => navigate('tour_details', { id })}
            className="flex-1 bg-white border border-blue-600 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50 transition text-sm"
          >
            Details
          </button>
          <button 
            onClick={() => navigate('book', { tourId: id })}
            className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition text-sm shadow-md"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};


/**
 * Hero Section 
 */
const HeroSection = ({ navigate }) => {
  return (
    <section id="home-hero" className="bg-gradient-to-br from-blue-600 to-purple-700 py-24 md:py-32 text-center text-white shadow-xl">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
          Check out these <span className="text-yellow-300">EPIC</span> Destinations!
        </h2>
        <p className="text-lg md:text-xl opacity-90 mb-8">
          Adventure, luxury, and mystery — your next journey starts here.
        </p>
        <button 
          onClick={() => navigate('tours')}
          className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
        >
          VIEW ALL TOURS
        </button>
      </div>
    </section>
  );
};


// ====================================================================
// SECTION 3: FUNCTIONALITY PAGES 
// ====================================================================


/**
 * Tour Packages Page (Tailwind styled version of TourPackagesPage.jsx)
 */
const TourPackagesPage = ({ navigate }) => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    TourService.getAllTours()
      .then(response => {
        // Only keep the functional tours and filter out the initial placeholders if they overlap awkwardly
        setTours(response.data.filter(t => t.id < 100 || t.id > 100)); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tours:", err);
        setError("Failed to load tour packages.");
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinnerComponent message="Fetching amazing tour packages..." />;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-md">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-blue-600 inline-block pb-1 flex items-center">
        <Globe className="w-6 h-6 mr-2" /> Available Tour Packages
      </h2>
      
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map(tour => (
          <TourCardComponent key={tour.id} tour={tour} navigate={navigate} />
        ))}
        {tours.length === 0 && <p className="mt-4 text-gray-500 col-span-full">No tour packages currently available.</p>}
      </div>
    </div>
  );
};


/**
 * Tour Details Page (Tailwind styled version of TourDetailsPage.jsx)
 */
const TourDetailsPage = ({ routeParams, navigate }) => {
  const id = routeParams.id;
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    TourService.getTourById(id)
      .then(response => {
        setTour(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tour details:", err);
        setError("Tour package not found or an error occurred.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingSpinnerComponent message={`Loading details for Tour #${id}...`} />;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-md">{error}</div>;
  if (!tour) return <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg shadow-md">No tour details available.</div>;

  const fallbackImg = `https://placehold.co/800x400/3b82f6/ffffff?text=${tour.name.split(' ')[0]}`;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8">
      <img 
        src={`https://picsum.photos/seed/${tour.id + 100}/800/400`} 
        className="w-full h-80 object-cover rounded-xl mb-6 shadow-md" 
        alt={tour.name}
        onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
      />
      
      <h1 className="text-4xl font-extrabold text-blue-700 mb-2">{tour.name}</h1>
      <h4 className="text-xl text-gray-600 mb-6 flex items-center"><MapPin className="w-5 h-5 mr-2" /> {tour.destination}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-gray-700">
        <div className="space-y-3">
          <p className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-purple-500" />
            <strong>Duration:</strong> {tour.duration} days
          </p>
          <p className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-500" />
            <strong>Price:</strong> <span className="text-xl font-bold text-green-600 ml-1">${tour.price ? tour.price.toFixed(2) : 'N/A'}</span>
          </p>
          <p className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-red-500" />
            <strong>Available Dates:</strong> {tour.availableDates || 'Year-round'}
          </p>
        </div>
        <div className="space-y-3">
          <p><strong>Activity Level:</strong> <span className="font-semibold text-blue-500">{tour.activityLevel || 'Moderate'}</span></p>
          <p><strong>Inclusions:</strong> {tour.inclusions || 'Flights, Accommodation, Meals'}</p>
        </div>
      </div>

      <h5 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Description & Itinerary</h5>
      <p className="text-lg leading-relaxed mb-6">{tour.description}</p>
      
      {tour.itinerary && Array.isArray(tour.itinerary) && tour.itinerary.length > 0 && (
        <>
          <h6 className="text-xl font-semibold mb-3 text-gray-700">Detailed Itinerary:</h6>
          <ul className="space-y-3 mb-8">
            {tour.itinerary.map((item, index) => (
              <li key={index} className="p-3 bg-gray-50 rounded-lg shadow-sm border-l-4 border-yellow-400">
                <strong className="text-gray-900">{typeof item === 'object' ? item.day : `Day ${index + 1}`}:</strong> 
                <span className="ml-2">{typeof item === 'object' ? item.details : item}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('book', { tourId: tour.id })}
          className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition transform hover:scale-[1.02]"
        >
          Book This Tour
        </button>
        <button 
          onClick={() => navigate('tours')}
          className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
        >
          Back to Tours
        </button>
      </div>
    </div>
  );
};


/**
 * Booking Page (Tailwind styled version of BookingPage.jsx)
 */
const BookingPage = ({ routeParams, navigate, setModalMessage }) => {
  const tourId = routeParams.tourId;
  const [tour, setTour] = useState(null);
  const [bookingData, setBookingData] = useState({
    tourId: tourId,
    customerName: '',
    email: '',
    phone: '',
    numberOfGuests: 1,
    bookingDate: new Date().toISOString().slice(0, 10)
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    TourService.getTourById(tourId)
      .then(res => setTour(res.data))
      .catch(() => setTour({ name: 'Selected Tour' }));
  }, [tourId]);

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    TourService.createBooking(bookingData)
      .then(response => {
        setLoading(false);
        setModalMessage(`Booking created successfully! Proceeding to payment for Tour: ${tour.name}.`);
        navigate('payment', { bookingId: response.data.id });
      })
      .catch(err => {
        setLoading(false);
        setError('Failed to create booking. Please check your details.');
        console.error("Booking error:", err);
      });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8 border-t-8 border-blue-600">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">
        Book Your Trip: <span className="text-blue-600">{tour ? tour.name : `Tour #${tourId}`}</span>
      </h3>
      
      {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg font-medium">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition" name="customerName" value={bookingData.customerName} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition" name="email" value={bookingData.email} onChange={handleChange} required />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition" name="phone" value={bookingData.phone} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
            <input type="number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition" name="numberOfGuests" value={bookingData.numberOfGuests} min="1" onChange={handleChange} required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desired Date</label>
            <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition" name="bookingDate" value={bookingData.bookingDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition transform hover:scale-[1.005]" disabled={loading}>
            {loading ? <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Booking...</span> : 'Confirm Booking & Proceed to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};


/**
 * Payment Mock Page (Tailwind styled version of PaymentMockPage.jsx)
 */
const PaymentMockPage = ({ routeParams, navigate, setModalMessage }) => {
  const bookingId = routeParams.bookingId;
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    TourService.getBookingDetails(bookingId)
      .then(res => {
        setBooking(res.data);
        setStatus(res.data.paymentStatus || 'PENDING');
      })
      .catch(err => {
        console.error("Error fetching booking for payment:", err);
        setError('Could not load booking details. Check the Booking ID.');
      });
  }, [bookingId]);

  const handleMockPayment = () => {
    setLoading(true);
    setError(null);

    TourService.processPaymentMock(bookingId)
      .then(() => {
        setLoading(false);
        setStatus('PAID');
        
        setTimeout(() => {
          setModalMessage('Payment Successful! Your adventure is confirmed.');
          navigate('home'); 
        }, 1500);
      })
      .catch(err => {
        setLoading(false);
        setError('Mock payment failed. The backend status update failed.');
        console.error("Payment mock error:", err);
      });
  };

  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-md max-w-lg mx-auto mt-8">{error}</div>;
  if (!booking) return <LoadingSpinnerComponent message="Fetching payment details..." />;
  
  const totalCost = booking.totalCost || 500.00;

  const statusClasses = status === 'PAID' 
    ? "bg-green-100 text-green-700 border-green-500" 
    : "bg-yellow-100 text-yellow-700 border-yellow-500";

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-8 text-center border-t-8 border-yellow-400">
      <CreditCard className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Gateway (Mock)</h2>
      <p className="text-gray-600 mb-6">Please confirm payment for your **{booking.tourName}** booking.</p>
      
      <div className="my-6 space-y-3 p-4 bg-gray-50 rounded-lg border">
        <p className="text-lg font-medium">Booking ID: <strong className="text-blue-600">{booking.id}</strong></p>
        <p className="text-2xl font-extrabold text-green-600">Amount Due: ${totalCost.toFixed(2)}</p>
        <p className="flex items-center justify-center text-lg">
          Current Status: 
          <span className={`ml-2 px-3 py-1 rounded-full font-semibold border ${statusClasses}`}>
            {status}
          </span>
        </p>
      </div>

      {status !== 'PAID' ? (
        <button 
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition transform hover:scale-[1.005]" 
          onClick={handleMockPayment} 
          disabled={loading}
        >
          {loading ? <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Mock Payment...</span> : 'Click to Pay Now (Mock)'}
        </button>
      ) : (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg font-medium border border-green-500">Payment already processed and booking is confirmed!</div>
      )}
      
      <button 
          onClick={() => navigate('tours')}
          className="mt-4 w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
        >
          Back to Tours
        </button>
    </div>
  );
};


/**
 * Empty My Bookings Page 
 */
const MyBookingsPage = ({ navigate }) => {
  const bookingCount = Object.keys(mockBookings).length;
  
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-2xl text-center border-t-8 border-purple-600">
      <Users className="w-12 h-12 mx-auto text-purple-600 mb-4" />
      <h2 className="text-3xl font-bold text-gray-800 mb-4">My Bookings</h2>
      <p className="text-gray-600 mb-6">
        This section lists all your upcoming adventures. Currently, you have **{bookingCount}** mock booking{bookingCount !== 1 ? 's' : ''} in the system.
      </p>
      
      {bookingCount > 0 && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg text-left">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">Recent Bookings:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
                {Object.values(mockBookings).slice(-3).map(b => (
                    <li key={b.id}>
                        **{b.tourName}** (ID: {b.id}) - <span className={b.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}>{b.paymentStatus}</span>
                    </li>
                ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">Note: Since this is a mock system, these bookings are temporary for the current session.</p>
        </div>
      )}

      <button 
        onClick={() => navigate('tours')}
        className="mt-6 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg"
      >
        Find a New Adventure
      </button>
    </div>
  );
};


// ------------------ Component 4: Newsletter  ------------------
const NewsletterSection = ({ setModalMessage }) => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setModalMessage(`Thanks for subscribing, ${email}! You'll receive the best deals soon.`);
      setEmail("");
    } else {
      setModalMessage("Please enter a valid email address to subscribe.");
    }
  };

  return (
    <section id="newsletter" className="bg-blue-700 text-white py-16 px-6 text-center shadow-inner">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        Join our Adventure Newsletter
      </h2>
      <p className="mb-6 opacity-90">Get the best vacation deals straight to your inbox.</p>

      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-lg mx-auto">
        <input
          type="email"
          placeholder="Your Email"
          required
          className="px-5 py-3 rounded-lg text-gray-800 w-full sm:w-2/3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-150"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition w-full sm:w-1/3 shadow-md transform hover:scale-[1.05]"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
};


// ------------------ Component 5: Footer  ------------------
const FooterComponent = () => {
  // Removed footerLinks data and navigation columns to keep only the rights reserved part
  
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
      <div className="text-center text-sm text-gray-500 max-w-6xl mx-auto px-6">
        © {new Date().getFullYear()} TRVL Unified. All rights reserved.
      </div>
    </footer>
  );
};


// ====================================================================
// SECTION 4: MAIN APP & ROUTING
// ====================================================================

export default function App() {
  const [route, setRoute] = useState({ name: 'home', params: {} });
  const [modalMessage, setModalMessage] = useState(null);

  const navigate = (routeName, params = {}) => setRoute({ name: routeName, params });
  const closeModal = () => setModalMessage(null);

  // Function to render the correct component based on the current route
  const renderContent = () => {
    switch (route.name) {
      case 'home':
        return (
          <>
            <HeroSection navigate={navigate} />
            {/* The original card section, updated to use the Tour Card style */}
            <section id="features" className="bg-gray-50 py-16 flex-grow">
              <div className="max-w-6xl mx-auto px-6">
                <h3 className="text-3xl font-bold text-center text-gray-800 mb-10 border-b-4 border-purple-600 inline-block pb-1">
                  Featured Adventures
                </h3>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {initialCardData.slice(0, 3).map((item) => (
                    <TourCardComponent
                      key={item.id}
                      tour={{...item, destination: item.tag, price: 500, duration: 3}} // Map placeholder data to tour structure
                      navigate={navigate}
                    />
                  ))}
                </div>
                <div className="text-center mt-12">
                    <button 
                        onClick={() => navigate('tours')}
                        className="bg-purple-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-purple-700 transition transform hover:scale-105"
                    >
                        View All {mockTours.length + initialCardData.length - 3} Packages
                    </button>
                </div>
              </div>
            </section>
          </>
        );
      case 'tours':
        return <TourPackagesPage navigate={navigate} />;
      case 'tour_details':
        return <TourDetailsPage routeParams={route.params} navigate={navigate} />;
      case 'book':
        return <BookingPage routeParams={route.params} navigate={navigate} setModalMessage={setModalMessage} />;
      case 'payment':
        return <PaymentMockPage routeParams={route.params} navigate={navigate} setModalMessage={setModalMessage} />;
      case 'bookings':
        return <MyBookingsPage navigate={navigate} />;
      default:
        return <div className="p-10 text-center text-red-500">404 Page Not Found</div>;
    }
  };

  // Styling for the entire application, including Tailwind import setup
  const style = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
    body {
        font-family: 'Inter', sans-serif;
        background-color: #f9fafb;
    }
    .main-content {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
  `;

  return (
    <>
      <style>{style}</style>
      {/* Load Tailwind CSS */}
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="main-content">
        <NavbarComponent navigate={navigate} />

        <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 md:py-10 flex-grow">
          {renderContent()}
        </main>

        <NewsletterSection setModalMessage={setModalMessage} />
        <FooterComponent />
      </div>

      <ModalComponent message={modalMessage} onClose={closeModal} />
    </>
  );
}
