import type { PresenceStatusData } from "discord.js";
import { ActivityType, PresenceUpdateStatus } from "discord.js";

export const parseStatusActivityConfig = (status: string): ActivityType => {
    if (status === "playing") return ActivityType.Playing;
    else if (status === "watching") return ActivityType.Watching;
    else if (status === "streaming") return ActivityType.Streaming;
    else if (status === "listening") return ActivityType.Listening;
    else if (status === "competing") return ActivityType.Competing;
    else if (status === "custom") return ActivityType.Custom;

    return ActivityType.Playing;
};

export const parseStatusPresenceConfig = (status: string): PresenceStatusData => {
    if (status === "online") return PresenceUpdateStatus.Online;
    else if (status === "idle") return PresenceUpdateStatus.Idle;
    else if (status === "dnd") return PresenceUpdateStatus.DoNotDisturb;
    else if (status === "invis") return PresenceUpdateStatus.Invisible;

    return PresenceUpdateStatus.Online;
};
