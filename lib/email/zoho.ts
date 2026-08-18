import "server-only";

const ZOHO_FROM_EMAIL = process.env.ZOHO_FROM_EMAIL || "";
const ZOHO_ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID || "";
const ZOHO_OAUTH_ACCESS_TOKEN = process.env.ZOHO_OAUTH_ACCESS_TOKEN || "";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

interface JobAlertEmail {
  to: string;
  name?: string;
  jobs: Array<{
    title: string;
    company: string;
    country: string;
    city: string;
    applyUrl: string;
  }>;
  frequency?: "daily" | "weekly";
}

export class ZohoMail {
  private static async sendRequest(endpoint: string, body: any) {
    const url = `https://mail.zoho.com/api/accounts/${ZOHO_ACCOUNT_ID}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Zoho-oauthtoken ${ZOHO_OAUTH_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Zoho Mail API error: ${error}`);
    }

    return response.json();
  }

  static async sendEmail(options: EmailOptions) {
    if (!ZOHO_FROM_EMAIL || !ZOHO_ACCOUNT_ID || !ZOHO_OAUTH_ACCESS_TOKEN) {
      console.warn("Zoho Mail not configured. Email would be sent to:", options.to);
      return { success: true, simulated: true };
    }

    const payload = {
      fromAddress: options.from || ZOHO_FROM_EMAIL,
      toAddress: options.to,
      subject: options.subject,
      content: options.html,
      replyToAddress: options.replyTo || ZOHO_FROM_EMAIL,
    };

    return this.sendRequest("send", payload);
  }

  static async sendBulkEmail(options: EmailOptions[]) {
    if (!ZOHO_FROM_EMAIL || !ZOHO_ACCOUNT_ID || !ZOHO_OAUTH_ACCESS_TOKEN) {
      console.warn("Zoho Mail not configured. Bulk emails would be sent.");
      return { success: true, simulated: true, count: options.length };
    }

    const results = [];
    for (const option of options) {
      const result = await this.sendEmail(option);
      results.push(result);
    }

    return { success: true, count: results.length, results };
  }

  static async sendJobAlert(alert: JobAlertEmail) {
    const jobsHtml = alert.jobs.map(job => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="margin: 0 0 5px 0; color: #1e293b;">
          ${job.title}
        </h3>
        <p style="margin: 0 0 5px 0; color: #475569;">
          ${job.company} • ${job.city}, ${job.country}
        </p>
        <a href="${job.applyUrl}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">
          View Opportunity →
        </a>
      </div>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
          .footer { border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #4f46e5;">Horizon Jobs</h1>
            <p style="margin: 0; color: #475569;">Your ${alert.frequency || "daily"} job alert</p>
          </div>

          <p>Hello${alert.name ? ` ${alert.name}` : ""},</p>

          <p>Here are the latest opportunities matching your preferences:</p>

          ${jobsHtml}

          <p style="margin-top: 25px;">
            <a href="https://horizonjobs.online" style="color: #4f46e5; text-decoration: none; font-weight: 600;">
              Browse All Jobs →
            </a>
          </p>

          <div class="footer">
            <p>
              You received this email because you subscribed to job alerts.
              <br>
              <a href="#" style="color: #4f46e5;">Unsubscribe</a>
            </p>
            <p>Horizon Jobs • Global Employment Intelligence</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = alert.jobs.map(job =>
      `${job.title} at ${job.company} - ${job.city}, ${job.country}\nView: ${job.applyUrl}`
    ).join("\n\n");

    return this.sendEmail({
      to: alert.to,
      subject: `Horizon Jobs: ${alert.jobs.length} new opportunity${alert.jobs.length > 1 ? "s" : ""}`,
      html,
      text,
    });
  }

  static async sendRecruiterOutreach(options: {
    to: string;
    name?: string;
    company?: string;
    customMessage?: string;
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
          .button { background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; }
          .footer { border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #4f46e5;">Horizon Jobs</h1>
            <p style="margin: 0; color: #475569;">Global Employment Intelligence</p>
          </div>

          <p>Hello${options.name ? ` ${options.name}` : ""},</p>

          <p>
            I hope this message finds you well. I'm reaching out from Horizon Jobs,
            a global job discovery platform connecting employers with top talent
            worldwide.
          </p>

          ${options.customMessage || `
            <p>
              We're currently expanding our recruiter network and would love
              to collaborate with ${options.company || "your organization"}.
            </p>
            <p>
              <strong>Why partner with Horizon Jobs?</strong>
              <br>
              • Access to global talent pool
              <br>
              • AI-powered job matching
              <br>
              • Automated job posting and distribution
              <br>
              • Real-time analytics and reporting
            </p>
          `}

          <p style="text-align: center; margin: 30px 0;">
            <a href="https://horizonjobs.online" class="button">
              Learn More
            </a>
          </p>

          <p>Looking forward to connecting!</p>

          <p>
            Best regards,<br>
            <strong>Horizon Jobs Team</strong>
          </p>

          <div class="footer">
            <p>
              Horizon Jobs • Global Employment Intelligence
              <br>
              <a href="#" style="color: #4f46e5;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hello${options.name ? ` ${options.name}` : ""},

      I hope this message finds you well. I'm reaching out from Horizon Jobs,
      a global job discovery platform connecting employers with top talent
      worldwide.

      ${options.customMessage || `
        We're currently expanding our recruiter network and would love
        to collaborate with ${options.company || "your organization"}.

        Why partner with Horizon Jobs?
        • Access to global talent pool
        • AI-powered job matching
        • Automated job posting and distribution
        • Real-time analytics and reporting
      `}

      Looking forward to connecting!

      Best regards,
      Horizon Jobs Team
    `;

    return this.sendEmail({
      to: options.to,
      subject: `Horizon Jobs - Let's Connect${options.company ? ` (${options.company})` : ""}`,
      html,
      text,
    });
  }

  static async sendNewsletter(options: {
    to: string[];
    subject: string;
    content: string;
    includeUnsubscribe?: boolean;
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
          .footer { border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #4f46e5;">Horizon Jobs</h1>
            <p style="margin: 0; color: #475569;">Weekly Newsletter</p>
          </div>

          ${options.content}

          ${options.includeUnsubscribe !== false ? `
            <div class="footer">
              <p>
                <a href="#" style="color: #4f46e5;">Unsubscribe</a>
              </p>
              <p>Horizon Jobs • Global Employment Intelligence</p>
            </div>
          ` : `
            <div class="footer">
              <p>Horizon Jobs • Global Employment Intelligence</p>
            </div>
          `}
        </div>
      </body>
      </html>
    `;

    const results = [];
    for (const email of options.to) {
      const result = await this.sendEmail({
        to: email,
        subject: options.subject,
        html,
      });
      results.push(result);
    }

    return { success: true, count: results.length, results };
  }
}