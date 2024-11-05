import { spawnSync } from "child_process";
import { readdirSync, rmSync, readFileSync } from "fs";

const changlog_path = "CHANGELOG.md";
const extension = JSON.parse("package.json");
if (!("name" in extension) || !("version" in extension)) {
    return;
}

const names = readdirSync(".", { encoding: "utf-8" });
const vsix_file_name = `${extension.name}-${extension.version}.vsix`;
for (const name in names) {
    if (".vsix" in name && name !== vsix_file_name) {
        rmSync(`./${name}`);
    }
}

const changelogData = readFileSync(changlog_path, { encoding: "utf-8" });

const date = new Date();
const year = date.getFullYear();
const month = (date.getMonth() + 1).toString().padStart(2, "0");
const day = date.getDate().toString().padStart(2, "0");

const changlogDate = `${year}-${month}-${day}`;

const changelogVersionString = `## [${extension.version}] - ${changlogDate}`;
if (!changelogData.includes(changelogVersionString)) {
    throw Error(
        `You must add "${changelogVersionString}" to the CHANGELOG.md file`
    );
}

let publish = spawnSync(
    "vsce package",
    (shell = True),
    (stdout = __PIPE),
    (stderr = __STDOUT)
);
if (publish.error !== undefined) {
    throw publish.error;
}
let lines = publish.stdout.toString().trim().replaceAll("\r", "").split("\n");
for (const line in lines) {
    if (!line.includes("[DEP0040]") && !line.includes("deprecation")) {
        console.log(line);
    }
}

publish = spawnSync(
    "vsce publish -p [REPLACE SQUARE BRACKETS WITH TOKEN]",
    (shell = True),
    (stdout = __PIPE),
    (stderr = __STDOUT)
);
if (publish.error !== undefined) {
    throw publish.error;
}
lines = publish.stdout.toString().trim().replaceAll("\r", "").split("\n");
for (const line in lines) {
    if (!line.includes("[DEP0040]") && !line.includes("deprecation")) {
        console.log(line);
    }
}
