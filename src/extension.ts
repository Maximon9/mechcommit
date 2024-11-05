// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, workspace, commands, ExtensionContext } from "vscode";
import { getGitModifications } from "./utils/getListOfFiles";
import { runGitCommand } from "./utils/runGitCommand";
import { checkGitStatus } from "./utils/checkGitStatus";
import { generateCommitMessage } from "./utils/generateCommitMessage";

let stopFlag = false;

const addGitCommits = () => {
    const gitModifications = getGitModifications();

    if (gitModifications !== undefined) {
        for (const modifications in gitModifications) {
            if (modifications.length > 0) {
                // const action =
            }
        }
    }
    // 	for (const { file, action } of allFiles) {
    // 		if (stopFlag) {
    // 			return;
    // 		}
    // 		const message = generateCommitMessage(file, action);
    // 		if (action === "Delete") {
    // 			runGitCommand("git", ["rm", file]);
    // 		} else {
    // 			runGitCommand("git", ["add", file]);
    // 		}
    // 		runGitCommand("git", ["commit", "-m", message]);
    // 	}
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
