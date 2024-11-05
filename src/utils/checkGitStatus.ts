import type { SpawnSyncReturns } from "child_process";
import { spawnSync } from "child_process";

interface GitStatus {
    error?: string;
    message?: string;
}

export const checkGitStatus = (): GitStatus => {
    try {
        const gitStatus: SpawnSyncReturns<Buffer> = spawnSync("git", [
            "status",
        ]);
        if (
            gitStatus.stdout
                .toString()
                .includes("nothing to commit, working tree clean")
        ) {
            return {
                message: "All files are committed!",
            };
        }

        if (
            gitStatus.stderr.toString().includes("fatal: not a git repository")
        ) {
            return {
                error: "Git is not initialized in this directory!",
            };
        }
        return {};
    } catch (error) {
        return {
            error: "Something went wrong",
        };
    }
};
