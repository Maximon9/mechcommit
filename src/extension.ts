// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import type { WorkspaceConfiguration, ExtensionContext } from "vscode";
import type { GitModifications } from "./utils/getListOfFiles";
import { window, workspace, commands } from "vscode";
import { getGitModifications } from "./utils/getListOfFiles";
import { runGitCommand } from "./utils/runGitCommand";
import { checkGitStatus } from "./utils/checkGitStatus";
import { generateCommitMessage } from "./utils/generateCommitMessage";

interface ActionString {
    addedFiles: string;
    updatedFiles: string;
    deletedFiles: string;
}
interface Configs extends WorkspaceConfiguration {
    actionStrings: ActionString;
}

let stopFlag = false;

const addGitCommits = () => {
    const gitModifications = getGitModifications();
    const configs: Configs = workspace.getConfiguration(
        "mechcommit"
    ) as Configs;
    if (!configs.has("actionStrings")) {
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
            runGitCommand("git", ["commit", "-m", message]);
        }
    }
};

// This method is called when the extension is activated
// This extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    const start = commands.registerCommand("mechcommit.run", () => {
        process.chdir(workspace.workspaceFolders?.[0].uri.fsPath ?? "");

        const status = checkGitStatus();

        if (status.error !== undefined) {
            window.showErrorMessage(status.error);
            return commands.executeCommand(
                "setContext",
                "MechCommit.active",
                false
            );
        } else if (status.message !== undefined) {
            window.showInformationMessage(status.message);
            return commands.executeCommand(
                "setContext",
                "MechCommit.active",
                false
            );
        }

        stopFlag = false;
        commands.executeCommand("setContext", "MechCommit.active", true);
        window.showInformationMessage("Auto Commit Master started!");

        addGitCommits();

        if (!stopFlag) {
            window.showInformationMessage("All files are committed!");
            commands.executeCommand("setContext", "MechCommit.active", false);
        }
    });

    const stop = commands.registerCommand("mechcommit.stop", () => {
        stopFlag = true;
        commands.executeCommand("setContext", "MechCommit.active", false);
        window.showInformationMessage("Auto Commit Master stopped!");
    });

    context.subscriptions.push(start, stop);
    commands.executeCommand("setContext", "MechCommit.active", false);
}

// This method is called when this extension is deactivated
export function deactivate() {}
