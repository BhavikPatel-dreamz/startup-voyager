import { connectToDatabase } from "../../../../lib/mongoose";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
	try {
		const { firstName, lastName, email, password, businessName } = await req.json();

		// Validate required fields
		if (!firstName || !lastName || !email || !password || !businessName) {
			return Response.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return Response.json(
				{ error: "Invalid email format" },
				{ status: 400 }
			);
		}

		// Validate password strength
		if (password.length < 6) {
			return Response.json(
				{ error: "Password must be at least 6 characters long" },
				{ status: 400 }
			);
		}

		await connectToDatabase();
		
		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return Response.json(
				{ error: "User with this email already exists" },
				{ status: 409 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create new user
		const user = new User({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: email.toLowerCase().trim(),
			password: hashedPassword,
			businessName: businessName.trim(),
			role: 'viewer', // Default role
			createdAt: new Date()
		});

		await user.save();

		return Response.json(
			{ 
				success: true, 
				message: "User registered successfully",
				user: {
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					businessName: user.businessName,
					role: user.role
				}
			},
			{ status: 201 }
		);

	} catch (error) {
		console.error("Registration error:", error);
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Handle other HTTP methods
export async function GET() {
	return Response.json(
		{ error: "Method not allowed" },
		{ status: 405 }
	);
}

export async function PUT() {
	return Response.json(
		{ error: "Method not allowed" },
		{ status: 405 }
	);
}

export async function DELETE() {
	return Response.json(
		{ error: "Method not allowed" },
		{ status: 405 }
	);
} 