import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // Check availability for a specific class and date
  app.get("/api/availability", async (req, res) => {
    try {
      const { classId, date } = req.query;
      
      if (!classId || !date) {
        return res.status(400).json({ error: "Class ID and date are required" });
      }

      const availability = await storage.checkAvailability(classId as string, date as string);
      res.json(availability);
    } catch (error) {
      console.error("Availability check error:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
