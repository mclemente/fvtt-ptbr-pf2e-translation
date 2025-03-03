import archiver from "archiver";
import {
    accessSync,
    cpSync,
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    rmSync,
    statSync,
    writeFileSync,
} from "fs";
import { CONFIG_FILE, readJSONFile } from "./config-helper.js";

export const build = (paths, targetFolder, extraConverters) => {
    const configData = readJSONFile(CONFIG_FILE);

    if (targetFolder === undefined && existsSync(CONFIG_FILE)) {
        // We may want to move this higher in case we get more relevant parameters in the config file
        targetFolder = configData.buildPath;
    }

    // Default value in case no folder was given and no preference was found in the config file
    if (targetFolder === undefined) {
        targetFolder = "./build";
    }

    // Check if folder exists and eventually create it
    try {
        accessSync(targetFolder);
    } catch (error) {
        if (error.code === "ENOENT") {
            mkdirSync(targetFolder);
        } else {
            throw error;
        }
    }

    let ignoreFolders = readJSONFile(CONFIG_FILE).ignoreFolders;
    if (ignoreFolders === undefined) {
        ignoreFolders = [];
    }

    // Delete all files and folders below target folder, so we don't get any artifacts from previous builds
    for (const path of readdirSync(targetFolder)) {
        if (ignoreFolders.includes(path)) {
            continue;
        }
        rmSync(targetFolder + "/" + path, { recursive: true });
    }

    const recursiveCopy = (path) => {
        const stats = statSync(path);
        if (stats.isDirectory()) {
            mkdirSync(targetFolder + "/" + path, { recursive: true });
            for (const child of readdirSync(path)) {
                recursiveCopy(path + "/" + child);
            }
        } else {
            if (path.substr(path.length - 5) == ".json") {
                const jsonContent = readJSONFile(path);
                if (extraConverters && extraConverters[path]) {
                    extraConverters[path](jsonContent);
                }

                // Minify JSON
                writeFileSync(targetFolder + "/" + path, JSON.stringify(jsonContent)); //, null, 0));
            } else {
                cpSync(path, targetFolder + "/" + path);
            }
        }
    };

    for (const file of paths) {
        if (ignoreFolders.includes(file)) {
            continue;
        }
        recursiveCopy(file);
    }

    if (configData.createZip) {
        const moduleName = readJSONFile("./module.json").id;
        const output = createWriteStream(`${targetFolder}/${moduleName}.zip`);
        const archive = archiver("zip");
        for (const path of readdirSync(targetFolder)) {
            const stats = statSync(targetFolder + "/" + path);
            if (stats.isDirectory()) {
                archive.directory(targetFolder + "/" + path, moduleName + "/" + path);
            } else {
                archive.file(targetFolder + "/" + path, { name: moduleName + "/" + path });
            }
        }
        archive.pipe(output);
        archive.finalize();
    }
};
