import { connectToDatabase } from "../../../lib/mongoose";
import User from "../../../models/User";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { firstName, lastName, email, password, businessName } = req.body || {};

		if (!firstName || !lastName || !email || !password || !businessName) {
			return res.status(400).json({ error: "All fields are required" });
		}

		await connectToDatabase();
		const existing = await User.findOne({ email: email.toLowerCase() });
		if (existing) {
			return res.status(409).json({ error: "User with this email already exists" });
		}

		const user = new User({ firstName, lastName, email: email.toLowerCase(), password, businessName });
		await user.save();

		return res.status(201).json({ success: true });
	} catch (err) {
		console.error("Registration error:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
} 