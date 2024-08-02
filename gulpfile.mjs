// SPDX-FileCopyrightText: 2022 Johannes Loher
// SPDX-FileCopyrightText: 2022 David Archibald
//
// SPDX-License-Identifier: MIT

import fs from "fs-extra";
import gulp from "gulp";
import sourcemaps from "gulp-sourcemaps";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

import rollupStream from "@rollup/stream";

import rollupConfig from "./rollup.config.mjs";

/********************/
/*  CONFIGURATION   */
/********************/

const sourceDirectory = ".";
const distDirectory = "./dist";
const sourceFileExtension = "js";
const staticFiles = ["module.json"];

/********************/
/*      BUILD       */
/********************/

let cache;

/**
 * Build the distributable JavaScript code
 */
function buildCode() {
	return rollupStream({ ...rollupConfig(), cache })
		.on("bundle", (bundle) => {
			cache = bundle;
		})
		.pipe(source(`module.js`))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(`${distDirectory}/module`));
}

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
	gulp.watch(`${sourceDirectory}/src/**/*.${sourceFileExtension}`, { ignoreInitial: false }, buildCode);
	gulp.watch(
		staticFiles.map((file) => `${sourceDirectory}/${file}`),
		{ ignoreInitial: false },
		copyFiles
	);
}

export const build = gulp.series(clean, gulp.parallel(buildCode, copyFiles));

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
