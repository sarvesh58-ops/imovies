import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Public Pages
import { Home } from '../pages/Home';
import { Movies } from '../pages/Movies';
import { MovieDetails } from '../pages/MovieDetails';
import { Theatres } from '../pages/Theatres';
import { ShowtimeBooking } from '../pages/ShowtimeBooking';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { NotFound } from '../pages/NotFound';

// Protected Customer Pages
import { Checkout } from '../pages/Checkout';
import { BookingConfirmation } from '../pages/BookingConfirmation';
import { BookingHistory } from '../pages/BookingHistory';
import { Profile } from '../pages/Profile';

// Admin Pages
import { Dashboard } from '../pages/admin/Dashboard';
import { MovieManagement } from '../pages/admin/MovieManagement';
import { TheatreManagement } from '../pages/admin/TheatreManagement';
import { ShowtimeManagement } from '../pages/admin/ShowtimeManagement';
import { BookingManagement } from '../pages/admin/BookingManagement';
import { UserManagement } from '../pages/admin/UserManagement';
import { ReviewManagement } from '../pages/admin/ReviewManagement';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public & Customer Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/theatres" element={<Theatres />} />
        <Route path="/booking/:showtimeId" element={<ShowtimeBooking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Customer Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/success/:id"
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <BookingHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="movies" element={<MovieManagement />} />
        <Route path="theatres" element={<TheatreManagement />} />
        <Route path="showtimes" element={<ShowtimeManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reviews" element={<ReviewManagement />} />
      </Route>

      {/* 404 Catch All */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
