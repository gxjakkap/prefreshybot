import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types.js";

const createOnboardingPrompt: Command = {
  data: new SlashCommandBuilder()
    .setName("createonboardingprompt")
    .setDescription("(Admin) Send the prompt message with its trigger button.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((opt) =>
      opt
        .setName("buttonlabel")
        .setDescription("The label of the button.")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("message")
        .setDescription("Optional caption to show above the button.")
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
    const caption = (interaction.options.getString("message") ?? "Click the button below to open the prompt.")
      .replace(/\\n/g, "\n");
    const messageType = interaction.options.getString("messagetype") ?? "normal";
    const buttonLabel = interaction.options.getString("buttonlabel", true);

    const channelOption = interaction.options.getChannel("channel");
    const channel = channelOption
      ? interaction.client.channels.cache.get(channelOption.id)
      : interaction.channel;

    if (!channel || !channel.isSendable()) {
      await interaction.reply({ content: "Cannot send messages in this channel.", flags: MessageFlags.Ephemeral });
      return;
    }

    const button = new ButtonBuilder()
      .setCustomId("open_onboarding_modal")
      .setLabel(buttonLabel)
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    if (messageType === "embed") {
      const embed = new EmbedBuilder()
        .setDescription(caption)
        .setColor(0x5865f2);
      await channel.send({ embeds: [embed], components: [row] });
    }
    else {
      await channel.send({ content: caption, components: [row] });
    }

    await interaction.reply({ content: "Message sent.", flags: MessageFlags.Ephemeral });
  },
};

export default createOnboardingPrompt;
