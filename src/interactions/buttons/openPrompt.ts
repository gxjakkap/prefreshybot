import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import type { Button } from "../../types.js";

const openOnboardingModalButton: Button = {
  customId: "open_onboarding_modal",

  async execute(interaction) {
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

export default openOnboardingModalButton;
