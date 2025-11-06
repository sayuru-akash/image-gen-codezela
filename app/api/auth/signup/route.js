import { hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

const RESPONSES = {
  INVALID_INPUT: { status: 422, message: "Please provide a name, valid email, and matching passwords with at least 7 characters." },
  PASSWORD_MISMATCH: { status: 422, message: "Passwords do not match." },
  EXISTS_CREDENTIALS: {
    status: 422,
    message: "An account with this email already exists. Sign in using your password instead.",
  },
  EXISTS_GOOGLE: {
    status: 409,
    message: "This email is linked to Google sign-in. Continue with Google to access your workspace.",
  },
};

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, password, confirmPassword } = data;

    if (
      !name ||
      !email ||
      !email.includes("@") ||
      !password ||
      password.trim().length < 7 ||
      !confirmPassword ||
      confirmPassword.trim().length < 7
    ) {
      const { message, status } = RESPONSES.INVALID_INPUT;
      return NextResponse.json({ message }, { status });
    }

    if (password !== confirmPassword) {
      const { message, status } = RESPONSES.PASSWORD_MISMATCH;
      return NextResponse.json({ message }, { status });
    }

    const normalisedEmail = email.trim().toLowerCase();
    const client = await connectToDatabase();

    try {
      const db = client.db();

      const existingUser = await db.collection("users").findOne({
        email: normalisedEmail,
      });

      if (existingUser) {
        const response =
          existingUser.authProvider === "google"
            ? RESPONSES.EXISTS_GOOGLE
            : RESPONSES.EXISTS_CREDENTIALS;

        return NextResponse.json(
          { message: response.message },
          { status: response.status }
        );
      }

      const hashedPassword = await hashPassword(password);

      await db.collection("users").insertOne({
        name: name.trim(),
        email: normalisedEmail,
        password: hashedPassword,
        authProvider: "credentials",
        profileImage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json(
        {
          message: "Account created. Sign in to access your workspace.",
          email: normalisedEmail,
        },
        { status: 201 }
      );
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Unable to create account right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
