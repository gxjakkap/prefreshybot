import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { teams } from "../../db/schema.js";

const listTeam: Command = {
    data: new SlashCommandBuilder()
        .setName("listteams")
        .setDescription("(Admin) List all teams and their linked roles.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const allTeams = await db.select().from(teams);

        if (allTeams.length === 0) {
            await interaction.reply({
                content: "No teams have been created yet.",
            });
            return;
        }

        const lines = allTeams.map(
            (t) => `• **${t.displayName}** (\`${t.slug}\`) <@&${t.roleId}>`
        );

        await interaction.reply({
            content: `**Teams (${allTeams.length})**\n${lines.join("\n")}`,
        });
    },
};

export default listTeam;
