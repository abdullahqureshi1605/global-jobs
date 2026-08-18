import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  email_verified: boolean;
  is_active: boolean;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
}

export class UserAuth {
  // ============================================
  // SIGNUP
  // ============================================
  static async signup(email: string, password: string, name?: string): Promise<User> {
    const existing = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing.data) {
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        name: name || null,
        verification_token: verificationToken,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Signup failed: ${error.message}`);
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      created_at: data.created_at,
      email_verified: data.email_verified,
      is_active: data.is_active,
    };
  }

  // ============================================
  // LOGIN
  // ============================================
  static async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      throw new Error("Invalid email or password");
    }

    if (!data.is_active) {
      throw new Error("Account is deactivated");
    }

    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    await supabaseAdmin
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", data.id);

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      created_at: data.created_at,
      email_verified: data.email_verified,
      is_active: data.is_active,
    };
  }

  // ============================================
  // GET USER BY ID
  // ============================================
  static async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, created_at, email_verified, is_active")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      created_at: data.created_at,
      email_verified: data.email_verified,
      is_active: data.is_active,
    };
  }

  // ============================================
  // GET USER BY EMAIL
  // ============================================
  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, created_at, email_verified, is_active")
      .eq("email", email)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      created_at: data.created_at,
      email_verified: data.email_verified,
      is_active: data.is_active,
    };
  }

  // ============================================
  // SAVE JOB
  // ============================================
  static async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    const { data, error } = await supabaseAdmin
      .from("saved_jobs")
      .insert({
        user_id: userId,
        job_id: jobId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save job: ${error.message}`);
    }

    return {
      id: data.id,
      user_id: data.user_id,
      job_id: data.job_id,
      created_at: data.created_at,
    };
  }

  // ============================================
  // UNSAVE JOB
  // ============================================
  static async unsaveJob(userId: string, jobId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("saved_jobs")
      .delete()
      .eq("user_id", userId)
      .eq("job_id", jobId);

    if (error) {
      throw new Error(`Failed to unsave job: ${error.message}`);
    }
  }

  // ============================================
  // GET SAVED JOBS
  // ============================================
  static async getSavedJobs(userId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to get saved jobs: ${error.message}`);
    }

    return data.map((item: any) => item.job_id);
  }

  // ============================================
  // CHECK IF JOB IS SAVED
  // ============================================
  static async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("saved_jobs")
      .select("id")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .single();

    return !!data && !error;
  }

  // ============================================
  // CREATE JOB ALERT
  // ============================================
  static async createJobAlert(
    userId: string,
    email: string,
    options: {
      name?: string;
      countries?: string[];
      cities?: string[];
      categories?: string[];
      frequency?: "daily" | "weekly";
    }
  ) {
    const { data, error } = await supabaseAdmin
      .from("job_alerts")
      .insert({
        user_id: userId,
        email,
        name: options.name || null,
        countries: options.countries || [],
        cities: options.cities || [],
        categories: options.categories || [],
        frequency: options.frequency || "daily",
        active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job alert: ${error.message}`);
    }

    return data;
  }

  // ============================================
  // GET JOB ALERTS
  // ============================================
  static async getJobAlerts(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("job_alerts")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true);

    if (error) {
      throw new Error(`Failed to get job alerts: ${error.message}`);
    }

    return data;
  }

  // ============================================
  // UPDATE JOB ALERT
  // ============================================
  static async updateJobAlert(alertId: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from("job_alerts")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update job alert: ${error.message}`);
    }

    return data;
  }

  // ============================================
  // DELETE JOB ALERT
  // ============================================
  static async deleteJobAlert(alertId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("job_alerts")
      .delete()
      .eq("id", alertId);

    if (error) {
      throw new Error(`Failed to delete job alert: ${error.message}`);
    }
  }
}