// Prevent errors due to data structure changes - thanks to n1xx1 from the italian localization for the coding
function removeMismatchingTypes(fallback, other = {}) {
    for (let k of Object.keys(other)) {
        const replacement = other[k];
        const replacementType = foundry.utils.getType(replacement);

        if (!fallback.hasOwnProperty(k)) {
            delete other[k];
            continue;
        }

        const original = fallback[k];
        const originalType = foundry.utils.getType(original);

        if (replacementType === "Object" && originalType === "Object") {
            removeMismatchingTypes(original, replacement);
            continue;
        }

        if (originalType !== "undefined" && replacementType !== originalType) {
            delete other[k];
        }
    }

    return fallback;
}

// Automated Animations compatibility for translated items - thanks to n1xx1 from the italian localization for the coding

function hookOnAutoAnimations() {
    if (!game.modules.has("autoanimations")) {
        return;
    }

    Hooks.on("AutomatedAnimations-WorkflowStart", (data, animationData) => {
        if (data.item?.flags?.babele?.originalName) {
            data.recheckAnimation = true;
            data.item = AACreateItemNameProxy(data.item, data.item.flags.babele.originalName);
        }

        if (data.ammoItem?.flags?.babele?.originalName) {
            data.recheckAnimation = true;
            data.ammoItem = AACreateItemNameProxy(data.ammoItem, data.ammoItem.flags.babele.originalName);
        }

        if (data.originalItem?.flags?.babele?.originalName) {
            data.recheckAnimation = true;
            data.originalItem = AACreateItemNameProxy(data.originalItem, data.originalItem.flags.babele.originalName);
        }
    });
}

function AACreateItemNameProxy(item, realName) {
    return new Proxy(item, {
        get(target, p, receiver) {
            return "name" === p ? realName : Reflect.get(target, p, receiver);
        },
    });
}

// Patch spell range function - thanks to Kromko from the russian localization for the coding
// Required, because the pf2 system currently checks spell range based on thetext in the range field
// This updates the system's logic to match the localized ranges

function patchSpellRange() {
    libWrapper?.register(
        "pathfinder-2e-pt-br",
        "CONFIG.PF2E.Item.documentClasses.spell.prototype.isMelee",
        function (wrapped) {
            return game.pf2e.system.sluggify(this.system.range.value) === "toque" || wrapped();
        },
        "MIXED"
    );

    libWrapper?.register(
        "pathfinder-2e-pt-br",
        "CONFIG.PF2E.Item.documentClasses.spell.prototype.isRanged",
        function (wrapped) {
            const res = wrapped();
            if (res) return res;
            const slug = game.pf2e.system.sluggify(this.system.range.value);
            const rangeFeet = Math.floor(Math.abs(Number(/^(\d+)-(pés|ft|feet)(?!\w)/.exec(slug)?.at(1))));
            return Number.isInteger(rangeFeet) ? { increment: null, max: rangeFeet } : null;
        },
        "MIXED"
    );
}

Hooks.once("babele.init", () => {
    if (game.babele) {
        game.settings.register("pathfinder-2e-pt-br", "dual-language-names", {
            name: "Nomes em Português e Inglês",
            hint: "Além do nome em português, o nome em inglês também é usado. Nomes em português e inglês.",
            scope: "world",
            type: Boolean,
            default: false,
            config: true,
            requiresReload: true,
        });

        game.babele.register({
            module: "pathfinder-2e-pt-br",
            lang: "pt-BR",
            dir: "translation/pt-BR/compendium",
        });

        game.babele.registerConverters({
            normalizeName: (_data, translation) => {
                return game["pathfinder-2e-pt-br"].normalizeName(translation);
            },
            translateAdventureActorItems: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateItems(data, translation, true, false);
            },
            translateActorDescription: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateActorDescription(data, translation);
            },
            translateActorItems: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateItems(data, translation, true);
            },
            translateAdventureActors: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateArrayOfObjects(data, translation, "adventureActor");
            },
            translateAdventureItems: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateItems(data, translation, false, false);
            },
            translateAdventureJournals: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateArrayOfObjects(data, translation, "adventureJournal");
            },
            translateAdventureJournalPages: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateArrayOfObjects(data, translation, "adventureJournalPage");
            },
            translateAdventureScenes: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateArrayOfObjects(data, translation, "adventureScene");
            },
            translateAdventureTables: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateArrayOfObjects(data, translation, "adventureTable");
            },
            translateDualLanguage: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateDualLanguage(data, translation);
            },
            translateDuration: (data) => {
                return game["pathfinder-2e-pt-br"].translateValue("duration", data);
            },
            translateHeightening: (data, translation) => {
                return game["pathfinder-2e-pt-br"].dynamicObjectListMerge(
                    data,
                    translation,
                    game["pathfinder-2e-pt-br"].getMapping("heightening", true)
                );
            },
            translatePrerequisites: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translatePrerequisites(data, translation);
            },
            translateRange: (data) => {
                return game["pathfinder-2e-pt-br"].translateValue("range", data);
            },
            translateRules: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateRules(data, translation);
            },
            translateSkillSpecial: (data, translation) => {
                return game["pathfinder-2e-pt-br"].dynamicArrayMerge(
                    data,
                    translation,
                    game["pathfinder-2e-pt-br"].getMapping("skillSpecial", true)
                );
            },
            translateSource: (data) => {
                return game["pathfinder-2e-pt-br"].translateValue("source", data);
            },
            translateSpellVariant: (data, translation) => {
                return game["pathfinder-2e-pt-br"].dynamicObjectListMerge(
                    data,
                    translation,
                    game["pathfinder-2e-pt-br"].getMapping("item", true)
                );
            },
            translateTableResults: (data, translation) => {
                return game["pathfinder-2e-pt-br"].translateTableResults(data, translation);
            },
            translateTiles: (data, translation) => {
                return game["pathfinder-2e-pt-br"].dynamicArrayMerge(data, translation, game["pathfinder-2e-pt-br"].getMapping("tile", true));
            },
            translateTime: (data) => {
                return game["pathfinder-2e-pt-br"].translateValue("time", data);
            },
            translateTokens: (data, translation, _dataObject, _translatedCompendium) => {
                return game["pathfinder-2e-pt-br"].translateArrayOfObjects(data, translation, "token");
            },
            translateTokenName: (data, translation, _dataObject, _translatedCompendium, translationObject) => {
                return game["pathfinder-2e-pt-br"].translateTokenName(data, translation, translationObject);
            },
            updateActorImage: (data, _translations, dataObject, translatedCompendium) => {
                return game["pathfinder-2e-pt-br"].updateImage("portrait", data, dataObject, translatedCompendium);
            },
            updateTokenImage: (data, _translations, dataObject, translatedCompendium) => {
                return game["pathfinder-2e-pt-br"].updateImage("token", data, dataObject, translatedCompendium);
            },
        });

        hookOnAutoAnimations();

        patchSpellRange();
    }
});

Hooks.once("i18nInit", () => {
    if (game.i18n.lang === "pt-BR") {
        const fallback = game.i18n._fallback;
        removeMismatchingTypes(fallback, game.i18n.translations);
    }
});
