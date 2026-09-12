import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { insertNewStaffs } from "../../lib/staff-data.js";
import type { Command } from "../../types.js";

const syncNow: Command = {
    data: new SlashCommandBuilder()
        .setName("syncnow")
        .setDescription("(Admin) pull staff info from sheet")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        await insertNewStaffs();

        await interaction.editReply({
            content: `<@${interaction.user.id}> synced with sheet.`,
        });
    },
};

export default syncNow;
