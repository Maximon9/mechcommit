import type { SpawnSyncReturns } from "child_process";
import { spawnSync } from "child_process";

export const runGitCommand = (
    command: string,
    args: string[]
): SpawnSyncReturns<Buffer> => {
    return spawnSync(command, args);
};
