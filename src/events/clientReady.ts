import type { Event } from "../types.js";

const clientReady: Event<"clientReady"> = {
  name: "clientReady",
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
  },
};

export default clientReady;
