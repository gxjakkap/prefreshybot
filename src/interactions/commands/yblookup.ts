import {
    EmbedBuilder,
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { staffs } from "../../db/schema.js";
import { eq } from "drizzle-orm";

interface YbGetInfoResponse {
    status: number;
    data: {
        id: string;
        gen: number;
        tha_name: string;
        eng_name: string;
        tha_nick: string;
        eng_nick: string;
        personal_email: string;
        university_email: string;
        phone: string;
        socials: {
            id: string | null;
            fb: string | null;
            line: string | null;
            discord: string | null;
        };
        img_url: string | null;
    };
}

const yblookup: Command = {
    data: new SlashCommandBuilder()
        .setName("yblookup")
        .setDescription("(Admin) Look up staff's info on yookbeer")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addMentionableOption((opt) =>
            opt
                .setName("user")
                .setDescription("User")
                .setRequired(true)
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
        

        const [std] = await db
            .select({
                studentId: staffs.studentId,
            })
            .from(staffs)
            .where(eq(staffs.userId, targetMember.id))
            .limit(1);

        if (!std) {
            await interaction.reply({
                content: `Not found`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const apiKey = process.env.YB_API_KEY;
        if (!apiKey) {
            await interaction.reply({
                content: "YB_API_KEY is not configured.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const url = `https://yb.guntxjakka.me/api/yb/get-info/${std.studentId}`

        const res = await fetch(url, {
            headers: {
                "Authorization": apiKey,
            },
            method: "GET",
        })

        if (res.status !== 200){
            console.log(`err fetching data of user ${targetMember.user.username} (${targetMember.user.id}) (sid: ${std.studentId}, url: ${url}) from yb: ${res.status} ${res.statusText}`)
            await interaction.reply({
                content: `Error while fetching data from yookbeer`,
                flags: MessageFlags.Ephemeral,
            })
            return
        }

        const data = ((await res.json()) as YbGetInfoResponse).data

        const embed = new EmbedBuilder()
            .setTitle("Information from yookbeer")
            .setDescription(`<@${targetMember.id}> 's info (${std.studentId})`)
            .addFields(
                { name: "Name (TH)", value: data.tha_name || "-", inline: true },
                { name: "Name (EN)", value: data.eng_name || "-", inline: true },
                { name: "Nickname (TH)", value: data.tha_nick || "-", inline: true },
                { name: "Nickname (EN)", value: data.eng_nick || "-", inline: true },
                { name: "Gen", value: String(data.gen), inline: true },
                { name: "Email", value: data.personal_email || "-", inline: false },
                { name: "University Email", value: data.university_email || "-", inline: false },
            );

        if (data.img_url) embed.setThumbnail(data.img_url);

        const contactEmbed = new EmbedBuilder()
            .addFields(
                { name: "Instagram", value: data.socials?.id || "-", inline: true },
                { name: "Facebook", value: data.socials?.fb || "-", inline: true },
                { name: "Line ID", value: data.socials?.line || "-", inline: true },
                { name: "Discord", value: data.socials?.discord || "-", inline: true },
            );

        await interaction.reply({
            embeds: [embed, contactEmbed],
            flags: MessageFlags.Ephemeral,
        });
    },
};

export default yblookup;
