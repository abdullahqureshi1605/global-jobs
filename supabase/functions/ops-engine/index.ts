// @ts-nocheck
import {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@2";

interface WebhookPayload {
  type:
    | "INSERT"
    | "UPDATE"
    | "DELETE";

  table: string;

  schema: string;

  record:
    | Record<string, unknown>
    | null;

  old_record:
    | Record<string, unknown>
    | null;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  actions: unknown;
}

interface OpsEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  payload:
    | Record<string, unknown>
    | null;
  status: string;
}

interface JobAlertSubscription {
  id: string;
  email: string;
  name: string | null;
  countries: string[] | null;
  cities: string[] | null;
  categories: string[] | null;
  remote_only: boolean;
  frequency: "daily" | "weekly";
  active: boolean;
}

const supabaseUrl =
  Deno.env.get(
    "SUPABASE_URL"
  ) ?? "";

const serviceRoleKey =
  Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY"
  ) ?? "";

const opsSecret =
  Deno.env.get(
    "OPS_ENGINE_SECRET"
  ) ?? "";

if (
  !supabaseUrl ||
  !serviceRoleKey
) {
  throw new Error(
    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing."
  );
}

const supabase:
  SupabaseClient =
  createClient(
    supabaseUrl,
    serviceRoleKey
  );

Deno.serve(
  async (
    request: Request
  ): Promise<Response> => {
    try {
      const incomingSecret =
        request.headers.get(
          "x-ops-engine-secret"
        );

      if (
        !opsSecret ||
        incomingSecret !==
          opsSecret
      ) {
        return json(
          {
            error:
              "Unauthorized",
          },
          401
        );
      }

      const webhook =
        (await request.json()) as WebhookPayload;

      if (
        webhook.table !==
        "ops_events"
      ) {
        return json({
          success: true,
          ignored: true,
        });
      }

      if (
        webhook.type !==
        "INSERT"
      ) {
        return json({
          success: true,
          ignored: true,
          reason:
            "Only INSERT events are processed.",
        });
      }

      const eventId =
        String(
          webhook.record?.id ??
            ""
        );

      if (!eventId) {
        return json(
          {
            error:
              "Missing event ID.",
          },
          400
        );
      }

      const {
        data: eventData,
        error: eventError,
      } = await supabase
        .from("ops_events")
        .select(
          "id,event_type,entity_type,entity_id,payload,status"
        )
        .eq(
          "id",
          eventId
        )
        .single();

      if (
        eventError ||
        !eventData
      ) {
        throw new Error(
          eventError?.message ??
            "Ops event not found."
        );
      }

      const event =
        eventData as OpsEvent;

      if (
        event.status ===
        "processed"
      ) {
        return json({
          success: true,
          skipped: true,
          reason:
            "Event already processed.",
        });
      }

      await supabase
        .from("ops_events")
        .update({
          status:
            "processing",
        })
        .eq(
          "id",
          event.id
        );

      const rules =
        await getAutomationRules(
          event.event_type
        );

      const runIds: string[] =
        [];

      for (
        const rule of rules
      ) {
        const runId =
          await createRun(
            event,
            rule
          );

        runIds.push(runId);

        await executeActions(
          event,
          rule,
          runId
        );

        await supabase
          .from(
            "ops_automation_runs"
          )
          .update({
            status:
              "completed",
            finished_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            runId
          );
      }

      await supabase
        .from("ops_events")
        .update({
          status:
            "processed",
          processed_at:
            new Date().toISOString(),
          error_message:
            null,
        })
        .eq(
          "id",
          event.id
        );

      await supabase
        .from(
          "ops_audit_log"
        )
        .insert({
          actor_type:
            "automation",
          action:
            "ops_event_processed",
          entity_type:
            event.entity_type,
          entity_id:
            event.entity_id,
          metadata: {
            event_id:
              event.id,
            event_type:
              event.event_type,
            run_ids:
              runIds,
          },
        });

      return json({
        success: true,
        eventId:
          event.id,
        runIds,
      });
    } catch (error) {
      console.error(
        "ops-engine error:",
        error
      );

      return json(
        {
          error:
            error instanceof
            Error
              ? error.message
              : "Ops engine failed.",
        },
        500
      );
    }
  }
);

async function getAutomationRules(
  triggerType: string
): Promise<
  AutomationRule[]
> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "ops_automation_rules"
    )
    .select(
      "id,name,trigger_type,actions"
    )
    .eq(
      "trigger_type",
      triggerType
    )
    .eq(
      "enabled",
      true
    );

  if (error) {
    throw new Error(
      `Failed to load automation rules: ${error.message}`
    );
  }

  return (
    (data ??
      []) as AutomationRule[]
  );
}

async function createRun(
  event: OpsEvent,
  rule: AutomationRule
): Promise<string> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "ops_automation_runs"
    )
    .insert({
      event_id:
        event.id,
      rule_id:
        rule.id,
      status:
        "running",
      result: {},
    })
    .select("id")
    .single();

  if (
    error ||
    !data
  ) {
    throw new Error(
      error?.message ??
        "Unable to create automation run."
    );
  }

  return String(
    data.id
  );
}

async function executeActions(
  event: OpsEvent,
  rule: AutomationRule,
  runId: string
) {
  const actions =
    Array.isArray(
      rule.actions
    )
      ? rule.actions
      : [];

  for (
    const action of actions
  ) {
    if (
      !isRecord(action)
    ) {
      continue;
    }

    const type =
      String(
        action.type ??
          ""
      );

    if (
      type ===
      "CREATE_ACTIVITY"
    ) {
      await supabase
        .from(
          "ops_audit_log"
        )
        .insert({
          actor_type:
            "automation",
          action:
            "activity_created",
          entity_type:
            event.entity_type,
          entity_id:
            event.entity_id,
          metadata: {
            event_id:
              event.id,
            title:
              String(
                action.title ??
                  "Automation activity"
              ),
          },
        });
    }

    if (
      type ===
      "PREPARE_SOCIAL_PROMOTION"
    ) {
      await createApprovalAction(
        event,
        runId,
        "PREPARE_SOCIAL_PROMOTION",
        "Prepare social promotion",
        "Prepare social content for the newly published job.",
        85,
        {
          job_id:
            event.entity_id,
        }
      );
    }

    if (
      type ===
      "MATCH_JOB_ALERTS"
    ) {
      await matchJobAlerts(
        event
      );
    }
  }
}

async function createApprovalAction(
  event: OpsEvent,
  runId: string,
  actionType: string,
  title: string,
  description: string,
  confidence: number,
  payload: Record<
    string,
    unknown
  >
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "ops_ai_actions"
    )
    .insert({
      event_id:
        event.id,
      automation_run_id:
        runId,
      action_type:
        actionType,
      title,
      description,
      rationale:
        "Suggested automatically by the Horizon Jobs operations engine.",
      payload,
      status:
        "suggested",
      confidence,
    })
    .select("id")
    .single();

  if (
    error ||
    !data
  ) {
    throw new Error(
      error?.message ??
        "Unable to create AI action."
    );
  }

  await supabase
    .from(
      "ops_approvals"
    )
    .insert({
      action_id:
        data.id,
      status:
        "pending",
    });
}

async function matchJobAlerts(
  event: OpsEvent
) {
  if (
    event.entity_type !==
    "job"
  ) {
    return;
  }

  const job =
    event.payload ??
    {};

  const {
    data,
    error,
  } = await supabase
    .from(
      "job_alert_subscriptions"
    )
    .select(
      "id,email,name,countries,cities,categories,remote_only,frequency,active"
    )
    .eq(
      "active",
      true
    );

  if (error) {
    throw new Error(
      `Unable to load job alert subscriptions: ${error.message}`
    );
  }

  const subscriptions =
    (data ??
      []) as JobAlertSubscription[];

  for (
    const subscription of subscriptions
  ) {
    if (
      !matchesSubscription(
        subscription,
        job
      )
    ) {
      continue;
    }

    const title =
      String(
        job.title ??
          "New job opportunity"
      );

    const country =
      String(
        job.country ??
          ""
      );

    const city =
      String(
        job.city ??
          ""
      );

    const category =
      String(
        job.category ??
          ""
      );

    const applyUrl =
      String(
        job.apply_url ??
          ""
      );

    const isRemote =
      String(
        job.workplace_type ??
          ""
      ).toLowerCase() ===
      "remote";

    if (
      subscription.remote_only &&
      !isRemote
    ) {
      continue;
    }

    const subject =
      `New ${category || "job"} opportunity${city ? ` in ${city}` : country ? ` in ${country}` : ""}`;

    const textBody = [
      "Horizon Jobs",
      "",
      title,
      [
        city,
        country,
      ]
        .filter(Boolean)
        .join(" • "),
      "",
      applyUrl
        ? `View opportunity: ${applyUrl}`
        : "View opportunity on Horizon Jobs.",
    ].join("\n");

    const htmlBody =
      buildJobAlertHtml(
        title,
        country,
        city,
        applyUrl
      );

    const {
      data: email,
      error:
        emailError,
    } = await supabase
      .from(
        "ops_email_outbox"
      )
      .insert({
        to_email:
          subscription.email,
        to_name:
          subscription.name ??
          null,
        subject,
        html_body:
          htmlBody,
        text_body:
          textBody,
        email_type:
          "job_alert",
        source_type:
          "job",
        source_id:
          event.entity_id,
        scheduled_for:
          new Date().toISOString(),
        status:
          "queued",
      })
      .select("id")
      .single();

    if (
      emailError ||
      !email
    ) {
      throw new Error(
        emailError?.message ??
          "Unable to queue job alert."
      );
    }

    await supabase
      .from(
        "job_alert_deliveries"
      )
      .insert({
        subscription_id:
          subscription.id,
        window_start:
          new Date().toISOString(),
        window_end:
          new Date().toISOString(),
        jobs_count:
          1,
        status:
          "queued",
        email_outbox_id:
          email.id,
      });
  }
}

function matchesSubscription(
  subscription: JobAlertSubscription,
  job: Record<
    string,
    unknown
  >
): boolean {
  const countries =
    normalizeArray(
      subscription.countries
    );

  const cities =
    normalizeArray(
      subscription.cities
    );

  const categories =
    normalizeArray(
      subscription.categories
    );

  const country =
    normalizeText(
      job.country
    );

  const city =
    normalizeText(
      job.city
    );

  const category =
    normalizeText(
      job.category
    );

  const countryMatch =
    countries.length ===
      0 ||
    countries.includes(
      country
    );

  const cityMatch =
    cities.length ===
      0 ||
    cities.includes(
      city
    );

  const categoryMatch =
    categories.length ===
      0 ||
    categories.includes(
      category
    );

  return (
    countryMatch &&
    cityMatch &&
    categoryMatch
  );
}

function normalizeArray(
  value:
    | string[]
    | null
    | undefined
): string[] {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value
    .map(
      (
        item: string
      ) =>
        normalizeText(
          item
        )
    )
    .filter(
      Boolean
    );
}

function normalizeText(
  value: unknown
): string {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();
}

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function buildJobAlertHtml(
  title: string,
  country: string,
  city: string,
  applyUrl: string
): string {
  const safeTitle =
    escapeHtml(
      title
    );

  const safeLocation =
    escapeHtml(
      [city, country]
        .filter(Boolean)
        .join(" • ")
    );

  const safeUrl =
    escapeAttribute(
      applyUrl
    );

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Horizon Jobs</h2>
      <h3>${safeTitle}</h3>
      <p>${safeLocation}</p>
      ${
        safeUrl
          ? `<p><a href="${safeUrl}">View opportunity</a></p>`
          : ""
      }
    </div>
  `;
}

function escapeHtml(
  value: string
): string {
  return value
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function escapeAttribute(
  value: string
): string {
  return value.replace(
    /["<>]/g,
    ""
  );
}

function json(
  body: Record<
    string,
    unknown
  >,
  status = 200
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );
}