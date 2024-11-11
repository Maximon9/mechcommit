import type { SpawnSyncReturns } from "child_process";
import { spawnSync } from "child_process";

export const runGitCommand = (
    command: string,
    args: readonly string[]
): SpawnSyncReturns<string> => {
    return spawnSync(command, args, { encoding: "utf-8" });
};
