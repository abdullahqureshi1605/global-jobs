import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();

function getSupabaseAuthClient() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase public authentication configuration is missing.");
  }

  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function findSupabaseUserByEmail(email: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (
    data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    ) ?? null
  );
}

async function resolveRole(userId: string): Promise<"admin" | "recruiter" | "candidate"> {
  const supabase = getSupabaseAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.is_admin === true) {
    return "admin";
  }

  const { data: membership } = await supabase
    .from("company_members")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "recruiter"])
    .limit(1)
    .maybeSingle();

  if (membership?.role === "admin") {
    return "admin";
  }

  if (membership?.role === "recruiter") {
    return "recruiter";
  }

  return "candidate";
}

async function ensureProfile(
  userId: string,
  email: string,
  name: string | null | undefined
) {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id,full_name")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    if (
      name &&
      name.trim() &&
      name.trim() !== existing.full_name
    ) {
      await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    return;
  }

  const { error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      full_name: name?.trim() || email,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
        accountType: {
          label: "Account type",
          type: "text",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        const accountType =
          typeof credentials?.accountType === "string"
            ? credentials.accountType
            : "candidate";

        if (!email || !password) {
          return null;
        }

        const supabase = getSupabaseAuthClient();

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error || !data.user) {
          return null;
        }

        const role = await resolveRole(data.user.id);

        if (
          accountType === "recruiter" &&
          role !== "recruiter" &&
          role !== "admin"
        ) {
          throw new Error(
            "This email is registered as a candidate. Please use a different email for a recruiter account."
          );
        }

        if (
          accountType === "candidate" &&
          (role === "recruiter" || role === "admin")
        ) {
          throw new Error(
            "This email is registered as a recruiter. Please use Recruiter Sign In."
          );
        }

        await ensureProfile(
          data.user.id,
          email,
          typeof data.user.user_metadata?.full_name === "string"
            ? data.user.user_metadata.full_name
            : null
        );

        return {
          id: data.user.id,
          email,
          name:
            typeof data.user.user_metadata?.full_name === "string"
              ? data.user.user_metadata.full_name
              : email,
          role,
        };
      },
    }),

    ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      const email = user.email.trim().toLowerCase();

      let supabaseUser = await findSupabaseUserByEmail(email);

      if (!supabaseUser) {
        const supabase = getSupabaseAdmin();

        const { data, error } =
          await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              full_name: user.name ?? email,
            },
          });

        if (error || !data.user) {
          throw new Error(
            error?.message || "Unable to create authentication account."
          );
        }

        supabaseUser = data.user;
      }

      const role = await resolveRole(supabaseUser.id);

      if (account?.provider === "google") {
        if (role === "recruiter" || role === "admin") {
          return "/login?error=RecruiterAccount";
        }

        await ensureProfile(
          supabaseUser.id,
          email,
          user.name
        );
      } else {
        await ensureProfile(
          supabaseUser.id,
          email,
          user.name
        );
      }

      user.id = supabaseUser.id;
      user.role = role;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "candidate";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role =
          typeof token.role === "string"
            ? token.role
            : "candidate";
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
