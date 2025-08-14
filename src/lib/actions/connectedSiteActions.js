"use server";

import ConnectedSite from "../../models/ConnectedSite";
import { connectToDatabase } from "../mongoose";

class ConnectedSiteService {
  async fetchSites() {
    try {
      await connectToDatabase();
      const sites = await ConnectedSite.find({ isActive: true }).sort({ createdAt: -1 });
      return { success: true, data: sites };
    } catch (error) {
      console.error("Error fetching connected sites:", error);
      return { success: false, error: "Failed to fetch connected sites" };
    }
  }

  async createSite(siteData) {
    try {
      const { domain, platform, owner, clientId } = siteData;

      if (!domain || !platform || !owner || !clientId) {
        return { success: false, error: "Missing required fields" };
      }

      await connectToDatabase();

      if (await ConnectedSite.findOne({ domain })) {
        return { success: false, error: "Domain already exists" };
      }

      if (await ConnectedSite.findOne({ clientId })) {
        return { success: false, error: "Client ID already exists" };
      }

      const newSite = new ConnectedSite({
        domain,
        platform,
        owner,
        clientId,
        scriptStatus: "Script Pending",
        connectionStatus: "Pending",
        trackingScript: "",
        lastPing: null,
        isActive: true,
      });

      const savedSite = await newSite.save();
      return { success: true, data: savedSite };
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

      return { success: true, data: updatedSite };
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

      return { success: true, message: "Site deleted successfully" };
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
    return this.updateSite(id, { connectionStatus: status });
  }

  async updateTrackingScript(id, script) {
    return this.updateSite(id, { trackingScript: script, scriptStatus: "Script Active" });
  }

  async updateLastPing(id) {
    return this.updateSite(id, { lastPing: new Date() });
  }
}

const service = new ConnectedSiteService();

// Export async functions bound to the instance
export const fetchSites = service.fetchSites.bind(service);
export const createSite = service.createSite.bind(service);
export const updateSite = service.updateSite.bind(service);
export const deleteSite = service.deleteSite.bind(service);
export const toggleScriptStatus = service.toggleScriptStatus.bind(service);
export const updateConnectionStatus = service.updateConnectionStatus.bind(service);
export const updateTrackingScript = service.updateTrackingScript.bind(service);
export const updateLastPing = service.updateLastPing.bind(service);