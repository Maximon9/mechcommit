import { basename } from "path";

export const generateCommitMessage = (
    files: string[],
    prefix?: string
): string => {
    return `${prefix}: ${files.map((file) => basename(file)).join(", ")}`;
};
