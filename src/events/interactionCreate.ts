import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Events,
  type Interaction,
  MessageFlags,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import { DiscordAPIError } from "discord.js";

/** Silently drop "Unknown interaction" (10062) — token expired, nothing we can do. */
function isExpired(err: unknown): boolean {
  return err instanceof DiscordAPIError && err.code === 10062;
}
import type { BotClient, Event } from "../types.js";

const interactionCreate: Event<"interactionCreate"> = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    const client = interaction.client as BotClient;

    // Slash command
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.warn(`[InteractionCreate] Unknown command: ${interaction.commandName}`);
        return;
      }
      try {
        await command.execute(interaction as ChatInputCommandInteraction);
      } catch (err) {
        console.error(`[InteractionCreate] Error in /${interaction.commandName}:`, err);
        const reply = { content: "Something went wrong.", flags: [MessageFlags.Ephemeral] as const };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.autocomplete) return;
      try {
        await command.autocomplete(interaction);
      } catch (err) {
        console.error(`[InteractionCreate] Autocomplete error for /${interaction.commandName}:`, err);
      }
      return;
    }

    // Buttons (prefix-match on customId)
    if (interaction.isButton()) {
      const handler = [...client.buttons.values()].find((b) =>
        (interaction as ButtonInteraction).customId.startsWith(b.customId)
      );
      if (!handler) return;
      try {
        await handler.execute(interaction as ButtonInteraction);
      } catch (err) {
        if (!isExpired(err)) {
          console.error(`[InteractionCreate] Button error (${interaction.customId}):`, err);
        }
      }
      return;
    }

    // Modals (prefix-match on customId)
    if (interaction.isModalSubmit()) {
      const handler = [...client.modals.values()].find((m) =>
        (interaction as ModalSubmitInteraction).customId.startsWith(m.customId)
      );
      if (!handler) return;
      try {
        await handler.execute(interaction as ModalSubmitInteraction);
      } catch (err) {
        if (!isExpired(err)) {
          console.error(`[InteractionCreate] Modal error (${interaction.customId}):`, err);
        }
      }
      return;
    }

    // Select menus (prefix-match on customId)
    if (interaction.isStringSelectMenu()) {
      const handler = [...client.selectMenus.values()].find((s) =>
        (interaction as StringSelectMenuInteraction).customId.startsWith(s.customId)
      );
      if (!handler) return;
      try {
        await handler.execute(interaction as StringSelectMenuInteraction);
      } catch (err) {
        console.error(`[InteractionCreate] SelectMenu error (${interaction.customId}):`, err);
      }
    }
  },
};

export default interactionCreate;
