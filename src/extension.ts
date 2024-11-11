//#region
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import type { WorkspaceConfiguration, ExtensionContext } from "vscode";
import type { GitModifications } from "./utils/getListOfFiles";
import { window, workspace, commands } from "vscode";
import { getGitModifications } from "./utils/getListOfFiles";
import { checkGitStatus } from "./utils/checkGitStatus";
import { generateCommitMessage } from "./utils/generateCommitMessage";
import { setInterval } from "timers/promises";
import { runGitCommand } from "./utils/runGitCommand";
import { getGitConfigs } from "./utils/getGitConfigs";

type PreCommitCommand = "none" | "fetch" | "fetch&merge" | "pull";
type PostCommitCommand = "none" | "push" | "sync";
type OverridePostCommitCommand = "nooverride" | "none" | "push" | "sync";
interface ActionString {
    addedFiles: string;
    updatedFiles: string;
    deletedFiles: string;
}
interface Configs extends WorkspaceConfiguration {
    stopTime: number;
    actionStrings: ActionString;
    PreCommitCommand: PreCommitCommand;
    runPostCommitCommand: boolean;
    overridePostCommitCommand: OverridePostCommitCommand;
}

let stopFlag = false;

/**
 * This add commits
 * @returns {Promise<void>}
 */
const addGitCommits = async (): Promise<void> => {
    const configs = workspace.getConfiguration("mechcommit") as Configs;
    if (
        !configs.has("stopTime") ||
        !configs.has("actionStrings") ||
        !configs.has("runPostCommitCommand") ||
        !configs.has("overridePostCommitCommand")
    ) {
        window.showErrorMessage("Configs are wrong somehow");
        return;
    }
    var stopTimeInMs = configs.stopTime * 1000;
    for await (const startTime of setInterval(0, Date.now())) {
        if (stopFlag) {
            return;
        }
        const now = Date.now();
        if (now - startTime > stopTimeInMs) {
            if (stopFlag) {
                return;
            }
            break;
        }
    }
    const gitModifications = getGitModifications();
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
            message += "; ";
            if (configs.PreCommitCommand !== "none") {
                const preCommitCommand: PreCommitCommand =
                    configs.PreCommitCommand;
                switch (preCommitCommand) {
                    case "fetch":
                        runGitCommand("git", ["fetch"]);
                        break;
                    case "fetch&merge":
                        runGitCommand("git", ["fetch"]);
                        runGitCommand("git", ["merge"]);
                        break;
                    case "pull":
                        runGitCommand("git", ["pull"]);
                        break;
                }
            }
            runGitCommand("git", ["commit", "-m", message]);
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
                        runGitCommand("git", ["push"]);
                        break;
                }
            }
        }
    }
};

/**
 * This validates an email.
 * @param email is the email
 * @returns {boolean} true if email is vallid
 */
const validateGitUserEmail = (email: string): boolean => {
    const re =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(email);
};
/**
 * This is incase I find out there is a specific way to validate git configs user.name.
 * @param name is the name
 * @returns {boolean} true if email is vallid
 */
const validateGitUserName = (name: string): boolean => {
    return true;
};

/**
 * This checks if the configs needed to commmit are valid
 * @returns {boolean} true if configs needed are valid
 */
const validateGitConfigs = (): boolean => {
    const configs = getGitConfigs();
    if (configs.user !== undefined) {
        if (
            configs.user.name !== undefined &&
            configs.user.email !== undefined
        ) {
            return (
                validateGitUserName(configs.user.name) &&
                validateGitUserEmail(configs.user.email)
            );
        }
    }
    return false;
};
/**
 * This runs the extension
 * @returns {Promise<void>}
 */
const runFunc = async (): Promise<void> => {
    if (!validateGitConfigs()) {
        let userResponse = await window.showInputBox({
            placeHolder: "Type a name",
        });
        if (userResponse === undefined) {
            window.showErrorMessage(
                "The name hasn't been set so no commits will run until a valid name is given"
            );
            return;
        } else {
            if (validateGitUserName(userResponse)) {
                runGitCommand("git", [
                    "config",
                    "--global",
                    "user.name",
                    userResponse,
                ]);
            } else {
                window.showErrorMessage(
                    "The name is invalid so no commits will run until a valid name is given"
                );
                return;
            }
        }

        userResponse = await window.showInputBox({
            placeHolder: "Type an email",
        });
        if (userResponse === undefined) {
            window.showErrorMessage(
                "The email hasn't been set so no commits will run until a valid email is given"
            );
            return;
        }
        {
            if (validateGitUserEmail(userResponse)) {
                runGitCommand("git", [
                    "config",
                    "--global",
                    "user.email",
                    userResponse,
                ]);
            } else {
                window.showErrorMessage(
                    "The email is invalid so no commits will run until a valid email is given"
                );
                return;
            }
        }
    }

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
    window.showInformationMessage("MechCommit is running!");

    await addGitCommits();

    if (!stopFlag) {
        window.showInformationMessage("All files are committed!");
        commands.executeCommand("setContext", "mechcommit.active", false);
    }
};

/**
 * This stops the extension
 * @returns {void}
 */
const stopFunc = (): void => {
    stopFlag = true;
    commands.executeCommand("setContext", "mechcommit.active", false);
    window.showInformationMessage("MechCommit has stopped!");
};

/**
 * This method is called when the extension is activated
 * This extension is activated the very first time the command is executed
 * @returns {void}
 */
export function activate(context: ExtensionContext): void {
    const start = commands.registerCommand("mechcommit.run", runFunc);

    const stop = commands.registerCommand("mechcommit.stop", stopFunc);

    context.subscriptions.push(start, stop);
    commands.executeCommand("setContext", "mechcommit.active", false);
}

/**
 * This method is called when this extension is deactivated
 * @returns {void}
 */
export function deactivate(): void {}
//#endregion
