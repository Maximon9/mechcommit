const { execSync } = require("child_process");
const { readdirSync, rmSync, readFileSync } = require("fs");

function main() {
    const changlog_path = "./CHANGELOG.md";
    const packageData = readFileSync("./package.json", { encoding: "utf-8" });
    const extension = JSON.parse(packageData);
    if (
        !("name" in extension) ||
        !("version" in extension) ||
        !("publisher" in extension)
    ) {
        return;
    }
    console.log("Remove previous vsix files");
    const names = readdirSync(".", { encoding: "utf-8" });
    const vsix_file_name = `${extension.name}-${extension.version}.vsix`;
    for (let index = 0; index < names.length; index++) {
        const name = names[index];
        if (name.includes(".vsix") && name !== vsix_file_name) {
            rmSync(`./${name}`);
        }
    }
    console.log("Finished removing previous vsix files");

    const changelogData = readFileSync(changlog_path, { encoding: "utf-8" });

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const changlogDate = `${year}-${month}-${day}`;

    console.log("");
    console.log("Now checking if changelog has the new version details in it");
    const changelogVersionString = `## [${extension.version}] - ${changlogDate}`;
    if (!changelogData.includes(changelogVersionString)) {
        throw Error(
            `You must add "${changelogVersionString}" to the CHANGELOG.md file`
        );
    }
    console.log("Passed the check");

    console.log("");
    console.log("Creating new vsix file with current version");
    try {
        execSync("vsce package", { encoding: "utf-8" });
        console.log("Finished creating the file");
    } catch (_) {
        return;
    }

    console.log("");
    console.log("Publishing the extension");
    try {
        execSync("vsce publish -p [REPLACE SQUARE BRACKETS WITH TOKEN]", {
            encoding: "utf-8",
        });
        console.log("Finished publishing the extension");
    } catch (_) {
        return;
    }
}

main();
