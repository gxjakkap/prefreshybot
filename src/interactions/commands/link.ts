import {
    ActionRowBuilder,
    MessageFlags,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const link: Command = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("ลงทะเบียนและยืนยันตัวตนเพื่อรับ role ในเซิร์ฟเวอร์"),

    async execute(interaction) {
        const [setting] = await db
            .select()
            .from(settings)
            .where(eq(settings.key, "defaultOnboardedRole"))
            .limit(1);

        if (!setting) {
            await interaction.reply({
                content: "ระบบยังไม่ได้ตั้งค่า กรุณาติดต่อฝ่ายประธาน",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId("onboarding_modal")
            .setTitle("ลงทะเบียน");

        const inputField = new TextInputBuilder()
            .setCustomId("student_id_input")
            .setLabel("รหัสนักศึกษา (Student ID)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("e.g. 68070501000")
            .setRequired(true)
            .setMaxLength(12);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(inputField)
        );

        await interaction.showModal(modal);
    },
};

export default link;
