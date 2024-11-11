import { window } from "vscode";
import { runGitCommand } from "./runGitCommand";

type GitConfigs = {
    user?: {
        name?: string;
        email?: string;
    };
    diff?: {
        astextplain?: {
            textconv?: string;
        };
    };
    filter?: {
        lfs?: {
            clean?: string;
            smudge?: string;
            process?: string;
            required?: boolean;
        };
        astextplain?: {
            textconv?: string;
        };
    };
    http?: {
        sslbackend?: string;
        sslcainfo?: string;
        postbuffer?: number;
    };
    core?: {
        autocrlf?: boolean;
        fscache?: boolean;
        symlinks?: boolean;
        editor?: string;
    };
    pull?: {
        rebase?: boolean;
    };
    credential?: {
        helper?: string;
        https?: string;
    };
    init?: {
        defaultbranch?: string;
    };
};

function isNumber(string: string) {
    return /^[-+]?\d+(\.)?(\d+)?$/.test(string);
}

const parseGitConfigs = (data: string): GitConfigs => {
    const lines = data.trim().split("\n");
    const configs: { [k: string]: any } = {};
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const split_lines = line.split("=");
        const all_configs = split_lines[0].split(".");
        let config_value: string | boolean | number = split_lines[1];
        config_value =
            config_value === "true" || config_value === "false"
                ? Boolean(config_value)
                : isNumber(config_value)
                ? Number(config_value)
                : config_value;
        let current_configs = configs;
        for (let i = 0; i < all_configs.length; i++) {
            const config = all_configs[i];
            if (!(config in current_configs)) {
                if (i < all_configs.length - 1) {
                    const data = {};
                    current_configs[config] = data;
                    current_configs = data;
                } else {
                    current_configs[config] = config_value;
                }
            } else {
                if (i < all_configs.length - 1) {
                    current_configs = current_configs[config];
                } else {
                    current_configs[config] = config_value;
                }
            }
        }
    }
    return configs as GitConfigs;
};

export const getGitConfigs = (): GitConfigs => {
    try {
        const spawnSyncReturn = runGitCommand("git", ["config", "--list"]);
        if (spawnSyncReturn.stderr !== "") {
            window.showErrorMessage(spawnSyncReturn.stderr);
            return {};
        }
        if (spawnSyncReturn.stdout !== "") {
            return parseGitConfigs(spawnSyncReturn.stdout);
        }
    } catch (error) {
        window.showErrorMessage(
            "Somethinig went wrong when trying to get git configs"
        );
    }
    return {};
};
