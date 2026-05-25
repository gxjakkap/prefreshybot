import type { BotClient, Button, Command, Modal, SelectMenu } from "../types.js";

/**
 * Recursively globs `src/interactions/**\/*.ts` and registers each handler on
 * the appropriate client collection based on the sub-directory it lives in.
 *
 * Directory → collection mapping:
 *   interactions/commands/     → client.commands
 *   interactions/buttons/      → client.buttons
 *   interactions/modals/       → client.modals
 *   interactions/selectMenus/  → client.selectMenus
 */
export async function loadInteractions(client: BotClient): Promise<void> {
  const interactionsDir = new URL("../interactions", import.meta.url).pathname;
  const glob = new Bun.Glob("**/*.ts");

  for await (const file of glob.scan({ cwd: interactionsDir, absolute: true })) {
    const mod = (await import(file)) as { default?: unknown };
    const handler = mod.default;

    if (!handler) {
      console.warn(`[Interactions] Skipping ${file}: no default export.`);
      continue;
    }

    if (file.includes("/commands/")) {
      const cmd = handler as Command;
      client.commands.set(cmd.data.name, cmd);
      console.log(`[Interactions] Command → /${cmd.data.name}`);
    } else if (file.includes("/buttons/")) {
      const btn = handler as Button;
      client.buttons.set(btn.customId, btn);
      console.log(`[Interactions] Button  → ${btn.customId}`);
    } else if (file.includes("/modals/")) {
      const modal = handler as Modal;
      client.modals.set(modal.customId, modal);
      console.log(`[Interactions] Modal   → ${modal.customId}`);
    } else if (file.includes("/selectMenus/")) {
      const menu = handler as SelectMenu;
      client.selectMenus.set(menu.customId, menu);
      console.log(`[Interactions] Select  → ${menu.customId}`);
    } else {
      console.warn(`[Interactions] Unknown sub-directory for: ${file}`);
    }
  }
}
