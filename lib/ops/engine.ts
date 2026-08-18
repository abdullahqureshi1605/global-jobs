import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  analyzeOpsEvent,
} from "@/lib/ops/ai";

export async function processOpsEvent(
  eventId: string
) {
  const {
    data: event,
    error: eventError,
  } = await supabaseAdmin
    .from("ops_events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new Error(
      eventError?.message ??
        "Ops event not found."
    );
  }

  if (
    event.status ===
    "processed"
  ) {
    return {
      skipped: true,
      reason:
        "Already processed.",
    };
  }

  await supabaseAdmin
    .from("ops_events")
    .update({
      status: "processing",
    })
    .eq("id", eventId);

  const {
    data: rules,
  } = await supabaseAdmin
    .from(
      "ops_automation_rules"
    )
    .select("*")
    .eq(
      "trigger_type",
      event.event_type
    )
    .eq("enabled", true);

  const runs: string[] =
    [];

  try {
    for (
      const rule of
      rules ?? []
    ) {
      const {
        data: run,
        error: runError,
      } = await supabaseAdmin
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
        })
        .select()
        .single();

      if (runError || !run) {
        throw new Error(
          runError?.message ??
            "Failed to create automation run."
        );
      }

      runs.push(run.id);

      const { error: finishError } =
        await supabaseAdmin
          .from(
            "ops_automation_runs"
          )
          .update({
            status:
              "completed",
            result: {
              rule:
                rule.name,
              actions:
                rule.actions,
            },
            finished_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            run.id
          );

      if (finishError) {
        throw new Error(
          finishError.message
        );
      }
    }

    const aiActions =
      await analyzeOpsEvent(
        {
          event_type:
            event.event_type,

          entity_type:
            event.entity_type,

          entity_id:
            event.entity_id,

          payload:
            event.payload ??
            {},
        }
      );

    for (
      const action of
      aiActions
    ) {
      const {
        data: createdAction,
        error:
          actionError,
      } =
        await supabaseAdmin
          .from(
            "ops_ai_actions"
          )
          .insert({
            event_id:
              event.id,

            automation_run_id:
              runs.at(0) ??
              null,

            action_type:
              action.actionType,

            title:
              action.title,

            description:
              action.description,

            rationale:
              action.rationale,

            payload:
              action.payload,

            confidence:
              action.confidence,

            status:
              action.requiresApproval
                ? "suggested"
                : "approved",
          })
          .select()
          .single();

      if (
        actionError ||
        !createdAction
      ) {
        throw new Error(
          actionError?.message ??
            "Failed to save AI action."
        );
      }

      if (
        action.requiresApproval
      ) {
        await supabaseAdmin
          .from(
            "ops_approvals"
          )
          .insert({
            action_id:
              createdAction.id,
            status:
              "pending",
          });
      }
    }

    await supabaseAdmin
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

    await supabaseAdmin
      .from(
        "ops_audit_log"
      )
      .insert({
        actor_type:
          "automation",
        actor_id:
          null,
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
          runs,
        },
      });

    return {
      processed: true,
      eventId:
        event.id,
      runs,
      aiActions:
        aiActions.length,
    };
  } catch (error) {
    const message =
      error instanceof
      Error
        ? error.message
        : "Unknown automation error.";

    await supabaseAdmin
      .from("ops_events")
      .update({
        status:
          "failed",
        error_message:
          message,
      })
      .eq(
        "id",
        event.id
      );

    throw error;
  }
}