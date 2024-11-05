import { spawnSync } from "child_process";

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// Testing
