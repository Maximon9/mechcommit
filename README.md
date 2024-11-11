# MechCommit Extension

First off, huge props to safdar-azeem on github for leading me in the right direction.
This extension tries to make commiting way more easily. It auto generates messages and then automatically commits.

## Features

The MechCommit extension offers these following features:

-   Automatic Committing: This extension automatically adds and commits new files to the Git repository. It makes manually commiting unnecessary.

-   Auto Commit Message: This extension automatically generates commit messages based on what is being committed. An example of what this might look like is `Added: test.json, test1.json; Updated: test2.json, test3.json; Deleted: test4.json, test4.json`

-   Deletion Handling: When a file is deleted, the extension will detect it and creates a commit message saying it's been deleted.

-   Stop Command: The extension provides a stop command that allows users to halt the automatic commit process if necessary.

-   Git Config Validation: This extension will make sure that the git configs that are needed to commit are valid. These configs are user.name and user.email. If for some reason these configs are empty or invalid, the extension will ask you to provide them.

## Requirements

-   You gotta have git.
-   Make sure you have a Git repository initialized in your workspace.

## Extension Settings

-   `mechcommit.stopTime`: Lets the extension know how much time in seconds you want it to give you to stop after extension before it starts committing.
-   `mechcommit.actionStrings.addedFiles`: This allows you to change the currenlty highlighted text in the example commit message **_<mark style="background: yellow" >Added</mark>: test.json, test1.json;_**
-   `mechcommit.actionStrings.updatedFiles`: This allows you to change the currenlty highlighted text in the example commit message **_<mark style="background: yellow" >Updated</mark>: test2.json, test3.json;_**
-   `mechcommit.actionStrings.deletedFiles`: This allows you to change the currenlty highlighted text in the example commit message **_<mark style="background: yellow" >Deleted</mark>: test4.json, test4.json._**
-   `mechcommit.PreCommitCommand`: This runs a git command before the commit.
-   `mechcommit.runPostCommitCommand`: If true, this runs the git post commit command that is set in your settings, which runs after a successful commit.
-   `mechcommit.overridePostCommitCommand`: This overrides the current post commit command, which runs after a successful commit.

## Usage

-   Open Visual Studio Code.
-   Make sure you have a Git repository initialized in your workspace.
-   Open the Git source control panel by clicking on the Git icon in the activity bar on the sidebar.

#### Run button:

-   In the source control panel at the top, click on the "MechCommit Cog Wheel" icon button to run the automatic commit process.
-   This will start committing files after the timer, which gives you time to stop the process ends.

#### Stop button:

-   While the extension is running, and the timer hasn't finished, you can click on the "MechCommit Cog Wheel" icon button again to stop the automatic commit process.

## Known Issues

None that I know off yet.

If you have any issues please report [here](https://github.com/Maximon9/mechcommit/issues)
