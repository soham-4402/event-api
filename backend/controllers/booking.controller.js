
const mongoose = require("mongoose");
const Booking = require("../models/booking.model");
const Event = require("../models/event.model");

// Create Booking
// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { eventId, seats } = req.body;

    if (!eventId || seats === undefined) {
      return res.status(400).json({
        message: "Event ID and number of seats are required",
      });
    }

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({
        message: "Seats must be a positive integer",
      });
    }

    // Atomically reserve seats to prevent overbooking
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        date: { $gt: new Date() },
        $expr: {
          $lte: [
            { $add: ["$bookedSeats", seats] },
            "$totalSeats",
          ],
        },
      },
      {
        $inc: { bookedSeats: seats },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      const existingEvent = await Event.findById(eventId);

      if (!existingEvent) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      return res.status(400).json({
        message: "Event is no longer available or there are not enough seats",
      });
    }

    try {
      const booking = await Booking.create({
        user: req.user._id,
        event: event._id,
        seats,
      });

      return res.status(201).json({
        message: "Booking created successfully",
        booking,
      });
    } catch (error) {
      // Restore seats if booking creation fails
      await Event.updateOne(
        { _id: event._id },
        { $inc: { bookedSeats: -seats } }
      );

      throw error;
    }
  } catch (error) {
    console.error("Create Booking Error:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get My Bookings
// GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("event", "title description date venue")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Cancel Booking
// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    // Only the owner can cancel a confirmed booking
    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
        status: "confirmed",
      },
      {
        $set: { status: "cancelled" },
      },
      {
        new: true,
      }
    );

    if (!booking) {
      const existingBooking = await Booking.findById(id);

      if (!existingBooking) {
        return res.status(404).json({
          message: "Booking not found",
        });
      }

      if (!existingBooking.user.equals(req.user._id)) {
        return res.status(403).json({
          message: "You are not allowed to cancel this booking",
        });
      }

      return res.status(400).json({
        message: "Booking has already been cancelled",
      });
    }

    // Restore the seats
    const event = await Event.findOneAndUpdate(
      {
        _id: booking.event,
        bookedSeats: { $gte: booking.seats },
      },
      {
        $inc: { bookedSeats: -booking.seats },
      },
      {
        new: true,
      }
    );

    if (!event) {
      // Restore the booking state if the event seat count cannot be updated
      await Booking.updateOne(
        { _id: booking._id, status: "cancelled" },
        { $set: { status: "confirmed" } }
      );

      return res.status(500).json({
        success: false,
        message: "Could not restore event seats",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
