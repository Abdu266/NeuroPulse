import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertMigrainePeriodSchema,
  insertMedicationSchema,
  insertMedicationLogSchema,
  insertTriggerSchema,
  insertDeviceDataSchema,
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Migraine episode routes
  app.post('/api/episodes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const episodeData = insertMigrainePeriodSchema.parse({
        ...req.body,
        userId,
        startTime: new Date(req.body.startTime || Date.now()),
      });
      
      const episode = await storage.createMigrainePeriod(episodeData);
      res.json(episode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).toString() });
      } else {
        console.error("Error creating episode:", error);
        res.status(500).json({ message: "Failed to create episode" });
      }
    }
  });

  app.get('/api/episodes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const episodes = await storage.getMigrainePeriods(userId, limit);
      res.json(episodes);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      res.status(500).json({ message: "Failed to fetch episodes" });
    }
  });

  app.patch('/api/episodes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const episodeId = parseInt(req.params.id);
      const updates = req.body;
      
      if (updates.endTime) {
        updates.endTime = new Date(updates.endTime);
      }
      
      const episode = await storage.updateMigrainePeriod(episodeId, updates);
      res.json(episode);
    } catch (error) {
      console.error("Error updating episode:", error);
      res.status(500).json({ message: "Failed to update episode" });
    }
  });

  // Medication routes
  app.post('/api/medications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medicationData = insertMedicationSchema.parse({
        ...req.body,
        userId,
      });
      
      const medication = await storage.createMedication(medicationData);
      res.json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).toString() });
      } else {
        console.error("Error creating medication:", error);
        res.status(500).json({ message: "Failed to create medication" });
      }
    }
  });

  app.get('/api/medications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      console.error("Error fetching medications:", error);
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  // Medication log routes
  app.post('/api/medication-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logData = insertMedicationLogSchema.parse({
        ...req.body,
        userId,
        takenAt: new Date(req.body.takenAt || Date.now()),
      });
      
      const log = await storage.createMedicationLog(logData);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).toString() });
      } else {
        console.error("Error creating medication log:", error);
        res.status(500).json({ message: "Failed to create medication log" });
      }
    }
  });

  app.get('/api/medication-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logs = await storage.getMedicationLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching medication logs:", error);
      res.status(500).json({ message: "Failed to fetch medication logs" });
    }
  });

  app.get('/api/medications/:id/effectiveness', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medicationId = parseInt(req.params.id);
      const effectiveness = await storage.getMedicationEffectiveness(userId, medicationId);
      res.json({ effectiveness: Math.round(effectiveness * 10) });
    } catch (error) {
      console.error("Error fetching medication effectiveness:", error);
      res.status(500).json({ message: "Failed to fetch medication effectiveness" });
    }
  });

  // Trigger routes
  app.post('/api/triggers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const triggerData = insertTriggerSchema.parse({
        ...req.body,
        userId,
      });
      
      const trigger = await storage.createTrigger(triggerData);
      res.json(trigger);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).toString() });
      } else {
        console.error("Error creating trigger:", error);
        res.status(500).json({ message: "Failed to create trigger" });
      }
    }
  });

  app.get('/api/triggers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const triggers = await storage.getTriggers(userId);
      res.json(triggers);
    } catch (error) {
      console.error("Error fetching triggers:", error);
      res.status(500).json({ message: "Failed to fetch triggers" });
    }
  });

  // Device data routes
  app.post('/api/device-data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deviceData = insertDeviceDataSchema.parse({
        ...req.body,
        userId,
        timestamp: new Date(req.body.timestamp || Date.now()),
      });
      
      const data = await storage.createDeviceData(deviceData);
      res.json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).toString() });
      } else {
        console.error("Error creating device data:", error);
        res.status(500).json({ message: "Failed to create device data" });
      }
    }
  });

  app.get('/api/device-data/latest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const latestData = await storage.getLatestDeviceData(userId);
      res.json(latestData);
    } catch (error) {
      console.error("Error fetching latest device data:", error);
      res.status(500).json({ message: "Failed to fetch latest device data" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/weekly', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getWeeklyStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      res.status(500).json({ message: "Failed to fetch weekly stats" });
    }
  });

  // Medical reports
  app.post('/api/reports/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate, reportType = 'custom' } = req.body;
      
      // Get episodes in date range
      const episodes = await storage.getMigrainePeriodsByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      
      // Get medication logs in date range
      const medicationLogs = await storage.getMedicationLogs(userId);
      const filteredMedLogs = medicationLogs.filter(log => 
        log.takenAt >= new Date(startDate) && log.takenAt <= new Date(endDate)
      );
      
      // Get triggers
      const triggers = await storage.getTriggers(userId);
      
      // Generate report data
      const reportData = {
        summary: {
          totalEpisodes: episodes.length,
          avgIntensity: episodes.reduce((sum, ep) => sum + ep.intensity, 0) / episodes.length || 0,
          totalMedications: filteredMedLogs.length,
          mostCommonTriggers: triggers.slice(0, 3).map(t => t.name),
        },
        episodes: episodes.map(ep => ({
          date: ep.startTime,
          intensity: ep.intensity,
          duration: ep.endTime ? 
            (ep.endTime.getTime() - ep.startTime.getTime()) / (1000 * 60 * 60) : null,
          symptoms: ep.symptoms,
          triggers: ep.triggers,
        })),
        medications: filteredMedLogs.map(log => ({
          date: log.takenAt,
          medication: log.medicationId,
          effectiveness: log.effectiveness,
        })),
        triggers: triggers.map(t => ({
          name: t.name,
          correlation: t.correlationScore,
          frequency: t.frequency,
        })),
      };
      
      const report = await storage.createMedicalReport({
        userId,
        reportType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reportData,
      });
      
      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getMedicalReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
