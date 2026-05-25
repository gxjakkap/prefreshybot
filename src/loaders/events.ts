import type { BotClient } from "../types.js";
import { events } from "../events.manifest.js";

export async function loadEvents(client: BotClient): Promise<void> {
  for (const event of events) {
    if (!event?.name) continue;

    const listener = (...args: unknown[]) =>
      // @ts-expect-error
      event.execute(...args);

    if (event.once) {
      client.once(event.name, listener);
    } else {
      client.on(event.name, listener);
    }

    console.log(`[Events] Registered ${event.once ? "once" : "on"} → ${event.name}`);
  }
}
