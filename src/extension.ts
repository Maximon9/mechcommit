// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import type { WorkspaceConfiguration, ExtensionContext } from "vscode";
import type { GitModifications } from "./utils/getListOfFiles";
import { window, workspace, commands } from "vscode";
import { getGitModifications } from "./utils/getListOfFiles";
import { runGitCommand } from "./utils/runGitCommand";
import { checkGitStatus } from "./utils/checkGitStatus";
import { generateCommitMessage } from "./utils/generateCommitMessage";
import { sleep } from "./utils/sleep";

type PostCommitCommand = "none" | "push" | "sync";
type OverridePostCommitCommand = "nooverride" | "none" | "push" | "sync";
interface ActionString {
    addedFiles: string;
    updatedFiles: string;
    deletedFiles: string;
}
interface Configs extends WorkspaceConfiguration {
    actionStrings: ActionString;
    runPostCommitCommand: boolean;
    overridePostCommitCommand: OverridePostCommitCommand;
}

let stopFlag = false;

const addGitCommits = async () => {
    if (stopFlag) {
        return;
    }
    await sleep(500);
    if (stopFlag) {
        return;
    }
    const gitModifications = getGitModifications();
    const configs = workspace.getConfiguration("mechcommit") as Configs;
    if (
        !configs.has("actionStrings") ||
        !configs.has("runPostCommitCommand") ||
        !configs.has("overridePostCommitCommand")
    ) {
        return;
    }
    if (gitModifications !== undefined) {
        const propertyNames: (keyof GitModifications)[] = Object.keys(
            gitModifications
        ) as (keyof GitModifications)[];
        let message: string = "";
        for (let i = 0; i < propertyNames.length; i++) {
            if (stopFlag) {
                return;
            }
            const name: keyof GitModifications = propertyNames[i];
            const modifications = gitModifications[name];
            if (modifications.length > 0) {
                const action =
                    name === "addedFiles"
                        ? configs.actionStrings.addedFiles
                        : name === "updatedFiles"
                        ? configs.actionStrings.updatedFiles
                        : configs.actionStrings.deletedFiles;
                if (action === configs.actionStrings.deletedFiles) {
                    for (let index = 0; index < modifications.length; index++) {
                        const file = modifications[index];
                        runGitCommand("git", ["rm", file]);
                    }
                } else {
                    for (let index = 0; index < modifications.length; index++) {
                        const file = modifications[index];
                        runGitCommand("git", ["add", file]);
                    }
                }
                if (message !== "") {
                    message += "; ";
                }
                message += generateCommitMessage(modifications, action);
            }
        }
        if (message !== "") {
            if (stopFlag) {
                return;
            }
            runGitCommand("git", ["commit", "-m", message]);
            if (stopFlag) {
                return;
            }
            if (configs.runPostCommitCommand) {
                const gitConfigs = workspace.getConfiguration("git");
                let postCommitCommand: PostCommitCommand = "none";
                if (gitConfigs.has("postCommitCommand")) {
                    postCommitCommand = gitConfigs.postCommitCommand;
                }
                if (configs.overridePostCommitCommand !== "nooverride") {
                    postCommitCommand = configs.overridePostCommitCommand;
                }
                switch (postCommitCommand) {
                    case "push":
                        runGitCommand("git", ["push"]);
                        break;
                    case "sync":
                        runGitCommand("git", ["pull"]);
                        if (stopFlag) {
                            return;
                        }
                        runGitCommand("git", ["push"]);
                        break;
                }
            }
        }
    }
};

// This method is called when the extension is activated
// This extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    const start = commands.registerCommand("mechcommit.run", async () => {
        process.chdir(workspace.workspaceFolders?.[0].uri.fsPath ?? "");

        const status = checkGitStatus();

        if (status.error !== undefined) {
            window.showErrorMessage(status.error);
            return commands.executeCommand(
                "setContext",
                "mechcommit.active",
                false
            );
        } else if (status.message !== undefined) {
            window.showInformationMessage(status.message);
            return commands.executeCommand(
                "setContext",
                "mechcommit.active",
                false
            );
        }

        stopFlag = false;
        commands.executeCommand("setContext", "mechcommit.active", true);
        window.showInformationMessage("Auto Commit Master started!");

        await addGitCommits();

        if (!stopFlag) {
            window.showInformationMessage("All files are committed!");
            commands.executeCommand("setContext", "mechcommit.active", false);
        }
    });

    const stop = commands.registerCommand("mechcommit.stop", () => {
        console.log("Stop has started");
        stopFlag = true;
        commands.executeCommand("setContext", "mechcommit.active", false);
        window.showInformationMessage("Auto Commit Master stopped!");
        console.log("It tried stopping");
    });

    context.subscriptions.push(start, stop);
    commands.executeCommand("setContext", "mechcommit.active", false);
}

// This method is called when this extension is deactivated
export function deactivate() {}
