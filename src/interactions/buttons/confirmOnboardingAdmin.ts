import { GuildMember } from "discord.js";
import type { Button } from "../../types.js";
import { db } from "../../db/index.js";
import { settings, staffs, teams } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const confirmOnboardingAdmin: Button = {
  customId: "admin_link_confirm",

  async execute(interaction) {
    if (!(interaction.member instanceof GuildMember)) return;

    const parts = interaction.customId.split(":");
    const studentId = parts[1];
    const targetUserId = parts[2];

    if (!studentId || !targetUserId) {
      await interaction.update({ content: "ข้อมูลไม่ครบถ้วน", embeds: [], components: [] });
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
    ]);

    if (!std) {
      await interaction.update({ content: `ไม่พบข้อมูลของ ${studentId}`, embeds: [], components: [] });
      return;
    }

    try {
      if (!std.role) {
        await interaction.update({ content: `ไม่พบ role ของ staff นี้`, embeds: [], components: [] });
        return;
      }

      const targetMember = await interaction.guild?.members.fetch(targetUserId);
      if (!targetMember) {
        await interaction.update({ content: `ไม่พบ member <@${targetUserId}> ในเซิร์ฟเวอร์`, embeds: [], components: [] });
        return;
      }

      await targetMember.roles.add(std.role);
      await targetMember.setNickname(`${std.nickname} ปี ${std.year}`);
      if (onboardRole?.value) await targetMember.roles.add(onboardRole.value);

      await db
        .update(staffs)
        .set({ userId: targetUserId })
        .where(eq(staffs.studentId, studentId));

      await interaction.update({
        content: `ยืนยันตัวตนให้ <@${targetUserId}> เสร็จสิ้น`,
        embeds: [],
        components: [],
      });
    } catch (e) {
      console.error("[confirmOnboardingAdmin]", e);
      await interaction.update({
        content: `เกิดข้อผิดพลาดในการ link ให้ <@${targetUserId}>`,
        embeds: [],
        components: [],
      });
    }
  },
};

export default confirmOnboardingAdmin;
