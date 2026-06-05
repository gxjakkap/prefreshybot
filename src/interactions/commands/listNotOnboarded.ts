import {
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { staffs, teams } from "../../db/schema.js";
import { eq, isNull, sql } from "drizzle-orm";

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
                team: sql`coalesce(${teams.displayName}, 'Unknown')`
            })
            .from(staffs)
            .leftJoin(teams, eq(staffs.team, teams.slug))
            .where(isNull(staffs.userId))

        if (!std) {
            await interaction.reply({
                content: `ไม่มีทีมงานท่ยังไม่ลงทะเบียน`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        let msg = `**ทีมงานที่ยังไม่ลงทะเบียน (${std.length} คน)**\n`

        std.forEach((ea, i) => {
            msg += `\n${i}. ${ea.studentId} ${ea.name} (${ea.nickname}) ฝ่าย${ea.team} ปี ${ea.year}`
        })

        await interaction.reply(msg);
    },
};

export default alink;
