// const { spawnSync } = require("child_process")
// const { readdirSync, rmSync, readFileSync} = require("fs")
import { execSync } from "child_process";
import { readdirSync, rmSync, readFileSync } from "fs";

function main() {
    const changlog_path = "./CHANGELOG.md";
    const packageData = readFileSync("./package.json", { encoding: "utf-8" });
    const extension = JSON.parse(packageData);
    if (!("name" in extension) || !("version" in extension)) {
        return;
    }

    const names = readdirSync(".", { encoding: "utf-8" });
    const vsix_file_name = `${extension.name}-${extension.version}.vsix`;
    for (const name in names) {
        if (name.includes(".vsix") && name !== vsix_file_name) {
            rmSync(`./${name}`);
        }
    }

    const changelogData = readFileSync(changlog_path, { encoding: "utf-8" });

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const changlogDate = `${year}-${month}-${day}`;

    const changelogVersionString = `## [${extension.version}] - ${changlogDate}`;
    if (!changelogData.includes(changelogVersionString)) {
        throw Error(
            `You must add "${changelogVersionString}" to the CHANGELOG.md file`
        );
    }

    try {
        const publish = execSync("vsce package", { encoding: "utf-8" });
        const lines = publish.trim().replaceAll("\r", "").split("\n");
        for (const line in lines) {
            if (!line.includes("[DEP0040]") && !line.includes("deprecation")) {
                console.log(line);
            }
        }
    } catch (error) {
        throw error;
    }

    try {
        const publish = execSync(
            "vsce publish -p [REPLACE SQUARE BRACKETS WITH TOKEN]",
            { encoding: "utf-8" }
        );
        const lines = publish.trim().replaceAll("\r", "").split("\n");
        for (const line in lines) {
            if (!line.includes("[DEP0040]") && !line.includes("deprecation")) {
                console.log(line);
            }
        }
    } catch (error) {
        throw error;
    }
}

main();
