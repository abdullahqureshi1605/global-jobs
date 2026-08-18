import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password login
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          console.error(
            "ADMIN_EMAIL or ADMIN_PASSWORD is missing from .env.local"
          );
          return null;
        }

        if (
          email === adminEmail &&
          password === adminPassword
        ) {
          return {
            id: "admin",
            name: "Horizon Jobs Admin",
            email: adminEmail,
          };
        }

        return null;
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // If Google sign-in, check if user exists in database
      if (account?.provider === "google") {
        try {
          const { supabaseAdmin } = await import("@/lib/supabase/admin");
          const { UserAuth } = await import("@/lib/auth/user-auth");

          // Check if user exists
          const existingUser = await UserAuth.getUserByEmail(user.email!);

          if (!existingUser) {
            // Create new user from Google profile
            await supabaseAdmin.from("users").insert({
              email: user.email,
              name: user.name,
              password_hash: "google_oauth",
              email_verified: true,
              is_active: true,
              created_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/login",
  },
};

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }
}