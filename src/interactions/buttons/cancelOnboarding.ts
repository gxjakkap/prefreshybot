import type { Button } from "../../types.js";

const cancelOnboarding: Button = {
  customId: "cancel_onboarding",

  async execute(interaction) {
    await interaction.update({
      content: "ยกเลิกการลงทะเบียนแล้ว",
      embeds: [],
      components: [],
    });
  },
};

export default cancelOnboarding;
