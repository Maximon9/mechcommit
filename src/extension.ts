// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getFiles } from "./utils/getListOfFiles";
import { runGitCommand } from "./utils/runGitCommand";
import { checkGitStatus } from "./utils/checkGitStatus";
import { generateCommitMessage } from "./utils/generateCommitMessage";

let stopFlag = false;

const addGitCommits = async () => {
    const files = await getFiles();
    const { newFiles, modifiedFiles, deletedFiles } = files;

    const allFiles = [
        ...newFiles.map((file) => ({ file, action: "Add" })),
        ...modifiedFiles.map((file) => ({ file, action: "Update" })),
        ...deletedFiles.map((file) => ({ file, action: "Delete" })),
    ];

    for (const { file, action } of allFiles) {
        if (stopFlag) {
            return;
        }
        const message = generateCommitMessage(file, action);
        if (action === "Delete") {
            await runGitCommand("git", ["rm", file]);
        } else {
            await runGitCommand("git", ["add", file]);
        }
        await runGitCommand("git", ["commit", "-m", message]);
    }
};

// This method is called when the extension is activated
// This extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const start = vscode.commands.registerCommand(
        "mechcommit.start",
        async () => {
            process.chdir(
                vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? ""
            );

            const status = await checkGitStatus();

            if (status.error) {
                vscode.window.showErrorMessage(status.error);
                return vscode.commands.executeCommand(
                    "setContext",
                    "MechCommit.active",
                    false
                );
            } else if (status.message) {
                vscode.window.showInformationMessage(status.message);
                return vscode.commands.executeCommand(
                    "setContext",
                    "MechCommit.active",
                    false
                );
            }

            stopFlag = false;
            vscode.commands.executeCommand(
                "setContext",
                "MechCommit.active",
                true
            );
            vscode.window.showInformationMessage("Auto Commit Master started!");

            await addGitCommits();
            await addGitCommits();
            await addGitCommits();

            if (!stopFlag) {
                vscode.window.showInformationMessage(
                    "All files are committed!"
                );
                vscode.commands.executeCommand(
                    "setContext",
                    "MechCommit.active",
                    false
                );
            }
        }
    );

    const stop = vscode.commands.registerCommand("mechcommit.stop", () => {
        stopFlag = true;
        vscode.commands.executeCommand(
            "setContext",
            "MechCommit.active",
            false
        );
        vscode.window.showInformationMessage("Auto Commit Master stopped!");
    });

    context.subscriptions.push(start, stop);
    vscode.commands.executeCommand("setContext", "MechCommit.active", false);
}

// This method is called when this extension is deactivated
export function deactivate() {}
