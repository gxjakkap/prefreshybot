import { GuildMember, MessageFlags } from "discord.js";
import type { Button } from "../../types.js";
import { db } from "../../db/index.js";
import { settings, staffs, teams } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const confirmOnboarding: Button = {
  // Matches "confirm_onboarding:{studentId}" via prefix-match in the router
  customId: "confirm_onboarding",

  async execute(interaction) {
    if (!(interaction.member instanceof GuildMember)) return;

    // Extract the studentId encoded in the customId suffix
    const studentId = interaction.customId.split(":")[1];
    if (!studentId) {
      await interaction.update({ content: "ไม่พบรหัสนักศึกษา", embeds: [], components: [] });
      return;
    }

    const [[std], [onboardRole]] = await Promise.all([
      db
        .select({ role: teams.roleId, name: staffs.name, nickname: staffs.nickname, year: staffs.year })
        .from(staffs)
        .where(eq(staffs.studentId, studentId))
        .leftJoin(teams, eq(staffs.team, teams.slug))
        .limit(1),
      db
        .select({ value: settings.value })
        .from(settings)
        .where(eq(settings.key, "defaultOnboardedRole"))
        .limit(1)
    ])



    if (!std) {
      await interaction.update({ content: `<@${interaction.user.id}> ไม่พบข้อมูลของคุณ กรุณาติดต่อฝ่ายประธาน`, embeds: [], components: [] });
      return;
    }

    try {
      if (!std.role) {
        await interaction.update({ content: `<@${interaction.user.id}> ไม่พบ role ของ staff นี้ กรุณาติดต่อฝ่ายประธาน`, embeds: [], components: [] });
        return;
      }
      await interaction.member.roles.add(std.role);
      await interaction.member.setNickname(`${std.nickname} ปี ${std.year}`);
      if (onboardRole?.value) await interaction.member.roles.add(onboardRole.value);

      await db
        .update(staffs)
        .set({ userId: interaction.user.id })
        .where(eq(staffs.studentId, studentId));

      await interaction.update({
        content: `<@${interaction.user.id}> ยืนยันตัวตนเสร็จสิ้น`,
        embeds: [],
        components: [],
      });
    } catch (e) {
      console.error("[confirmOnboarding]", e);
      await interaction.update({
        content: `<@${interaction.user.id}> เกิดข้อผิดพลาด กรุณาติดต่อฝ่ายประธาน`,
        embeds: [],
        components: [],
      });
    }
  },
};

export default confirmOnboarding;
