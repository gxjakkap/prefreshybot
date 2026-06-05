import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { staffs, teams } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const alink: Command = {
    data: new SlashCommandBuilder()
        .setName("alink")
        .setDescription("(Admin) ลงทะเบียนและยืนยันตัวตนให้ staff ท่านอื่น")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addMentionableOption((opt) =>
            opt
                .setName("user")
                .setDescription("User")
                .setRequired(true)
        )
        .addStringOption((opt) =>
            opt
                .setName("studentid")
                .setDescription("Student ID")
                .setRequired(true)
                .setMaxLength(12)
        ),

    async execute(interaction) {
        const mentionable = interaction.options.getMentionable("user", true);

        if (!(mentionable instanceof GuildMember)) {
            await interaction.reply({
                content: "Please mention a **user**, not a role.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const targetMember = mentionable;
        const studentId = interaction.options.getString("studentid", true);

        const pattern = /(6)[6-8]{1}(07050)(10|34|52|60)[0-9]{2}/;
        if (!pattern.test(studentId)) {
            await interaction.reply({
                content: `รหัสนักศึกษา \`${studentId}\` ไม่ถูกต้อง`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const [std] = await db
            .select({
                studentId: staffs.studentId,
                role: teams.roleId,
                name: staffs.name,
                nickname: staffs.nickname,
                year: staffs.year,
                userId: staffs.userId,
            })
            .from(staffs)
            .where(eq(staffs.studentId, studentId))
            .leftJoin(teams, eq(staffs.team, teams.slug))
            .limit(1);

        if (!std) {
            await interaction.reply({
                content: `ไม่พบข้อมูลของรหัสนักศึกษา \`${studentId}\``,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (std.userId) {
            await interaction.reply({
                content: `รหัสนักศึกษานี้ถูกใช้แล้วโดย <@${std.userId}>`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("ยืนยันการ Link")
            .setDescription(`โปรดตรวจสอบข้อมูลก่อนยืนยันการ link ให้กับ <@${targetMember.id}>`)
            .addFields(
                { name: "ชื่อ", value: std.name, inline: true },
                { name: "ชื่อเล่น", value: std.nickname, inline: true },
                { name: "ชั้นปี", value: String(std.year), inline: true },
                { name: "ฝ่าย", value: `<@&${std.role}>`, inline: true },
            );

        const confirmButton = new ButtonBuilder()
            .setCustomId(`admin_link_confirm:${studentId}:${targetMember.id}`)
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

export default alink;
