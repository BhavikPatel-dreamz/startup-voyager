"use server";

import { connectToDatabase } from "../mongoose";
import ConnectedSite from "../../models/ConnectedSite";
import SiteAccess from "../../models/SiteAccess";

export async function fetchSiteScript(siteId) {
  try {
    await connectToDatabase();
    const site = await ConnectedSite.findById(siteId);
    
    if (!site) {
      return { success: false, error: "Site not found" };
    }
    return { success: true, data: site ? JSON.parse(JSON.stringify(site)) : {} };
  } catch (error) {
    console.error("Error fetching site script:", error);
    return { success: false, error: "Failed to fetch site script" };
  }
}

export async function fetchSiteAccess(siteId) {
  try {
    await connectToDatabase();
    const siteAccess = await SiteAccess.find({ 
      siteId, 
      isActive: true 
    }).populate('userId', 'firstName lastName email role businessName');

    return { success: true, data: siteAccess };
  } catch (error) {
    console.error("Error fetching site access:", error);
    return { success: false, error: "Failed to fetch site access" };
  }
}

export async function updateSiteScript(siteId, scriptData) {
  try {
    await connectToDatabase();
    
    const updateData = {
      ...scriptData,
      lastScriptUpdate: new Date(),
      updatedAt: new Date()
    };

    // Update script version
    const site = await ConnectedSite.findById(siteId);
    if (site) {
      const currentVersion = site.scriptVersion || '1.0.0';
      const versionParts = currentVersion.split('.');
      versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
      updateData.scriptVersion = versionParts.join('.');
    }

    const updatedSite = await ConnectedSite.findByIdAndUpdate(
      siteId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSite) {
      return { success: false, error: "Site not found" };
    }

    return { success: true, data: updatedSite };
  } catch (error) {
    console.error("Error updating site script:", error);
    return { success: false, error: "Failed to update site script" };
  }
}

export async function grantSiteAccess(siteId, userId, permission, grantedBy) {
  try {
    await connectToDatabase();
    
    // Check if access already exists
    const existingAccess = await SiteAccess.findOne({ userId, siteId });
    if (existingAccess) {
      // Update existing access
      existingAccess.permission = permission;
      existingAccess.grantedBy = grantedBy;
      existingAccess.grantedAt = new Date();
      existingAccess.isActive = true;
      await existingAccess.save();
    } else {
      // Create new access
      const newAccess = new SiteAccess({
        userId,
        siteId,
        permission,
        grantedBy
      });
      await newAccess.save();
    }

    return { success: true, message: "Access granted successfully" };
  } catch (error) {
    console.error("Error granting site access:", error);
    return { success: false, error: "Failed to grant access" };
  }
}

export async function revokeSiteAccess(siteId, userId) {
  try {
    await connectToDatabase();
    
    const result = await SiteAccess.findOneAndUpdate(
      { userId, siteId },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return { success: false, error: "Access not found" };
    }

    return { success: true, message: "Access revoked successfully" };
  } catch (error) {
    console.error("Error revoking site access:", error);
    return { success: false, error: "Failed to revoke access" };
  }
}

export async function fetchUsers() {
  try {
    await connectToDatabase();
    
    const users = await User.find({ isActive: true })
      .select('firstName lastName email role businessName')
      .sort({ firstName: 1, lastName: 1 });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
} 