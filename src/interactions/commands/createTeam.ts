import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { teams } from "../../db/schema.js";
import { or, eq } from "drizzle-orm";

const createTeam: Command = {
    data: new SlashCommandBuilder()
        .setName("createteam")
        .setDescription("(Admin) Create a new team.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((opt) =>
            opt
                .setName("name")
                .setDescription("The label of the button.")
                .setRequired(true)
        )
        .addMentionableOption((opt) =>
            opt
                .setName("role")
                .setDescription("The role of the team.")
                .setRequired(true)
        )
        .addMentionableOption((opt) =>
            opt
                .setName("head_role")
                .setDescription("The role for the head of the team.")
                .setRequired(true)
        )
        .addStringOption((opt) =>
            opt
                .setName("slug")
                .setDescription("The slug of the team.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const name = interaction.options.getString("name", true);
        const role = interaction.options.getRole("role", true);
        const headRole = interaction.options.getRole("head_role", true);
        const slug = interaction.options.getString("slug", true);

        const existing = await db
            .select()
            .from(teams)
            .where(
                or(
                    eq(teams.displayName, name),
                    eq(teams.slug, slug),
                    eq(teams.roleId, role.id),
                )
            )
            .limit(1);

        if (existing.length > 0) {
            const conflict = existing[0]!
            let reason = "unknown field";
            if (conflict.displayName === name) reason = `name **${name}**`;
            else if (conflict.slug === slug) reason = `slug **${slug}**`;
            else if (conflict.roleId === role.id) reason = `role <@&${role.id}>`;

            await interaction.reply({
                content: `A team with the same ${reason} already exists.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await db.insert(teams).values({
            displayName: name,
            roleId: role.id,
            headRoleId: headRole.id,
            slug,
        });

        await interaction.reply({ content: `${name} created and linked to <@&${role.id}> (Head: <@&${headRole.id}>)` });
    },
};

export default createTeam;
