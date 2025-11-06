import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

const AUTH_ERROR_CODES = {
  NO_USER: "NO_USER",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  GOOGLE_ACCOUNT: "GOOGLE_ACCOUNT",
  PASSWORD_SIGNIN_REQUIRED: "PASSWORD_SIGNIN_REQUIRED",
};

const googleProviderConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

const providers = [
  CredentialsProvider({
    async authorize(credentials) {
      const client = await connectToDatabase();
      try {
        const userCollection = client.db().collection("users");
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
        }

        const user = await userCollection.findOne({ email });

        if (!user) {
          throw new Error(AUTH_ERROR_CODES.NO_USER);
        }

        if (user.authProvider && user.authProvider !== "credentials") {
          throw new Error(AUTH_ERROR_CODES.GOOGLE_ACCOUNT);
        }

        if (!user.password) {
          throw new Error(AUTH_ERROR_CODES.GOOGLE_ACCOUNT);
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          throw new Error(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role ?? null,
          profileImage: user.profileImage ?? null,
          authProvider: user.authProvider ?? "credentials",
        };
      } finally {
        await client.close();
      }
    },
  }),
];

if (googleProviderConfigured) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  );
} else {
  console.warn(
    "Google OAuth credentials are not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google sign-in."
  );
}

// Define authentication options
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },

  providers,

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user?.email) {
        throw new Error(AUTH_ERROR_CODES.GOOGLE_ACCOUNT);
      }

      const normalisedEmail = user.email.toLowerCase();
      const client = await connectToDatabase();

      try {
        const db = client.db();
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({
          email: normalisedEmail,
        });

        if (existingUser) {
          if (existingUser.authProvider && existingUser.authProvider !== "google") {
            throw new Error(AUTH_ERROR_CODES.PASSWORD_SIGNIN_REQUIRED);
          }

          await usersCollection.updateOne(
            { _id: existingUser._id },
            {
              $set: {
                name: user.name ?? existingUser.name ?? "",
                profileImage: user.image ?? existingUser.profileImage ?? null,
                authProvider: "google",
                updatedAt: new Date(),
              },
            }
          );

          user.id = existingUser._id.toString();
          user.name = user.name ?? existingUser.name;
          user.email = existingUser.email;
          user.image = user.image ?? existingUser.profileImage;
          return true;
        }

        const insertResult = await usersCollection.insertOne({
          name: user.name ?? "",
          email: normalisedEmail,
          authProvider: "google",
          profileImage: user.image ?? null,
          password: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        user.id = insertResult.insertedId.toString();
        user.email = normalisedEmail;
        return true;
      } catch (error) {
        console.error("Google sign-in error:", error);
        throw error;
      } finally {
        await client.close();
      }
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.profileImage = token.profileImage ?? null;
        session.user.authProvider = token.authProvider ?? null;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.profileImage = user.profileImage ?? token.profileImage ?? null;
        token.authProvider = user.authProvider ?? token.authProvider ?? null;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      if (url === baseUrl) {
        return baseUrl;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
