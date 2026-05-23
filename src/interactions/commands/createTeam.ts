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
        .addStringOption((opt) =>
            opt
                .setName("slug")
                .setDescription("The slug of the team.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const name = interaction.options.getString("name", true);
        const role = interaction.options.getRole("role", true);
        const slug = interaction.options.getString("slug", true);

        await db.insert(teams).values({
            displayName: name,
            roleId: role.id,
            slug,
        });

        await interaction.reply({ content: `${name} created and linked to <@&${role.id}>`, flags: MessageFlags.Ephemeral });
    },
};

export default createTeam;
