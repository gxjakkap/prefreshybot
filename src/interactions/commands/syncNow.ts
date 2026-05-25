import {
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { insertNewStaffs } from "../../lib/staff-data.js";

const syncNow: Command = {
    data: new SlashCommandBuilder()
        .setName("syncnow")
        .setDescription("(Admin) pull staff info from sheet")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await insertNewStaffs();

        await interaction.reply({
            content: `<@${interaction.user.id}> synced with sheet.`,
            flags: MessageFlags.Ephemeral,
        });
    },
};

export default syncNow;
