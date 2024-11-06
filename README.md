# MechCommit Extension

First off, huge props to safdar-azeem on github for leading me in the right direction.
This extension tries to make commiting way more easily. It auto generates messages and then automatically commits.

## Features

The MechCommit extension offers these following features:

-   Automatic Committing: This extension automatically adds and commits new files to the Git repository. It makes manually commiting unnecessary.

-   Auto Commit Message: This extension automatically generates commit messages based on what is being committed. An example of what this might look like is `Added: test.json, test1.json; Updated: test2.json, test3.json; Deleted: test4.json, test4.json`

-   Deletion Handling: When a file is deleted, the extension will detect it and creates a commit message saying it's been deleted.

-   Stop Command: The extension provides a stop command that allows users to halt the automatic commit process if necessary.

## Requirements

-   You gotta have git.
-   Make sure you have a Git repository initialized in your workspace.

## Extension Settings

This extension contributes the following settings:

-   `mechcommit.stopTime`: Lets the extension know how much time in milliseconds you want it to give you in order to stop after it has ran.
-   `mechcommit.actionStrings.addedFiles`: This allows you to change the currenlty highlighted text in the example <span style="background-color: #FFFF00">Added</span>: test.json, test1.json;
-   `mechcommit.actionStrings.updatedFiles`: This allows you to change the currenlty highlighted text in the example ==Updated==: test2.json, test3.json;
-   `mechcommit.actionStrings.deletedFiles`: This allows you to change the currenlty highlighted text in the example ==Deleted==: test4.json, test4.json.
-   `mechcommit.PreCommitCommand`: This runs a git command before the commit.
-   `mechcommit.runPostCommitCommand`: If true, runs the post commit command if there is one set.
-   `mechcommit.overridePostCommitCommand`: This overrides the current post commit command, which runs after a successful commit.

## Usage

-   Open Visual Studio Code.
-   Make sure you have a Git repository initialized in your workspace.
-   Open the Git source control panel by clicking on the Git icon in the activity bar on the sidebar.
    Run button
-   In the source control panel at the top, click on the run "Commit Cog Wheel" icon button to run the automatic commit process.
-   The Auto Commit Master will start automatically committing files in the background
    Stop button
-   while the extension is running, you can click on the stop "Commit Cog Wheel" icon button to stop the automatic commit process.

## Known Issues

None that I know off yet.

If you have any issues please report [here](https://github.com/Maximon9/mechcommit/issues)
