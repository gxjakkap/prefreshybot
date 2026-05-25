import {
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { staffs, teams, settings } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const unlink: Command = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("(Admin) Unlink a user from their staff record and revert onboarding.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((opt) =>
            opt
                .setName("user")
                .setDescription("The user to unlink.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser("user", true);

        let member: GuildMember;
        try {
            member = await interaction.guild!.members.fetch(targetUser.id);
        } catch {
            await interaction.reply({
                content: `Could not find <@${targetUser.id}> in this server.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const [[staff], [onboardedRoleSetting]] = await Promise.all([
            db
                .select({
                    studentId: staffs.studentId,
                    roleId: teams.roleId,
                    headRoleId: teams.headRoleId,
                })
                .from(staffs)
                .leftJoin(teams, eq(staffs.team, teams.slug))
                .where(eq(staffs.userId, targetUser.id))
                .limit(1),
            db
                .select({ value: settings.value })
                .from(settings)
                .where(eq(settings.key, "defaultOnboardedRole"))
                .limit(1),
        ]);

        if (!staff) {
            await interaction.reply({
                content: `<@${targetUser.id}> is not linked to any staff record.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const rolesToRemove: string[] = [];
        if (staff.roleId && member.roles.cache.has(staff.roleId)) {
            rolesToRemove.push(staff.roleId);
        }
        if (staff.headRoleId && member.roles.cache.has(staff.headRoleId)) {
            rolesToRemove.push(staff.headRoleId);
        }
        if (onboardedRoleSetting?.value && member.roles.cache.has(onboardedRoleSetting.value)) {
            rolesToRemove.push(onboardedRoleSetting.value);
        }

        try {
            if (rolesToRemove.length > 0) {
                await member.roles.remove(rolesToRemove);
            }
            await member.setNickname(null);
            await db
                .update(staffs)
                .set({ userId: null })
                .where(eq(staffs.userId, targetUser.id));

            await interaction.reply({
                content: `<@${targetUser.id}> has been unlinked from staff record \`${staff.studentId}\`. Roles and nickname have been reverted.`
            });
        } catch (e) {
            console.error("[unlink]", e);
            await interaction.reply({
                content: `Failed to unlink <@${targetUser.id}>. Make sure the bot has **Manage Roles** and **Manage Nicknames** permissions and that its role is above the target roles.`,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};

export default unlink;
