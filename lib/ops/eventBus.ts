  import "server-only";

  import { supabaseAdmin } from "@/lib/supabase/admin";

  export interface OpsEventInput {
    eventType: string;
    entityType: string;
    entityId?: string | null;
    source?: string;
    actorType?: string;
    actorId?: string | null;
    payload?: Record<string, unknown>;
    dedupeKey?: string | null;
  }

  export async function recordOpsEvent(
    input: OpsEventInput
  ) {
    const { data, error } =
      await supabaseAdmin
        .from("ops_events")
        .insert({
          event_type:
            input.eventType,
          entity_type:
            input.entityType,
          entity_id:
            input.entityId ?? null,
          source:
            input.source ??
            "application",
          actor_type:
            input.actorType ??
            "system",
          actor_id:
            input.actorId ??
            null,
          payload:
            input.payload ??
            {},
          dedupe_key:
            input.dedupeKey ??
            null,
        })
        .select()
        .single();

    if (error) {
      throw new Error(
        `Failed to record ops event: ${error.message}`
      );
    }

    return data;
  }