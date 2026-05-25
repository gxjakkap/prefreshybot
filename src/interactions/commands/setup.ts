import {
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";

const setup: Command = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("(Admin) Configure bot settings.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption((opt) =>
            opt
                .setName("defaultonboardedrole")
                .setDescription("The role granted to every user who completes onboarding.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const role = interaction.options.getRole("defaultonboardedrole", true);

        await db
            .insert(settings)
            .values({ key: "defaultOnboardedRole", value: role.id })
            .onConflictDoUpdate({
                target: settings.key,
                set: { value: role.id },
            });

        await interaction.reply({
            content: `<@${interaction.user.id}> \`defaultOnboardedRole\` set to <@&${role.id}> (\`${role.id}\`).`,
            flags: MessageFlags.Ephemeral,
        });
    },
};

export default setup;
