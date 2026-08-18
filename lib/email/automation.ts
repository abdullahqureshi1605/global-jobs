import "server-only";
import { ZohoMail } from "./zoho";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface EmailPlan {
  id: string;
  type: "recruiter_outreach" | "job_alert" | "follow_up";
  recipient: {
    email: string;
    name?: string;
    company?: string;
  };
  subject: string;
  content: string;
  scheduledDate: string;
  priority: 1 | 2 | 3 | 4 | 5;
  status: "pending" | "approved" | "rejected" | "modified" | "sent";
  followUpCount: number;
  maxFollowUps: number;
}

export interface EmailList {
  id: string;
  name: string;
  source: "scraped" | "imported" | "subscribers";
  emails: string[];
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  createdAt: string;
}

export class EmailAutomation {
  static async extractEmailsFromUsers(): Promise<EmailList> {
    const [subscribers, leads, jobAlertSubscriptions] = await Promise.all([
      supabaseAdmin.from("job_alert_subscriptions").select("email, name, created_at"),
      supabaseAdmin.from("crm_leads").select("email, lead_name, company, created_at"),
      supabaseAdmin.from("job_alert_deliveries").select("subscription_id"),
    ]);

    const emailSet = new Map<string, { name?: string; company?: string; source: string; createdAt: string }>();

    for (const sub of subscribers.data || []) {
      if (sub.email && !emailSet.has(sub.email)) {
        emailSet.set(sub.email, {
          name: sub.name || undefined,
          company: undefined,
          source: "job_alert_subscriber",
          createdAt: sub.created_at,
        });
      }
    }

    for (const lead of leads.data || []) {
      if (lead.email && !emailSet.has(lead.email)) {
        emailSet.set(lead.email, {
          name: lead.lead_name || undefined,
          company: lead.company || undefined,
          source: "crm_lead",
          createdAt: lead.created_at,
        });
      }
    }

    const emails = Array.from(emailSet.keys());
    const total = emails.length;

    const { data: savedList, error } = await supabaseAdmin
      .from("email_lists")
      .insert({
        name: `Scraped Emails - ${new Date().toLocaleDateString()}`,
        source: "scraped",
        emails: emails,
        total: total,
        approved: 0,
        rejected: 0,
        pending: total,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save email list: ${error.message}`);
    }

    return {
      id: savedList.id,
      name: savedList.name,
      source: "scraped",
      emails: savedList.emails,
      total: savedList.total,
      approved: savedList.approved,
      rejected: savedList.rejected,
      pending: savedList.pending,
      createdAt: savedList.created_at,
    };
  }

  static async createEmailPlan(listId: string): Promise<EmailPlan[]> {
    const { data: list, error } = await supabaseAdmin
      .from("email_lists")
      .select("*")
      .eq("id", listId)
      .single();

    if (error || !list) {
      throw new Error("Email list not found");
    }

    const plans: EmailPlan[] = [];
    const emails = list.emails || [];
    const now = new Date();

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const daysToAdd = Math.floor(i / 10);
      const scheduledDate = new Date(now);
      scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);

      let type: "recruiter_outreach" | "job_alert" | "follow_up" = "job_alert";
      let subject = "Your Job Alert from Horizon Jobs";
      let content = "Here are the latest job opportunities matching your preferences.";

      const { data: lead } = await supabaseAdmin
        .from("crm_leads")
        .select("lead_name, company")
        .eq("email", email)
        .single();

      if (lead?.company) {
        type = "recruiter_outreach";
        subject = `Horizon Jobs - Let's Connect${lead.company ? ` (${lead.company})` : ""}`;
        content = `Hello${lead.lead_name ? ` ${lead.lead_name}` : ""},\n\nI'm reaching out from Horizon Jobs to discuss potential collaboration opportunities with ${lead.company || "your organization"}.\n\nWould you be interested in learning more about our recruiter network?`;
      }

      const plan: EmailPlan = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${i}`,
        type,
        recipient: {
          email: email,
          name: lead?.lead_name || undefined,
          company: lead?.company || undefined,
        },
        subject,
        content,
        scheduledDate: scheduledDate.toISOString(),
        priority: i < 10 ? 1 : i < 30 ? 2 : i < 60 ? 3 : 4,
        status: "pending",
        followUpCount: 0,
        maxFollowUps: type === "recruiter_outreach" ? 3 : 1,
      };

      plans.push(plan);
    }

    for (const plan of plans) {
      await supabaseAdmin.from("email_plans").insert({
        list_id: listId,
        type: plan.type,
        recipient_email: plan.recipient.email,
        recipient_name: plan.recipient.name,
        recipient_company: plan.recipient.company,
        subject: plan.subject,
        content: plan.content,
        scheduled_date: plan.scheduledDate,
        priority: plan.priority,
        status: plan.status,
        follow_up_count: plan.followUpCount,
        max_follow_ups: plan.maxFollowUps,
      });
    }

    return plans;
  }

  static async getPendingEmails(limit: number = 20): Promise<EmailPlan[]> {
    const { data, error } = await supabaseAdmin
      .from("email_plans")
      .select("*")
      .eq("status", "pending")
      .order("priority", { ascending: true })
      .order("scheduled_date", { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get pending emails: ${error.message}`);
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      type: item.type,
      recipient: {
        email: item.recipient_email,
        name: item.recipient_name,
        company: item.recipient_company,
      },
      subject: item.subject,
      content: item.content,
      scheduledDate: item.scheduled_date,
      priority: item.priority,
      status: item.status,
      followUpCount: item.follow_up_count,
      maxFollowUps: item.max_follow_ups,
    }));
  }

  static async approveEmail(planId: string): Promise<EmailPlan> {
    const { data, error } = await supabaseAdmin
      .from("email_plans")
      .update({ status: "approved" })
      .eq("id", planId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve email: ${error.message}`);
    }

    return {
      id: data.id,
      type: data.type,
      recipient: {
        email: data.recipient_email,
        name: data.recipient_name,
        company: data.recipient_company,
      },
      subject: data.subject,
      content: data.content,
      scheduledDate: data.scheduled_date,
      priority: data.priority,
      status: data.status,
      followUpCount: data.follow_up_count,
      maxFollowUps: data.max_follow_ups,
    };
  }

  static async rejectEmail(planId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("email_plans")
      .update({ status: "rejected" })
      .eq("id", planId);

    if (error) {
      throw new Error(`Failed to reject email: ${error.message}`);
    }
  }

  static async modifyEmail(planId: string, updates: Partial<EmailPlan>): Promise<EmailPlan> {
    const updateData: any = {
      status: "pending",
    };

    if (updates.subject) updateData.subject = updates.subject;
    if (updates.content) updateData.content = updates.content;
    if (updates.scheduledDate) updateData.scheduled_date = updates.scheduledDate;
    if (updates.priority) updateData.priority = updates.priority;

    const { data, error } = await supabaseAdmin
      .from("email_plans")
      .update(updateData)
      .eq("id", planId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to modify email: ${error.message}`);
    }

    return {
      id: data.id,
      type: data.type,
      recipient: {
        email: data.recipient_email,
        name: data.recipient_name,
        company: data.recipient_company,
      },
      subject: data.subject,
      content: data.content,
      scheduledDate: data.scheduled_date,
      priority: data.priority,
      status: data.status,
      followUpCount: data.follow_up_count,
      maxFollowUps: data.max_follow_ups,
    };
  }

  static async approveAllEmails(listId: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from("email_plans")
      .update({ status: "approved" })
      .eq("list_id", listId)
      .eq("status", "pending")
      .select("id");

    if (error) {
      throw new Error(`Failed to approve all emails: ${error.message}`);
    }

    await supabaseAdmin
      .from("email_lists")
      .update({
        approved: data?.length || 0,
        pending: 0,
      })
      .eq("id", listId);

    return data?.length || 0;
  }

  static async rejectAllEmails(listId: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from("email_plans")
      .update({ status: "rejected" })
      .eq("list_id", listId)
      .eq("status", "pending")
      .select("id");

    if (error) {
      throw new Error(`Failed to reject all emails: ${error.message}`);
    }

    await supabaseAdmin
      .from("email_lists")
      .update({
        rejected: data?.length || 0,
        pending: 0,
      })
      .eq("id", listId);

    return data?.length || 0;
  }

  static async sendApprovedEmails(limit: number = 10): Promise<{ sent: number; failed: number }> {
    const { data, error } = await supabaseAdmin
      .from("email_plans")
      .select("*")
      .eq("status", "approved")
      .order("scheduled_date", { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get approved emails: ${error.message}`);
    }

    let sent = 0;
    let failed = 0;

    for (const plan of data || []) {
      try {
        await ZohoMail.sendEmail({
          to: plan.recipient_email,
          subject: plan.subject,
          html: plan.content.replace(/\n/g, "<br>"),
          text: plan.content,
        });

        await supabaseAdmin
          .from("email_plans")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", plan.id);

        sent++;

        if (plan.type === "recruiter_outreach" && plan.follow_up_count < plan.max_follow_ups) {
          const daysToAdd = plan.follow_up_count === 0 ? 3 : 7;
          const followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + daysToAdd);

          await supabaseAdmin.from("email_plans").insert({
            list_id: plan.list_id,
            type: "follow_up",
            recipient_email: plan.recipient_email,
            recipient_name: plan.recipient_name,
            recipient_company: plan.recipient_company,
            subject: `Following up: ${plan.subject}`,
            content: `Hi${plan.recipient_name ? ` ${plan.recipient_name}` : ""},\n\nFollowing up on my previous message about Horizon Jobs.\n\nWould you be available for a quick chat?\n\nBest regards,\nHorizon Jobs Team`,
            scheduled_date: followUpDate.toISOString(),
            priority: plan.priority,
            status: "pending",
            follow_up_count: plan.follow_up_count + 1,
            max_follow_ups: plan.max_follow_ups,
          });
        }

      } catch (err) {
        console.error(`Failed to send email to ${plan.recipient_email}:`, err);
        failed++;
      }
    }

    return { sent, failed };
  }

  static async getEmailLists(): Promise<EmailList[]> {
    const { data, error } = await supabaseAdmin
      .from("email_lists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get email lists: ${error.message}`);
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      source: item.source,
      emails: item.emails || [],
      total: item.total,
      approved: item.approved,
      rejected: item.rejected,
      pending: item.pending,
      createdAt: item.created_at,
    }));
  }
}