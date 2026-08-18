import "server-only";

export interface AiDecision {
  actionType: string;
  title: string;
  description: string;
  rationale: string;
  confidence: number;
  requiresApproval: boolean;
  payload: Record<string, unknown>;
}

export async function analyzeOpsEvent(
  event: {
    event_type: string;
    entity_type: string;
    entity_id?: string | null;
    payload: Record<string, unknown>;
  }
): Promise<AiDecision[]> {
  // FREE AI: Rule-based intelligence without OpenAI
  const decisions: AiDecision[] = [];

  // 1. Job Created Event
  if (event.event_type === "job.created" || event.event_type === "job.published") {
    const jobTitle = String(event.payload?.title || "New job");
    const company = String(event.payload?.company || "Unknown company");
    const country = String(event.payload?.country || "");
    const category = String(event.payload?.category || "");

    decisions.push({
      actionType: "REVIEW_JOB",
      title: `Review new job: ${jobTitle}`,
      description: `A new job was posted by ${company}${country ? ` in ${country}` : ""}${category ? ` for ${category}` : ""}`,
      rationale: "New jobs should be reviewed before social promotion",
      confidence: 85,
      requiresApproval: false,
      payload: {
        job_title: jobTitle,
        company: company,
        country: country,
        category: category,
      },
    });

    // Auto-create social post suggestion
    decisions.push({
      actionType: "PREPARE_SOCIAL_PROMOTION",
      title: `Prepare social post for ${jobTitle}`,
      description: `Create social media content to promote this job opportunity`,
      rationale: "Regular social promotion increases visibility",
      confidence: 75,
      requiresApproval: true,
      payload: {
        job_title: jobTitle,
        company: company,
        country: country,
      },
    });

    // Check if job should trigger job alerts
    decisions.push({
      actionType: "MATCH_JOB_ALERTS",
      title: `Match job alerts for ${jobTitle}`,
      description: "Check if any subscribers should receive this job",
      rationale: "Job alerts keep subscribers engaged",
      confidence: 90,
      requiresApproval: false,
      payload: {
        job_id: event.entity_id,
        title: jobTitle,
        company: company,
        country: country,
        category: category,
      },
    });
  }

  // 2. Lead Created Event
  if (event.event_type === "lead.created" || event.event_type.includes("lead")) {
    const leadName = String(event.payload?.lead_name || event.payload?.name || "New lead");
    const company = String(event.payload?.company || "");

    decisions.push({
      actionType: "FOLLOW_UP_LEAD",
      title: `Follow up with ${leadName}`,
      description: `New lead${company ? ` from ${company}` : ""} needs follow-up`,
      rationale: "Quick follow-up increases conversion rate",
      confidence: 80,
      requiresApproval: true,
      payload: {
        lead_name: leadName,
        company: company,
      },
    });
  }

  // 3. Job Report Event
  if (event.event_type === "job.reported") {
    decisions.push({
      actionType: "REVIEW_REPORT",
      title: "Review reported job",
      description: "A job has been reported and needs review",
      rationale: "Reported jobs must be reviewed quickly",
      confidence: 95,
      requiresApproval: true,
      payload: {
        report_id: event.entity_id,
      },
    });
  }

  // 4. Task Event
  if (event.event_type === "crm.task_created" || event.event_type.includes("task")) {
    const taskTitle = String(event.payload?.title || "New task");

    decisions.push({
      actionType: "PRIORITIZE_TASK",
      title: `Prioritize task: ${taskTitle}`,
      description: "New task created. Priority needs to be set.",
      rationale: "Task prioritization improves workflow",
      confidence: 70,
      requiresApproval: false,
      payload: {
        task_title: taskTitle,
      },
    });
  }

  // 5. Deal Event
  if (event.event_type === "deal.won" || event.event_type.includes("deal")) {
    const dealName = String(event.payload?.deal_name || event.payload?.name || "Deal");

    decisions.push({
      actionType: "CELEBRATE_DEAL",
      title: `Deal won: ${dealName}`,
      description: "A deal has been won. Celebrate and review next steps.",
      rationale: "Winning deals should be recognized and analyzed",
      confidence: 90,
      requiresApproval: false,
      payload: {
        deal_name: dealName,
      },
    });
  }

  // 6. Default - Basic Recommendation
  if (decisions.length === 0) {
    decisions.push({
      actionType: "REVIEW",
      title: `Review event: ${event.event_type}`,
      description: `New event of type ${event.event_type} for ${event.entity_type}`,
      rationale: "Standard review for unclassified events",
      confidence: 50,
      requiresApproval: true,
      payload: {
        event_type: event.event_type,
        entity_type: event.entity_type,
      },
    });
  }

  return decisions;
}