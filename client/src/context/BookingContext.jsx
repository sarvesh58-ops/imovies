import React, { createContext, useContext, useState, useMemo } from 'react';
import { useToast } from './ToastContext';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [activeShowtime, setActiveShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const { showToast } = useToast();

  const MAX_SEATS = 8;
  const CONVENIENCE_FEE_PER_SEAT = 1.5;
  const TAX_RATE = 0.18;

  const toggleSeat = (seat) => {
    // Check if already selected
    const isAlreadySelected = selectedSeats.some((s) => s._id === seat._id);

    if (isAlreadySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s._id !== seat._id));
      return;
    }

    if (selectedSeats.length >= MAX_SEATS) {
      showToast(`You can select a maximum of ${MAX_SEATS} seats per booking.`, 'warning');
      return;
    }

    setSelectedSeats((prev) => [...prev, seat]);
  };

  const clearBooking = () => {
    setActiveShowtime(null);
    setSelectedSeats([]);
  };

  // Dynamic calculations
  const priceSummary = useMemo(() => {
    const subtotal = selectedSeats.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const fee = selectedSeats.length * CONVENIENCE_FEE_PER_SEAT;
    const taxes = (subtotal + fee) * TAX_RATE;
    const total = subtotal + fee + taxes;

    return {
      seatCount: selectedSeats.length,
      subtotal: Math.round(subtotal * 100) / 100,
      convenienceFee: Math.round(fee * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      totalAmount: Math.round(total * 100) / 100
    };
  }, [selectedSeats]);

  const value = {
    activeShowtime,
    setActiveShowtime,
    selectedSeats,
    toggleSeat,
    clearBooking,
    priceSummary
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
