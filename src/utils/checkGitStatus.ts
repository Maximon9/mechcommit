import { runGitCommand } from "./runGitCommand";

interface GitStatus {
    error?: string;
    message?: string;
}

export const checkGitStatus = (): GitStatus => {
    try {
        const gitStatus = runGitCommand("git", ["status"]);

        if (
            gitStatus.stdout.includes("nothing to commit, working tree clean")
        ) {
            return {
                message: "All files are committed!",
            };
        }

        if (gitStatus.stderr.includes("fatal: not a git repository")) {
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
