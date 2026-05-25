import {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const createOnboardingPrompt: Command = {
  data: new SlashCommandBuilder()
    .setName("createonboardingprompt")
    .setDescription("(Admin) Send the onboarding prompt message.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((opt) =>
      opt
        .setName("message")
        .setDescription("Caption to show. Use /link as the call-to-action (default provided).")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("messagetype")
        .setDescription("The type of message to send.")
        .addChoices(
          { name: "Normal", value: "normal" },
          { name: "Embed", value: "embed" },
        )
    )
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("The channel to send the message to. Defaults to current channel.")
        .setRequired(false)
    ),

  async execute(interaction) {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "defaultOnboardedRole"))
      .limit(1);

    if (!setting) {
      await interaction.reply({
        content: "Bot is not configured yet. Run `/setup` first.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const caption = (
      interaction.options.getString("message") ??
      "พิมพ์ `/link` เพื่อลงทะเบียนและรับยศตามฝ่าย"
    ).replace(/\\n/g, "\n");

    const messageType = interaction.options.getString("messagetype") ?? "normal";

    const channelOption = interaction.options.getChannel("channel");
    const channel = channelOption
      ? interaction.client.channels.cache.get(channelOption.id)
      : interaction.channel;

    if (!channel || !channel.isSendable()) {
      await interaction.reply({ content: "Cannot send messages in this channel.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (messageType === "embed") {
      const embed = new EmbedBuilder()
        .setDescription(caption)
        .setColor(0x5865f2);
      await channel.send({ embeds: [embed] });
    } else {
      await channel.send({ content: caption });
    }

    await interaction.reply({ content: "Message sent.", flags: MessageFlags.Ephemeral });
  },
};

export default createOnboardingPrompt;
