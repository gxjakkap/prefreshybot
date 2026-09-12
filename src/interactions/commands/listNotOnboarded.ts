import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { staffs, teams } from "../../db/schema.js";
import type { Command } from "../../types.js";

const alink: Command = {
    data: new SlashCommandBuilder()
        .setName("listnotonboarded")
        .setDescription("(Admin) List all staff that hasn't onboarded")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const std = await db
            .select({
                studentId: staffs.studentId,
                role: staffs.team,
                name: staffs.name,
                nickname: staffs.nickname,
                year: staffs.year,
                team: sql`coalesce(${teams.displayName}, 'Unknown')`,
            })
            .from(staffs)
            .leftJoin(teams, eq(staffs.team, teams.slug))
            .where(isNull(staffs.userId));

        if (!std) {
            await interaction.reply({
                content: `ไม่มีทีมงานท่ยังไม่ลงทะเบียน`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const lines = std.map(
            (ea, i) => `${i}. ${ea.studentId} ${ea.name} (${ea.nickname}) ${ea.team} ปี ${ea.year}`,
        );

        const chunks: string[] = [`**ทีมงานที่ยังไม่ลงทะเบียน (${std.length} คน)**`];
        for (const line of lines) {
            const last = chunks.at(-1)!;
            if (last.length + line.length + 1 > 2000) {
                chunks.push(line);
            } else {
                chunks[chunks.length - 1] = `${last}\n${line}`;
            }
        }

        const [first, ...rest] = chunks;
        await interaction.reply(first!);
        for (const chunk of rest) {
            await interaction.followUp(chunk);
        }
    },
};

export default alink;
