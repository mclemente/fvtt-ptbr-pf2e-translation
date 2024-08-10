import { build } from "../helper/src/build/build.js";
import { convertDeities, convertJournals } from "./build-converter.js";

const PATHS = ["module.json", "src/babele-register.js", "src/translator", "static", "translation/pt-BR", "LICENSE"];

let targetFolder = process.argv[2];

build(PATHS, targetFolder, {
	"translation/pt-BR/compendium/pf2e.journals.json": convertJournals,
	"translation/pt-BR/compendium/pf2e.deities.json": convertDeities,
});
