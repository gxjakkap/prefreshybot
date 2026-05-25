import {
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { staffs, teams } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const appointHead: Command = {
    data: new SlashCommandBuilder()
        .setName("appointhead")
        .setDescription("(Admin) Appoint a user as the head of their team.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addMentionableOption((opt) =>
            opt
                .setName("user")
                .setDescription("The user to appoint as the head of their team.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const mentionable = interaction.options.getMentionable("user", true);

        if (!(mentionable instanceof GuildMember)) {
            await interaction.reply({
                content: "Please mention a **user**, not a role.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const [result] = await db
            .select({
                headRoleId: teams.headRoleId,
                teamDisplayName: teams.displayName,
            })
            .from(staffs)
            .innerJoin(teams, eq(staffs.team, teams.slug))
            .where(eq(staffs.userId, mentionable.id))
            .limit(1);

        if (!result) {
            await interaction.reply({
                content: `<@${mentionable.id}> has not completed onboarding yet or is not assigned to any team.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        try {
            await mentionable.roles.add(result.headRoleId);
        } catch (e) {
            console.error("[appointHead] Failed to assign head role:", e);
            await interaction.reply({
                content: `Failed to assign the head role <@&${result.headRoleId}>. Make sure the bot has the **Manage Roles** permission and that its role is above the target role.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.reply({
            content: `<@${mentionable.id}> has been appointed as the head of **${result.teamDisplayName}** and given <@&${result.headRoleId}>.`,
        });
    },
};

export default appointHead;

