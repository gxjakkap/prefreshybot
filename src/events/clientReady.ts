import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { settings } from "../db/schema.js";
import type { Event } from "../types.js";
import { parseStatusActivityConfig, parseStatusPresenceConfig } from "../lib/status.js";

const clientReady: Event<"clientReady"> = {
  name: "clientReady",
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    const [status] = await db.select().from(settings).where(eq(settings.key, "statusMessage")).limit(1)

    if (!status) return

    const [statusActivityType] = await db.select().from(settings).where(eq(settings.key, "statusActivityType"))
    const [statusPresenceType] = await db.select().from(settings).where(eq(settings.key, "statusPresenceType"))
    client.user.setPresence({
        activities: [{ 
            name: status.value, 
            type: parseStatusActivityConfig(statusActivityType ? statusActivityType.value : "playing")
        }],
        status: parseStatusPresenceConfig(statusPresenceType ? statusPresenceType.value : "online"),
    });
  },
};

export default clientReady;
