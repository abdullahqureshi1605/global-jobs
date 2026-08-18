import "server-only";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY,
});

const MODEL =
  process.env.OPENAI_MODEL ??
  "gpt-5.6";

export interface AiDecision {
  actionType: string;
  title: string;
  description: string;
  rationale: string;
  confidence: number;
  requiresApproval: boolean;
  payload: Record<
    string,
    unknown
  >;
}

export async function analyzeOpsEvent(
  event: {
    event_type: string;
    entity_type: string;
    entity_id?: string | null;
    payload: Record<
      string,
      unknown
    >;
  }
): Promise<AiDecision[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [];
  }

  const prompt = `
You are the operational AI for Horizon Jobs.

Your job is NOT to invent work.
Your job is to analyze the supplied business event
and suggest useful operational actions.

Business:
Horizon Jobs is a global employment intelligence platform.

Rules:
- Never invent facts.
- Prefer small, reversible actions.
- External communications require approval.
- Financial changes require approval.
- Publication requires approval.
- Internal organization tasks can be suggested automatically.
- Return ONLY valid JSON.
- confidence must be 0-100.

Event:
${JSON.stringify(
  event,
  null,
  2
)}

Return:
{
  "actions": [
    {
      "actionType": "string",
      "title": "string",
      "description": "string",
      "rationale": "string",
      "confidence": 0,
      "requiresApproval": true,
      "payload": {}
    }
  ]
}
`;

  const response =
    await openai.responses.create(
      {
        model: MODEL,
        store: false,
        input: prompt,
      }
    );

  const text =
    response.output_text
      ?.trim();

  if (!text) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(text);

    if (
      !Array.isArray(
        parsed?.actions
      )
    ) {
      return [];
    }

    return parsed.actions.map(
      (action: any) => ({
        actionType:
          String(
            action.actionType ??
              "REVIEW"
          ),

        title:
          String(
            action.title ??
              "AI recommendation"
          ),

        description:
          String(
            action.description ??
              ""
          ),

        rationale:
          String(
            action.rationale ??
              ""
          ),

        confidence: Math.max(
          0,
          Math.min(
            100,
            Number(
              action.confidence
            ) || 0
          )
        ),

        requiresApproval:
          Boolean(
            action.requiresApproval ??
              true
          ),

        payload:
          action.payload &&
          typeof action.payload ===
            "object"
            ? action.payload
            : {},
      })
    );
  } catch {
    return [];
  }
}