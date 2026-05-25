import type { BotClient, Event } from "../types.js";

/**
 * Recursively globs `src/events/**\/*.ts` and registers each file as a
 * Discord.js event listener on the client.
 */
export async function loadEvents(client: BotClient): Promise<void> {
  const eventsDir = new URL("../events", import.meta.url).pathname;
  const glob = new Bun.Glob("**/*.ts");

  for await (const file of glob.scan({ cwd: eventsDir, absolute: true })) {
    const mod = (await import(file)) as { default?: Event };
    const event = mod.default;

    if (!event?.name) {
      console.warn(`[Events] Skipping ${file}: no default export with "name".`);
      continue;
    }

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
