import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    // Admin login
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          return null;
        }

        if (email === adminEmail && password === adminPassword) {
          return {
            id: "admin",
            name: "Horizon Jobs Admin",
            email: adminEmail,
          };
        }

        return null;
      },
    }),

    // Google OAuth
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
    async signIn({ user, account }) {
      console.log("🔵 signIn called:", { email: user.email, provider: account?.provider });

      if (account?.provider === "google") {
        try {
          const { supabaseAdmin } = await import("@/lib/supabase/admin");

          // Check if user exists
          const { data: existing, error: findError } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", user.email!)
            .single();

          if (findError && findError.code !== "PGRST116") {
            console.error("❌ Error finding user:", findError);
            return false;
          }

          if (!existing) {
            // Create new user
            const { error: insertError } = await supabaseAdmin
              .from("users")
              .insert({
                email: user.email,
                name: user.name || "Google User",
                password_hash: "google_oauth",
                email_verified: true,
                is_active: true,
                created_at: new Date().toISOString(),
              });

            if (insertError) {
              console.error("❌ Error creating user:", insertError);
              return false;
            }
            console.log("✅ User created:", user.email);
          } else {
            console.log("✅ User exists:", user.email);
          }

          return true;
        } catch (error) {
          console.error("❌ Google sign-in error:", error);
          return false;
        }
      }

      return true;
    },

    async session({ session, token }) {
      console.log("🔵 session called:", { email: session.user?.email, tokenId: token.sub });

      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },

    async jwt({ token, account }) {
      console.log("🔵 jwt called:", { tokenSub: token.sub, hasAccount: !!account });

      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === "production",

  // Cookie settings
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
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