export type EventPayload = Record<string, unknown>;

export type HorizonEvent =
  | string
  | {
      type?: string;
      name?: string;
      event?: string;
      payload?: EventPayload;
      data?: EventPayload;
      [key: string]: unknown;
    };

export async function emitEvent(
  event: HorizonEvent,
  payload: EventPayload = {}
): Promise<void> {
  if (typeof event === "string") {
    console.info("[event]", event, payload);
    return;
  }

  const eventName =
    event.type ||
    event.name ||
    event.event ||
    "unknown";

  console.info("[event]", eventName, {
    ...event,
    payload: event.payload || event.data || payload,
  });
}

export async function emit(
  event: HorizonEvent,
  payload: EventPayload = {}
): Promise<void> {
  return emitEvent(event, payload);
}

export async function publishEvent(
  event: HorizonEvent,
  payload: EventPayload = {}
): Promise<void> {
  return emitEvent(event, payload);
}