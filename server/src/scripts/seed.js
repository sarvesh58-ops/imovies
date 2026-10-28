import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { Showtime } from '../models/Showtime.js';
import { Booking } from '../models/Booking.js';
import { BookingSeat } from '../models/BookingSeat.js';
import { Review } from '../models/Review.js';
import { ROLES } from '../constants/roles.js';
import { SEAT_TIERS } from '../constants/seatTiers.js';
import { BOOKING_STATUS, PAYMENT_STATUS, SEAT_STATUS } from '../constants/bookingStatus.js';
import { generateBookingReference, generateTransactionId } from '../utils/referenceGenerator.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database seed...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Screen.deleteMany({}),
      Seat.deleteMany({}),
      Showtime.deleteMany({}),
      Booking.deleteMany({}),
      BookingSeat.deleteMany({}),
      Review.deleteMany({})
    ]);

    console.log('[Seed] Cleared existing records.');

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@imovies.com',
      password: 'Admin@123',
      role: ROLES.ADMIN,
      phone: '+1 (555) 123-4567',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    });

    const standardUser = await User.create({
      name: 'Alex Johnson',
      email: 'user@imovies.com',
      password: 'User@123',
      role: ROLES.USER,
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
    });

    const reviewerUser = await User.create({
      name: 'Sophia Martinez',
      email: 'sophia@imovies.com',
      password: 'User@123',
      role: ROLES.USER,
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'
    });

    console.log('[Seed] Created default users (Admin & Demo Users).');

    // 2. Seed Movies
    const moviesData = [
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
        durationMinutes: 166,
        releaseDate: new Date('2024-03-01'),
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        languages: ['English', 'Spanish', 'French'],
        certificate: 'UA',
        posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        bannerUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
        trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
        director: 'Denis Villeneuve',
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides', photo: 'https://image.tmdb.org/t/p/w200/BE2sdjpgsa2rNTFa66f7upkaOP.jpg' },
          { name: 'Zendaya', role: 'Chani', photo: 'https://image.tmdb.org/t/p/w200/r3A7dr7rKV7xSS4CGD11467gR7z.jpg' },
          { name: 'Rebecca Ferguson', role: 'Lady Jessica', photo: 'https://image.tmdb.org/t/p/w200/lJloTOheuQSirSLXNA3jhHUSqqL.jpg' }
        ],
        status: 'now_showing'
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, examining the moral dilemmas and geopolitical fallout.',
        durationMinutes: 180,
        releaseDate: new Date('2023-07-21'),
        genres: ['Biography', 'Drama', 'History'],
        languages: ['English', 'German'],
        certificate: 'A',
        posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        bannerUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
        trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
        director: 'Christopher Nolan',
        cast: [
          { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', photo: 'https://image.tmdb.org/t/p/w200/dm6V2bT42u0e2YnB66kM1G4PzY6.jpg' },
          { name: 'Emily Blunt', role: 'Katherine Oppenheimer', photo: 'https://image.tmdb.org/t/p/w200/nPJdtVuWuR5nKx5N25Q5x79.jpg' },
          { name: 'Robert Downey Jr.', role: 'Lewis Strauss', photo: 'https://image.tmdb.org/t/p/w200/5qHNjhtjMD4YWH3vi0lZq9500.jpg' }
        ],
        status: 'now_showing'
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        durationMinutes: 169,
        releaseDate: new Date('2014-11-07'),
        genres: ['Adventure', 'Drama', 'Sci-Fi'],
        languages: ['English'],
        certificate: 'UA',
        posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        bannerUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqJJR0KP8UN8vCnZMNr00s.jpg',
        trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
        director: 'Christopher Nolan',
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper', photo: 'https://image.tmdb.org/t/p/w200/eDeWQ2f2z45X3.jpg' },
          { name: 'Anne Hathaway', role: 'Brand', photo: 'https://image.tmdb.org/t/p/w200/tLel4Nah5k5QkQ.jpg' },
          { name: 'Jessica Chastain', role: 'Murph', photo: 'https://image.tmdb.org/t/p/w200/nkFrnU6HwZ3x.jpg' }
        ],
        status: 'now_showing'
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        durationMinutes: 140,
        releaseDate: new Date('2023-06-02'),
        genres: ['Animation', 'Action', 'Adventure'],
        languages: ['English', 'Spanish'],
        certificate: 'U',
        posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        bannerUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
        trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
        director: 'Joaquim Dos Santos, Kemp Powers',
        cast: [
          { name: 'Shameik Moore', role: 'Miles Morales', photo: 'https://image.tmdb.org/t/p/w200/2L32026.jpg' },
          { name: 'Hailee Steinfeld', role: 'Gwen Stacy', photo: 'https://image.tmdb.org/t/p/w200/980124.jpg' }
        ],
        status: 'now_showing'
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        durationMinutes: 152,
        releaseDate: new Date('2008-07-18'),
        genres: ['Action', 'Crime', 'Drama'],
        languages: ['English'],
        certificate: 'UA',
        posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        bannerUrl: 'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1r0YuhqqBiK66.jpg',
        trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
        director: 'Christopher Nolan',
        cast: [
          { name: 'Christian Bale', role: 'Bruce Wayne / Batman', photo: 'https://image.tmdb.org/t/p/w200/b7fTC9WFkgqGOv771TTCH5.jpg' },
          { name: 'Heath Ledger', role: 'Joker', photo: 'https://image.tmdb.org/t/p/w200/5Y9HnYYa.jpg' }
        ],
        status: 'now_showing'
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome.',
        durationMinutes: 148,
        releaseDate: new Date('2024-11-22'),
        genres: ['Action', 'Adventure', 'Drama'],
        languages: ['English'],
        certificate: 'A',
        posterUrl: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
        bannerUrl: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnExsnsPy0asNtF.jpg',
        trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo',
        director: 'Ridley Scott',
        cast: [
          { name: 'Paul Mescal', role: 'Lucius Verus', photo: 'https://image.tmdb.org/t/p/w200/pm98371.jpg' },
          { name: 'Pedro Pascal', role: 'Marcus Acacius', photo: 'https://image.tmdb.org/t/p/w200/pedro12.jpg' },
          { name: 'Denzel Washington', role: 'Macrinus', photo: 'https://image.tmdb.org/t/p/w200/denzel7.jpg' }
        ],
        status: 'coming_soon'
      }
    ];

    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`[Seed] Created ${createdMovies.length} movies.`);

    // 3. Seed Theatres
    const theatresData = [
      {
        name: 'Grand IMAX Horizon Cineplex',
        city: 'New York',
        address: '420 West 42nd St, Times Square, New York, NY 10036',
        contactPhone: '+1 (212) 555-0199',
        amenities: ['IMAX with Laser', 'Dolby Atmos', 'VIP Recliners', 'Gourmet Bar & Cafe', 'Valet Parking']
      },
      {
        name: 'Starlight Luxury Cinema',
        city: 'Los Angeles',
        address: '6801 Hollywood Blvd, Hollywood, CA 90028',
        contactPhone: '+1 (323) 555-0144',
        amenities: ['4DX Motion Seats', 'Dolby Cinema', 'In-Seat Dining', 'Heated Recliners', 'Cocktail Lounge']
      },
      {
        name: 'Regal Skyline Multiplex',
        city: 'Chicago',
        address: '600 E Grand Ave, Navy Pier, Chicago, IL 60611',
        contactPhone: '+1 (312) 555-0177',
        amenities: ['RealD 3D', 'Dolby 7.1 Surround', 'Reclining Leather Loungers', 'Free Arcade']
      }
    ];

    const createdTheatres = await Theatre.insertMany(theatresData);
    console.log(`[Seed] Created ${createdTheatres.length} theatres.`);

    // 4. Seed Screens & Seats
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const columns = 10; // 80 seats per screen

    const createdScreens = [];
    for (const theatre of createdTheatres) {
      // Screen 1: IMAX
      const screen1 = await Screen.create({
        theatre: theatre._id,
        name: 'Screen 1 (IMAX Laser)',
        screenType: 'IMAX',
        soundSystem: 'Dolby Atmos 12-Channel',
        totalSeats: rows.length * columns,
        layoutConfig: {
          rows,
          columns,
          tiers: [
            { tierName: SEAT_TIERS.STANDARD, rows: ['A', 'B', 'C', 'D'], priceMultiplier: 1.0 },
            { tierName: SEAT_TIERS.PREMIUM, rows: ['E', 'F', 'G'], priceMultiplier: 1.35 },
            { tierName: SEAT_TIERS.VIP, rows: ['H'], priceMultiplier: 1.75 }
          ]
        }
      });
      createdScreens.push(screen1);

      // Screen 2: Dolby Atmos Standard
      const screen2 = await Screen.create({
        theatre: theatre._id,
        name: 'Screen 2 (Dolby Atmos)',
        screenType: '2D',
        soundSystem: 'Dolby Atmos 7.1',
        totalSeats: rows.length * columns,
        layoutConfig: {
          rows,
          columns,
          tiers: [
            { tierName: SEAT_TIERS.STANDARD, rows: ['A', 'B', 'C', 'D', 'E'], priceMultiplier: 1.0 },
            { tierName: SEAT_TIERS.PREMIUM, rows: ['F', 'G'], priceMultiplier: 1.3 },
            { tierName: SEAT_TIERS.VIP, rows: ['H'], priceMultiplier: 1.6 }
          ]
        }
      });
      createdScreens.push(screen2);

      // Create seats for both screens
      for (const sc of [screen1, screen2]) {
        const seatDocs = [];
        for (const row of rows) {
          let tier = SEAT_TIERS.STANDARD;
          if (['E', 'F', 'G'].includes(row)) tier = SEAT_TIERS.PREMIUM;
          if (row === 'H') tier = SEAT_TIERS.VIP;

          for (let col = 1; col <= columns; col++) {
            seatDocs.push({
              screen: sc._id,
              row,
              number: col,
              seatCode: `${row}${col}`,
              tier,
              isAvailable: true
            });
          }
        }
        await Seat.insertMany(seatDocs);
      }
    }

    console.log(`[Seed] Created ${createdScreens.length} screens and seats across theatres.`);

    // 5. Seed Showtimes for Today and Next 3 Days
    const baseDate = new Date();
    const timeSlots = [
      { startH: 11, startM: 0, durH: 2, durM: 45 },
      { startH: 14, startM: 30, durH: 2, durM: 45 },
      { startH: 18, startM: 15, durH: 2, durM: 45 },
      { startH: 21, startM: 45, durH: 2, durM: 45 }
    ];

    const showtimesToInsert = [];
    const nowShowingMovies = createdMovies.filter(m => m.status === 'now_showing');

    for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
      const targetDay = new Date(baseDate);
      targetDay.setDate(targetDay.getDate() + dayOffset);

      for (let i = 0; i < createdScreens.length; i++) {
        const screen = createdScreens[i];
        const movie = nowShowingMovies[i % nowShowingMovies.length];

        for (const slot of timeSlots) {
          const startTime = new Date(targetDay);
          startTime.setHours(slot.startH, slot.startM, 0, 0);

          const endTime = new Date(startTime);
          endTime.setHours(startTime.getHours() + slot.durH, startTime.getMinutes() + slot.durM);

          showtimesToInsert.push({
            movie: movie._id,
            theatre: screen.theatre,
            screen: screen._id,
            startTime,
            endTime,
            format: screen.screenType === 'IMAX' ? 'IMAX 2D' : '2D',
            language: 'English',
            pricing: {
              standard: screen.screenType === 'IMAX' ? 15.0 : 12.0,
              premium: screen.screenType === 'IMAX' ? 20.0 : 16.0,
              vip: screen.screenType === 'IMAX' ? 28.0 : 22.0
            },
            status: 'active'
          });
        }
      }
    }

    const createdShowtimes = await Showtime.insertMany(showtimesToInsert);
    console.log(`[Seed] Created ${createdShowtimes.length} showtimes.`);

    // 6. Create Initial Demo Bookings & Reserved Seats
    const targetShowtime = createdShowtimes[0];
    const targetScreenSeats = await Seat.find({ screen: targetShowtime.screen }).limit(6);

    const bookedSeatsItems = [
      {
        seatId: targetScreenSeats[0]._id,
        seatCode: targetScreenSeats[0].seatCode,
        tier: targetScreenSeats[0].tier,
        price: targetShowtime.pricing.standard
      },
      {
        seatId: targetScreenSeats[1]._id,
        seatCode: targetScreenSeats[1].seatCode,
        tier: targetScreenSeats[1].tier,
        price: targetShowtime.pricing.standard
      }
    ];

    const subtotal = bookedSeatsItems.reduce((acc, curr) => acc + curr.price, 0);
    const fee = 3.0;
    const taxes = Number(((subtotal + fee) * 0.18).toFixed(2));
    const totalAmount = Number((subtotal + fee + taxes).toFixed(2));

    const sampleBooking = await Booking.create({
      bookingReference: generateBookingReference(),
      user: standardUser._id,
      showtime: targetShowtime._id,
      movie: targetShowtime.movie,
      theatre: targetShowtime.theatre,
      screen: targetShowtime.screen,
      seats: bookedSeatsItems,
      subtotal,
      convenienceFee: fee,
      taxAmount: taxes,
      totalAmount,
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentMethod: 'Credit Card',
      paymentTransactionId: generateTransactionId('CARD'),
      bookingStatus: BOOKING_STATUS.CONFIRMED,
      qrCodeData: JSON.stringify({ ref: 'DEMO-REF', seats: ['A1', 'A2'] })
    });

    await BookingSeat.insertMany([
      {
        showtime: targetShowtime._id,
        seat: targetScreenSeats[0]._id,
        seatCode: targetScreenSeats[0].seatCode,
        booking: sampleBooking._id,
        status: SEAT_STATUS.BOOKED
      },
      {
        showtime: targetShowtime._id,
        seat: targetScreenSeats[1]._id,
        seatCode: targetScreenSeats[1].seatCode,
        booking: sampleBooking._id,
        status: SEAT_STATUS.BOOKED
      }
    ]);

    console.log('[Seed] Created demo booking and reserved seat records.');

    // 7. Seed Reviews
    await Review.create({
      movie: createdMovies[0]._id,
      user: standardUser._id,
      rating: 9.5,
      title: 'A Cinematic Masterpiece!',
      comment: 'The scale, sound design, and visuals of Dune Part Two in IMAX are unmatched. Denis Villeneuve has created a modern sci-fi legend.',
      isVerifiedBooking: true,
      status: 'approved'
    });

    await Review.create({
      movie: createdMovies[0]._id,
      user: reviewerUser._id,
      rating: 9.0,
      title: 'Visually stunning',
      comment: 'Incredible performances, especially Austin Butler and Zendaya. Must watch on the biggest screen possible!',
      isVerifiedBooking: true,
      status: 'approved'
    });

    await Review.create({
      movie: createdMovies[1]._id,
      user: reviewerUser._id,
      rating: 10.0,
      title: 'Flawless pacing and tension',
      comment: 'Cillian Murphy gives the performance of a lifetime. The Trinity test sequence was nerve-shredding.',
      isVerifiedBooking: true,
      status: 'approved'
    });

    // Recalculate movie average ratings
    await Review.calculateAverageRating(createdMovies[0]._id);
    await Review.calculateAverageRating(createdMovies[1]._id);

    console.log('[Seed] Seed completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Evaluation Credentials:');
    console.log('Admin: admin@imovies.com / Admin@123');
    console.log('User:  user@imovies.com  / User@123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seed] Error during database seed:', error);
    throw error;
  }
};

// If run directly via `node src/scripts/seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}
