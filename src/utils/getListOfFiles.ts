import type { SpawnSyncReturns } from "child_process";
import { spawnSync } from "child_process";
import { window } from "vscode";

export interface GitModifications {
    addedFiles: string[];
    updatedFiles: string[];
    deletedFiles: string[];
}

const commands: Record<keyof GitModifications, [string, string[]]> = {
    addedFiles: ["git", ["ls-files", "--others", "--exclude-standard"]],
    updatedFiles: ["git", ["ls-files", "--modified", "--exclude-standard"]],
    deletedFiles: ["git", ["ls-files", "--deleted"]],
};
export const getGitModifications = (): GitModifications | undefined => {
    const files: GitModifications = {
        addedFiles: [],
        updatedFiles: [],
        deletedFiles: [],
    };

    let key: keyof GitModifications;
    for (key in commands) {
        const command = commands[key];
        try {
            const child: SpawnSyncReturns<Buffer> = spawnSync(
                command[0],
                command[1]
            );
            if (files[key].length === 0) {
                const filesData: string[] = child.stdout
                    .toString()
                    .trim()
                    .split("\n");
                if (filesData.length > 1 || filesData[0] !== "") {
                    console.log(`filesData ${key}`, filesData);
                    files[key] = filesData;
                }
            }
        } catch (error) {
            window.showInformationMessage("Git command failed");
            return undefined;
        }
    }

    files.updatedFiles = files.updatedFiles.filter(
        (file) => !files.deletedFiles.includes(file)
    );

    return files;
};
