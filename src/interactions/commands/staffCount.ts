import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { staffs } from "../../db/schema.js";
import { count } from "drizzle-orm";

const staffCount: Command = {
    data: new SlashCommandBuilder()
        .setName("staffcount")
        .setDescription("(Admin) Show staff onboarding status counts.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const [result] = await db
            .select({
                total: count(),
                onboarded: count(staffs.userId),
            })
            .from(staffs);

        if (!result || result.total === 0) {
            await interaction.reply({
                content: "No staff members have been recorded yet.",
            });
            return;
        }

        const pending = result.total - result.onboarded;

        await interaction.reply({
            content: [
                `**Staff Status**`,
                `• Total staff (currently assigned): **${result.total}**`,
                `• Onboarded: **${result.onboarded}**`,
                `• Pending onboarding: **${pending}**`,
            ].join("\n"),
        });
    },
};

export default staffCount;

