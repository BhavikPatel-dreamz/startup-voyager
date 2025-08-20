"use server";

import { error } from "console";
import ConnectedSite from "../../models/ConnectedSite";
import { connectToDatabase } from "../mongoose";
import { randomBytes } from "crypto";

class ConnectedSiteService {
  async fetchSites() {
    try {
      await connectToDatabase();
      const sites = await ConnectedSite.find({ isActive: true })
        .sort({ createdAt: -1 })
        .lean(); // Use lean() to get plain JavaScript objects instead of Mongoose documents
      
      // Convert ObjectIds to strings and ensure all data is serializable
      const serializedSites = sites.map(site => ({
        ...site,
        _id: site._id.toString(),
        createdAt: site.createdAt ? site.createdAt.toISOString() : null,
        updatedAt: site.updatedAt ? site.updatedAt.toISOString() : null,
        lastPing: site.lastPing ? site.lastPing.toISOString() : null
      }));
      
      return { success: true, data: serializedSites };
    } catch (error) {
      console.error("Error fetching connected sites:", error);
      return { success: false, error: "Failed to fetch connected sites" };
    }
  }

  async fetchSitesWithFilters({ search = '', page = 1, limit = 10, platform = '', status = '' } = {}) {
    try {
      await connectToDatabase();
      
      // Build query
      const query = { isActive: true };
      
      if (search) {
        query.$or = [
          { domain: { $regex: search, $options: 'i' } },
          { owner: { $regex: search, $options: 'i' } },
          { platform: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (platform) {
        query.platform = platform;
      }
      
      if (status) {
        query.scriptStatus = status;
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Get total count for pagination
      const totalSites = await ConnectedSite.countDocuments(query);
      
      // Get paginated results and convert to plain objects
      const sites = await ConnectedSite.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(); // Use lean() to get plain JavaScript objects instead of Mongoose documents
      
      // Convert ObjectIds to strings and ensure all data is serializable
      const serializedSites = sites.map(site => ({
        ...site,
        _id: site._id.toString(),
        createdAt: site.createdAt ? site.createdAt.toISOString() : null,
        updatedAt: site.updatedAt ? site.updatedAt.toISOString() : null,
        lastPing: site.lastPing ? site.lastPing.toISOString() : null
      }));
      
      const totalPages = Math.ceil(totalSites / limit);
      
      return {
        success: true,
        sites: serializedSites,
        pagination: {
          currentPage: page,
          totalPages,
          totalSites,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error("Error fetching connected sites with filters:", error);
      return { success: false, error: "Failed to fetch connected sites" };
    }
  }

  async createSite(siteData) {
    try {

      const { domain, platform, project, owner } = siteData;

      if (!domain || !platform || !project) {
        throw new Error("Missing required fields");
      }

      await connectToDatabase();

      if (await ConnectedSite.findOne({ domain })) {
        return { success: false, error: "Domain already exists" };
      }

      // if (await ConnectedSite.findOne({ clientId })) {
      //   return { success: false, error: "Client ID already exists" };
      // }

      const clientId = `${domain}_${randomBytes(16).toString("hex")}`;
      const newSite = new ConnectedSite({
        domain,
        platform,
        project,
        owner,
        clientId,
        scriptStatus: "Script Pending",
        connectionStatus: "Pending",
        trackingScript: "",
        lastPing: null,
        isActive: true,
      });

      const savedSite = await newSite.save();
      
      // Convert to plain object and serialize ObjectIds and dates
      const serializedSite = {
        ...savedSite.toObject(),
        _id: savedSite._id.toString(),
        createdAt: savedSite.createdAt ? savedSite.createdAt.toISOString() : null,
        updatedAt: savedSite.updatedAt ? savedSite.updatedAt.toISOString() : null,
        lastPing: savedSite.lastPing ? savedSite.lastPing.toISOString() : null
      };
      
      return { success: true, data: serializedSite };
    } catch (error) {
      console.error("Error creating connected site:", error);
      return { success: false, error: "Failed to create connected site" };
    }
  }

  async updateSite(id, updateData) {
    try {
      await connectToDatabase();

      const updatedSite = await ConnectedSite.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedSite) {
        return { success: false, error: "Site not found" };
      }

      // Convert to plain object and serialize ObjectIds and dates
      const serializedSite = {
        ...updatedSite.toObject(),
        _id: updatedSite._id.toString(),
        createdAt: updatedSite.createdAt ? updatedSite.createdAt.toISOString() : null,
        updatedAt: updatedSite.updatedAt ? updatedSite.updatedAt.toISOString() : null,
        lastPing: updatedSite.lastPing ? updatedSite.lastPing.toISOString() : null
      };

      return { success: true, data: serializedSite };
    } catch (error) {
      console.error("Error updating connected site:", error);
      return { success: false, error: "Failed to update connected site" };
    }
  }

  async deleteSite(id) {
    try {
      await connectToDatabase();

      const deletedSite = await ConnectedSite.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!deletedSite) {
        return { success: false, error: "Site not found" };
      }

      // Convert to plain object and serialize ObjectIds and dates
      const serializedSite = {
        ...deletedSite.toObject(),
        _id: deletedSite._id.toString(),
        createdAt: deletedSite.createdAt ? deletedSite.createdAt.toISOString() : null,
        updatedAt: deletedSite.updatedAt ? deletedSite.updatedAt.toISOString() : null,
        lastPing: deletedSite.lastPing ? deletedSite.lastPing.toISOString() : null
      };

      return { success: true, message: "Site deleted successfully", data: serializedSite };
    } catch (error) {
      console.error("Error deleting connected site:", error);
      return { success: false, error: "Failed to delete connected site" };
    }
  }

  async toggleScriptStatus(id, currentStatus) {
    const newStatus = currentStatus === "Script Active" ? "Script Inactive" : "Script Active";
    return this.updateSite(id, { scriptStatus: newStatus });
  }

  async updateConnectionStatus(id, status) {
    try {
      await connectToDatabase();
      
      const updatedSite = await ConnectedSite.findByIdAndUpdate(
        id,
        { connectionStatus: status, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedSite) {
        return { success: false, error: "Site not found" };
      }

      // Convert to plain object and serialize ObjectIds and dates
      const serializedSite = {
        ...updatedSite.toObject(),
        _id: updatedSite._id.toString(),
        createdAt: updatedSite.createdAt ? updatedSite.createdAt.toISOString() : null,
        updatedAt: updatedSite.updatedAt ? updatedSite.updatedAt.toISOString() : null,
        lastPing: updatedSite.lastPing ? updatedSite.lastPing.toISOString() : null
      };

      return { success: true, data: serializedSite };
    } catch (error) {
      console.error("Error updating connection status:", error);
      return { success: false, error: "Failed to update connection status" };
    }
  }

  async updateTrackingScript(id, script) {
    try {
      await connectToDatabase();
      
      const updatedSite = await ConnectedSite.findByIdAndUpdate(
        id,
        { trackingScript: script, scriptStatus: "Script Active", updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedSite) {
        return { success: false, error: "Site not found" };
      }

      // Convert to plain object and serialize ObjectIds and dates
      const serializedSite = {
        ...updatedSite.toObject(),
        _id: updatedSite._id.toString(),
        createdAt: updatedSite.createdAt ? updatedSite.createdAt.toISOString() : null,
        updatedAt: updatedSite.updatedAt ? updatedSite.updatedAt.toISOString() : null,
        lastPing: updatedSite.lastPing ? updatedSite.lastPing.toISOString() : null
      };

      return { success: true, data: serializedSite };
    } catch (error) {
      console.error("Error updating tracking script:", error);
      return { success: false, error: "Failed to update tracking script" };
    }
  }

  async updateLastPing(id) {
    try {
      await connectToDatabase();
      
      const updatedSite = await ConnectedSite.findByIdAndUpdate(
        id,
        { lastPing: new Date(), updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedSite) {
        return { success: false, error: "Site not found" };
      }

      // Convert to plain object and serialize ObjectIds and dates
      const serializedSite = {
        ...updatedSite.toObject(),
        _id: updatedSite._id.toString(),
        createdAt: updatedSite.createdAt ? updatedSite.createdAt.toISOString() : null,
        updatedAt: updatedSite.updatedAt ? updatedSite.updatedAt.toISOString() : null,
        lastPing: updatedSite.lastPing ? updatedSite.lastPing.toISOString() : null
      };

      return { success: true, data: serializedSite };
    } catch (error) {
      console.error("Error updating last ping:", error);
      return { success: false, error: "Failed to update last ping" };
    }
  }
}

const service = new ConnectedSiteService();

// Export async functions bound to the instance
export const fetchSites = service.fetchSites.bind(service);
export const fetchSitesWithFilters = service.fetchSitesWithFilters.bind(service);
export const createSite = service.createSite.bind(service);
export const updateSite = service.updateSite.bind(service);
export const deleteSite = service.deleteSite.bind(service);
export const toggleScriptStatus = service.toggleScriptStatus.bind(service);
export const updateConnectionStatus = service.updateConnectionStatus.bind(service);
export const updateTrackingScript = service.updateTrackingScript.bind(service);
export const updateLastPing = service.updateLastPing.bind(service);