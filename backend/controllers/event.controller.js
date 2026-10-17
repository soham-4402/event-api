
const mongoose = require("mongoose");
const Event = require("../models/event.model");

// Create Event
// POST /api/events
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      venue,
      totalSeats,
    } = req.body;

    if (!title || !description || !date || !venue || totalSeats == null) {
      return res.status(400).json({
        message: "All event fields are required",
      });
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      return res.status(400).json({
        message: "Event date must be a valid future date",
      });
    }

    if (
      !Number.isInteger(totalSeats) ||
      totalSeats < 1
    ) {
      return res.status(400).json({
        message: "Total seats must be a positive integer",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date: eventDate,
      venue: venue.trim(),
      totalSeats,
    });

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create Event Error:", error);

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

// Get All Upcoming Events with optional search
// GET /api/events?search=concert
const getAllEvents = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {
      date: { $gt: new Date() },
    };

    if (typeof search === "string" && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { venue: searchRegex },
      ];
    }

    const events = await Event.find(filter).sort({ date: 1 });

    return res.status(200).json({
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get Events Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Single Event
// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.status(200).json({
  
      event,
    });
  } catch (error) {
    console.error("Get Event Error:", error);

    return res.status(500).json({
  
      message: "Internal server error",
    });
  }
};

// Update Event
// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      venue,
      totalSeats,
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
    
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
     
        message: "Event not found",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
         
          message: "Title cannot be empty",
        });
      }

      event.title = title.trim();
    }

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        !description.trim()
      ) {
        return res.status(400).json({
      
          message: "Description cannot be empty",
        });
      }

      event.description = description.trim();
    }

    if (venue !== undefined) {
      if (typeof venue !== "string" || !venue.trim()) {
        return res.status(400).json({
       
          message: "Venue cannot be empty",
        });
      }

      event.venue = venue.trim();
    }

    if (date !== undefined) {
      const eventDate = new Date(date);

      if (
        Number.isNaN(eventDate.getTime()) ||
        eventDate <= new Date()
      ) {
        return res.status(400).json({
         
          message: "Event date must be a valid future date",
        });
      }

      event.date = eventDate;
    }

    if (totalSeats !== undefined) {
      if (
        !Number.isInteger(totalSeats) ||
        totalSeats < 1
      ) {
        return res.status(400).json({
        
          message: "Total seats must be a positive integer",
        });
      }

      if (totalSeats < event.bookedSeats) {
        return res.status(400).json({
        
          message: "Total seats cannot be less than booked seats",
        });
      }

      event.totalSeats = totalSeats;
    }

    await event.save();

    return res.status(200).json({
 
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update Event Error:", error);

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

// Delete Event
// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
       
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
      
        message: "Event not found",
      });
    }

    if (event.bookedSeats > 0) {
      return res.status(400).json({
   
        message: "Cannot delete an event with booked seats",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
   
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);

    return res.status(500).json({
      
      message: "Internal server error",
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
