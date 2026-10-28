import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seed.js';
import app from '../app.js';

let server;
const PORT = 5055;

const runTests = async () => {
  console.log('\n==================================================');
  console.log('🧪 RUNNING AUTOMATED BACKEND INTEGRATION TEST SUITE');
  console.log('==================================================\n');

  try {
    await connectDB();
    await seedDatabase();

    server = app.listen(PORT);
    const BASE_URL = `http://localhost:${PORT}/api`;

    let userToken = '';
    let adminToken = '';
    let targetMovieId = '';
    let targetShowtimeId = '';
    let selectedSeatId = '';
    let confirmedBookingId = '';

    // 1. Test Health Check
    console.log('[1/10] Testing GET /api/health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (healthData.success && healthData.data.status === 'online') {
      console.log('  ✅ Health check passed.');
    } else {
      throw new Error(`Health check failed: ${JSON.stringify(healthData)}`);
    }

    // 2. Test Login (Admin & User)
    console.log('[2/10] Testing POST /api/auth/login...');
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@imovies.com', password: 'User@123' })
    });
    const userLoginData = await userLoginRes.json();
    if (userLoginData.success && userLoginData.data.token) {
      userToken = userLoginData.data.token;
      console.log('  ✅ User login successful. Token acquired.');
    } else {
      throw new Error(`User login failed: ${JSON.stringify(userLoginData)}`);
    }

    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@imovies.com', password: 'Admin@123' })
    });
    const adminLoginData = await adminLoginRes.json();
    if (adminLoginData.success && adminLoginData.data.user.role === 'admin') {
      adminToken = adminLoginData.data.token;
      console.log('  ✅ Admin login successful. Role verified.');
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
    }

    // 3. Test Movies Listing & Filtering
    console.log('[3/10] Testing GET /api/movies with filters...');
    const moviesRes = await fetch(`${BASE_URL}/movies?genre=Sci-Fi&sort=releaseDate_desc`);
    const moviesData = await moviesRes.json();
    if (moviesData.success && moviesData.data.length > 0) {
      targetMovieId = moviesData.data[0]._id;
      console.log(`  ✅ Movies list fetched (${moviesData.data.length} movies). Target movie: ${moviesData.data[0].title}`);
    } else {
      throw new Error(`Failed to list movies: ${JSON.stringify(moviesData)}`);
    }

    // 4. Test Movie Showtimes & Seat Map
    console.log(`[4/10] Testing GET /api/movies/${targetMovieId}/showtimes...`);
    const showtimesRes = await fetch(`${BASE_URL}/movies/${targetMovieId}/showtimes`);
    const showtimesData = await showtimesRes.json();
    if (showtimesData.success && showtimesData.data.length > 0) {
      targetShowtimeId = showtimesData.data[0].showtimes[0]._id;
      console.log(`  ✅ Showtimes grouped by theatre. Target showtime ID: ${targetShowtimeId}`);
    } else {
      throw new Error(`Failed to fetch showtimes: ${JSON.stringify(showtimesData)}`);
    }

    console.log(`  Testing GET /api/showtimes/${targetShowtimeId}/seats...`);
    const seatsRes = await fetch(`${BASE_URL}/showtimes/${targetShowtimeId}/seats`);
    const seatsData = await seatsRes.json();
    if (seatsData.success && seatsData.data.seats.length > 0) {
      const availableSeat = seatsData.data.seats.find((s) => s.status === 'available');
      selectedSeatId = availableSeat._id;
      console.log(`  ✅ Seat layout retrieved (${seatsData.data.seats.length} total seats). Selected available seat: ${availableSeat.seatCode}`);
    } else {
      throw new Error(`Failed to fetch seat layout: ${JSON.stringify(seatsData)}`);
    }

    // 5. Test Standard Booking Creation
    console.log(`[5/10] Testing POST /api/bookings (User reserving seat ${selectedSeatId})...`);
    const bookingRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        showtimeId: targetShowtimeId,
        seatIds: [selectedSeatId],
        paymentMethod: 'Credit Card'
      })
    });
    const bookingData = await bookingRes.json();
    if (bookingData.success && bookingData.data.bookingReference) {
      confirmedBookingId = bookingData.data._id;
      console.log(`  ✅ Booking confirmed! Reference: ${bookingData.data.bookingReference}, Amount: $${bookingData.data.totalAmount}`);
    } else {
      throw new Error(`Booking failed: ${JSON.stringify(bookingData)}`);
    }

    // 6. Test Double-Booking Concurrency Safety
    console.log(`[6/10] Testing Concurrency Guard: Attempting to book the SAME seat (${selectedSeatId})...`);
    const duplicateRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        showtimeId: targetShowtimeId,
        seatIds: [selectedSeatId],
        paymentMethod: 'Debit Card'
      })
    });
    const duplicateData = await duplicateRes.json();
    if (duplicateRes.status === 409 && !duplicateData.success) {
      console.log(`  ✅ Double-booking correctly prevented with HTTP 409 Conflict: "${duplicateData.message}"`);
    } else {
      throw new Error(`Concurrency test failed! Duplicate booking was allowed: ${JSON.stringify(duplicateData)}`);
    }

    // 7. Test User Booking History & Cancellation
    console.log('[7/10] Testing GET /api/bookings/my-bookings & Cancellation...');
    const myBookingsRes = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const myBookingsData = await myBookingsRes.json();
    if (myBookingsData.success && myBookingsData.data.length > 0) {
      console.log(`  ✅ User booking history retrieved (${myBookingsData.data.length} bookings found).`);
    }

    const cancelRes = await fetch(`${BASE_URL}/bookings/${confirmedBookingId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({ reason: 'Schedule conflict' })
    });
    const cancelData = await cancelRes.json();
    if (cancelData.success && cancelData.data.bookingStatus === 'cancelled') {
      console.log('  ✅ Booking cancelled and seats released successfully.');
    } else {
      throw new Error(`Cancellation failed: ${JSON.stringify(cancelData)}`);
    }

    // 8. Test TMDB API Integration
    console.log('[8/10] Testing TMDB Integration (search & trending endpoints)...');
    const tmdbSearchRes = await fetch(`${BASE_URL}/movies/tmdb/search?query=Dune`);
    const tmdbSearchData = await tmdbSearchRes.json();
    if (tmdbSearchData.success && tmdbSearchData.data.results) {
      console.log(`  ✅ TMDB search successful (${tmdbSearchData.data.results.length} results returned). Configured: ${tmdbSearchData.data.isConfigured}`);
    } else {
      throw new Error(`TMDB search test failed: ${JSON.stringify(tmdbSearchData)}`);
    }

    const tmdbTrendingRes = await fetch(`${BASE_URL}/movies/tmdb/trending`);
    const tmdbTrendingData = await tmdbTrendingRes.json();
    if (tmdbTrendingData.success && tmdbTrendingData.data.results) {
      console.log(`  ✅ TMDB trending movies retrieved (${tmdbTrendingData.data.results.length} movies).`);
    } else {
      throw new Error(`TMDB trending test failed: ${JSON.stringify(tmdbTrendingData)}`);
    }

    // 9. Test Razorpay Payment Flow (Payment Config, Order Creation & Signature Verification)
    console.log('[9/10] Testing Razorpay Payment Flow...');
    const payConfigRes = await fetch(`${BASE_URL}/bookings/payment-config`);
    const payConfigData = await payConfigRes.json();
    if (payConfigData.success && payConfigData.data.currency === 'INR') {
      console.log(`  ✅ Razorpay config endpoint active. Currency: ${payConfigData.data.currency}, Configured: ${payConfigData.data.isRazorpayConfigured}`);
    } else {
      throw new Error(`Payment config failed: ${JSON.stringify(payConfigData)}`);
    }

    // Pick an available seat for Razorpay test
    const freshSeatsRes = await fetch(`${BASE_URL}/showtimes/${targetShowtimeId}/seats`);
    const freshSeatsData = await freshSeatsRes.json();
    const razorpayTestSeat = freshSeatsData.data.seats.find((s) => s.status === 'available');

    const orderRes = await fetch(`${BASE_URL}/bookings/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        showtimeId: targetShowtimeId,
        seatIds: [razorpayTestSeat._id]
      })
    });
    const orderData = await orderRes.json();
    if (orderData.success && orderData.data.orderId) {
      console.log(`  ✅ Razorpay order created. Order ID: ${orderData.data.orderId}, Amount: ₹${(orderData.data.amount / 100).toFixed(2)}`);

      // Verify and confirm Razorpay booking
      const verifyRes = await fetch(`${BASE_URL}/bookings/razorpay/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          showtimeId: targetShowtimeId,
          seatIds: [razorpayTestSeat._id],
          razorpayOrderId: orderData.data.orderId,
          razorpayPaymentId: `pay_${Date.now()}_test`,
          razorpaySignature: 'simulated_valid_signature'
        })
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success && verifyData.data.bookingReference) {
        console.log(`  ✅ Razorpay verification passed & booking confirmed: Ref ${verifyData.data.bookingReference}`);
      } else {
        throw new Error(`Razorpay payment verification failed: ${JSON.stringify(verifyData)}`);
      }
    } else {
      throw new Error(`Razorpay order creation failed: ${JSON.stringify(orderData)}`);
    }

    // 10. Test Admin Dashboard Analytics & Role Guard
    console.log('[10/10] Testing Admin Analytics & RBAC Security...');
    const forbiddenRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (forbiddenRes.status === 403) {
      console.log('  ✅ Regular user correctly rejected with HTTP 403 Forbidden on admin route.');
    } else {
      throw new Error('RBAC guard failed! Regular user was able to access admin route.');
    }

    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminStatsData = await adminStatsRes.json();
    if (adminStatsData.success && adminStatsData.data.kpis) {
      console.log('  ✅ Admin KPIs successfully retrieved:');
      console.log(`     - Total Revenue: $${adminStatsData.data.kpis.totalRevenue}`);
      console.log(`     - Total Bookings: ${adminStatsData.data.kpis.totalBookings}`);
      console.log(`     - Total Movies: ${adminStatsData.data.kpis.totalMovies}`);
      console.log(`     - Total Theatres: ${adminStatsData.data.kpis.totalTheatres}`);
    } else {
      throw new Error(`Admin stats failed: ${JSON.stringify(adminStatsData)}`);
    }

    console.log('\n==================================================');
    console.log('🎉 ALL 10 BACKEND INTEGRATION TESTS PASSED 100%!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await disconnectDB();
    process.exit(0);
  }
};

runTests();
