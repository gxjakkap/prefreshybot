import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  MessageFlags,
} from "discord.js";
import type { Modal } from "../../types.js";
import { db } from "../../db/index.js";
import { staffs, teams } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const onboardingModalSubmit: Modal = {
  customId: "onboarding_modal",

  async execute(interaction) {
    if (!(interaction.member instanceof GuildMember)) return;

    const studentId = interaction.fields.getTextInputValue("student_id_input");
    console.log(`[onboardingModalSubmit] Received student ID from ${interaction.user.tag}:`, studentId);

    const pattern = /(6)[6-8]{1}(07050)(10|34|52|60)[0-9]{2}/;
    if (!pattern.test(studentId)) {
      await interaction.reply({
        content: `<@${interaction.user.id}> รหัสนักศึกษาของคุณไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const [std] = await db
      .select({ studentId: staffs.studentId, role: teams.roleId, name: staffs.name, nickname: staffs.nickname, year: staffs.year, userId: staffs.userId })
      .from(staffs)
      .where(eq(staffs.studentId, studentId))
      .leftJoin(teams, eq(staffs.team, teams.slug))
      .limit(1);

    if (!std) {
      await interaction.reply({
        content: `<@${interaction.user.id}> ไม่พบข้อมูลของคุณ โปรดติดต่อฝ่ายประธาน`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (std.userId) {
      await interaction.reply({
        content: `<@${interaction.user.id}> รหัสนักศึกษานี้ถูกใช้แล้ว (<@${std.userId}>) หากนี่ไม่ใช่คุณ โปรดติดต่อฝ่ายประธาน`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("ยืนยันการลงทะเบียน")
      .setDescription("โปรดตรวจสอบข้อมูลของคุณก่อนยืนยัน")
      .addFields(
        { name: "ชื่อ", value: std.name, inline: true },
        { name: "ชื่อเล่น", value: std.nickname, inline: true },
        { name: "ชั้นปี", value: String(std.year), inline: true },
        { name: "ฝ่าย", value: `<@&${std.role}>`, inline: true },
      );

    const confirmButton = new ButtonBuilder()
      .setCustomId(`confirm_onboarding:${studentId}`)
      .setLabel("ยืนยัน")
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel_onboarding")
      .setLabel("ยกเลิก")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default onboardingModalSubmit;
