// SPDX-FileCopyrightText: 2022 Johannes Loher
// SPDX-FileCopyrightText: 2022 David Archibald
//
// SPDX-License-Identifier: MIT

import fs from "fs-extra";
import gulp from "gulp";

/********************/
/*  CONFIGURATION   */
/********************/

const sourceDirectory = ".";
const distDirectory = "./dist";
const staticFiles = ["module.json"];

/********************/
/*      BUILD       */
/********************/

/**
 * Copy static files
 */
async function copyFiles() {
	for (const file of staticFiles) {
		if (fs.existsSync(`${sourceDirectory}/${file}`)) {
			await fs.copy(`${sourceDirectory}/${file}`, `${distDirectory}/${file}`);
		}
	}
	if (fs.existsSync(`${sourceDirectory}/lang/pt-BR`)) {
		await fs.copy(`${sourceDirectory}/lang/pt-BR`, `${distDirectory}/lang`);
	}
}

/**
 * Watch for changes for each build step
 */
export function watch() {
	gulp.watch(
		staticFiles.map((file) => `${sourceDirectory}/${file}`),
		{ ignoreInitial: false },
		copyFiles
	);
}

export const build = gulp.series(clean, gulp.parallel(copyFiles));

/********************/
/*      CLEAN       */
/********************/

/**
 * Remove built files from `dist` folder while ignoring source files
 */
export async function clean() {
	const files = [...staticFiles, "lang"];

	console.log(" ", "Files to clean:");
	console.log("   ", files.join("\n    "));

	for (const filePath of files) {
		await fs.remove(`${distDirectory}/${filePath}`);
	}
}
