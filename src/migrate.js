// migrate.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js"; // Your schema
import ConnectedSite from "./models/ConnectedSite.js"; // Your schema
import Campaign from  "./models/Campaign.js"
import SiteAccess from "./models/SiteAccess.js"
import Project from './models/Project.js'
import Invite from "./models/Invite.js";


import {Visitor ,Session, PageView,ProductEvent,CartEvent,Purchase,CampaignEvent,SearchEvent,UserBehavior} from "./models/analytics.js"; // Your schema






dotenv.config(); // Load .env.local if needed


async function runMigration() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://programmer119dynamicdreamz:test1234@cluster0.pamppes.mongodb.net/" // Make sure this is correct
    
    await mongoose.connect(uri, {});

    
    await User.init(); // This creates all indexes from your schema
    await Visitor.init(); // This creates all indexes from your schema
    await Session.init(); // This creates all indexes from your schema
    await PageView.init(); // This creates all indexes from your schema
    await ProductEvent.init(); // This creates all indexes from your schema
    await CartEvent.init(); // This creates all indexes from your schema
    await Purchase.init(); // This creates all indexes from your schema
    await CampaignEvent.init(); // This creates all indexes from your schema
    await SearchEvent.init(); // This creates all indexes from your schema
    await UserBehavior.init(); // This creates all indexes from your schema
    await ConnectedSite.init(); // This creates all indexes from your schema
    await Campaign.init(); // This creates all indexes from your schema
    await SiteAccess.init(); // This creates all indexes from your schema
    await Project.init(); // This creates all indexes from your schema
    await Invite.init(); // This creates all indexes from your schema

    console.log("Migration completed ✅");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed ❌", error);
    process.exit(1);
  }
}

runMigration();
