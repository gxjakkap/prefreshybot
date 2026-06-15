import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import { parseStatusActivityConfig, parseStatusPresenceConfig } from "../../lib/status.js";
import type { Command } from "../../types.js";

const status: Command = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("(Admin) Set the bot's status presence.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((opt) => opt.setName("message").setDescription("The status message text.").setRequired(false))
        .addStringOption((opt) =>
            opt
                .setName("activity")
                .setDescription("The activity type.")
                .setRequired(false)
                .addChoices(
                    { name: "Playing", value: "playing" },
                    { name: "Watching", value: "watching" },
                    { name: "Streaming", value: "streaming" },
                    { name: "Listening", value: "listening" },
                    { name: "Competing", value: "competing" },
                    { name: "Custom", value: "custom" },
                ),
        )
        .addStringOption((opt) =>
            opt
                .setName("presence")
                .setDescription("The presence status.")
                .setRequired(false)
                .addChoices(
                    { name: "Online", value: "online" },
                    { name: "Idle", value: "idle" },
                    { name: "Do Not Disturb", value: "dnd" },
                    { name: "Invisible", value: "invis" },
                ),
        ),

    async execute(interaction) {
        const message = interaction.options.getString("message");
        const activity = interaction.options.getString("activity");
        const presence = interaction.options.getString("presence");

        if (!message && !activity && !presence) {
            await interaction.reply({
                content: "Please provide at least one option to update.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const upsert = async (key: string, value: string) => {
            await db
                .insert(settings)
                .values({ key, value })
                .onConflictDoUpdate({ target: settings.key, set: { value } });
        };

        if (message) await upsert("statusMessage", message);
        if (activity) await upsert("statusActivityType", activity);
        if (presence) await upsert("statusPresenceType", presence);

        const [statusMessage] = await db.select().from(settings).where(eq(settings.key, "statusMessage")).limit(1);
        const [statusActivityType] = await db
            .select()
            .from(settings)
            .where(eq(settings.key, "statusActivityType"))
            .limit(1);
        const [statusPresenceType] = await db
            .select()
            .from(settings)
            .where(eq(settings.key, "statusPresenceType"))
            .limit(1);

        if (statusMessage) {
            interaction.client.user?.setPresence({
                activities: [
                    {
                        name: statusMessage.value,
                        type: parseStatusActivityConfig(statusActivityType ? statusActivityType.value : "playing"),
                    },
                ],
                status: parseStatusPresenceConfig(statusPresenceType ? statusPresenceType.value : "online"),
            });
        }

        const lines: string[] = [];
        if (message) lines.push(`\`statusMessage\` → \`${message}\``);
        if (activity) lines.push(`\`statusActivityType\` → \`${activity}\``);
        if (presence) lines.push(`\`statusPresenceType\` → \`${presence}\``);

        await interaction.reply({
            content: `Status updated:\n${lines.join("\n")}`,
            flags: MessageFlags.Ephemeral,
        });
    },
};

export default status;
