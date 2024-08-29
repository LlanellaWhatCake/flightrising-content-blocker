// ==UserScript==
// @name         Flight Rising Content Blocker
// @namespace    http://tampermonkey.net/
// @version      2024-08-27
// @description  Can blur content to help make your flight rising experience safer. *please* use responsibly ^^!  Not to be used in placed of actual medical/doctor assistance or orders, was made just to help :)
// @author       LlanellaWhatCake
// @match        *://*.flightrising.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let userSettings = JSON.parse(localStorage.getItem("flightRisingContentBlocker"));
    if (!userSettings) {
        localStorage.setItem("flightRisingContentBlocker", JSON.stringify({
            primaryGenesBlocked: [],
            secondaryGenesBlocked: [],
            tertiaryGenesBlocked: [],
            eyesBlocked: [],
            itemsBlocked: [],
            familiarsBlocked: [],
            vistasBlocked: [],
            skinIDsBlocked: [],
            apparelBlocked: []
        }));

        userSettings = JSON.parse(localStorage.getItem("flightRisingContentBlocker"));
    }

    let vistaNameIDMap = {
        thirdAnniversary: 15,
        abberationDragons: 150,
        aetherDragons: 177,
        agenderRibbon: 178,
        alcehmicalFormula: 61,
        eyeForButtons: 201,
        ancientAerie: 151,
        animatedStatue: 102,
        arcanist: 96
    }

    let vistaNameVariableMap = {
        "Vista: 3rd Anniversary": "thirdAnniversary",
        "Vista: Aberration Dragons": "abberationDragons",
        "Vista: Aether Dragons": "aetherDragons",
        "Vista: Agender Ribbon": "agenderRibbon",
        "Vista: Alchemical Formula": "alcehmicalFormula",
        "Vista: An Eye For Buttons": "eyeForButtons",
        "Vista: Ancient Aerie": "ancientAerie",
        "Vista: Animated Statue": "animatedStatue",
        "Vista: Arcanist": "arcanist"
    }

    //LOADOUTS, they add on top of whatever you currently have! =========================
    let arachnophobiaLoadout = {
        primaryGenesBlocked: [],
        secondaryGenesBlocked: [],
        tertiaryGenesBlocked: [],
        eyesBlocked: [],
        itemsBlocked: [],
        familiarsBlocked: [],
        vistasBlocked: [],
        skinIDsBlocked: []
    };

    let trypophobiaLoadout = {
        primaryGenesBlocked: [],
        secondaryGenesBlocked: [],
        tertiaryGenesBlocked: [],
        eyesBlocked: [],
        itemsBlocked: [],
        familiarsBlocked: [],
        vistasBlocked: [],
        skinIDsBlocked: []
    };

    let entomophobiaLoadout = { //include aethers here!  They're technically bug dragons
        primaryGenesBlocked: ["Aether"],
        secondaryGenesBlocked: ["Aether"],
        tertiaryGenesBlocked: ["Aether"],
        eyesBlocked: ["Faceted"],
        itemsBlocked: [],
        familiarsBlocked: [],
        vistasBlocked: [],
        skinIDsBlocked: []
    };

    let diseaseInjuryLoadout = {
        primaryGenesBlocked: [],
        secondaryGenesBlocked: [],
        tertiaryGenesBlocked: [],
        eyesBlocked: ["Plague"],
        itemsBlocked: [],
        familiarsBlocked: [],
        vistasBlocked: [],
        skinIDsBlocked: []
    };

    let salivaGoopLoadout = {

    }

    let isBlocking = false;
    let showSettings = false;


    let primaryGenesBlocked = userSettings.primaryGenesBlocked; //***use localStorage to save these!
    let secondaryGenesBlocked = userSettings.secondaryGenesBlocked;
    let tertiaryGenesBlocked = userSettings.tertiaryGenesBlocked;
    let eyesBlocked = userSettings.eyesBlocked;
    let itemsBlocked = userSettings.itemsBlocked; //items can also appear on dragon pages and forum posts
    let familiarsBlocked = userSettings.familiarsBlocked;
    let vistasBlocked = userSettings.vistasBlocked; //don't forget vistas can appear on dragon profiles too!
    let skinIDsBlocked = userSettings.skinIDsBlocked;
    //TODO: maybe try to block images hosted offsite if the dragon/familiar on the page is blocked for extra saftey?  Since there may be art of them!

    doContentBlockCheck();
    addSettingsWidget();

    function refreshUserSettings() {
        let userSettings = JSON.parse(localStorage.getItem("flightRisingContentBlocker"));
        if (!userSettings) {
            localStorage.setItem("flightRisingContentBlocker", JSON.stringify({
                primaryGenesBlocked: [],
                secondaryGenesBlocked: [],
                tertiaryGenesBlocked: [],
                eyesBlocked: [],
                itemsBlocked: [],
                familiarsBlocked: [],
                vistasBlocked: [],
                skinIDsBlocked: []
            }));
        }


        primaryGenesBlocked = userSettings.primaryGenesBlocked; //***use localStorage to save these!
        secondaryGenesBlocked = userSettings.secondaryGenesBlocked;
        tertiaryGenesBlocked = userSettings.tertiaryGenesBlocked;
        eyesBlocked = userSettings.eyesBlocked;
        itemsBlocked = userSettings.itemsBlocked;
        familiarsBlocked = userSettings.familiarsBlocked;
        vistasBlocked = userSettings.vistasBlocked; //don't forget vistas can appear on dragon profiles too!
        skinIDsBlocked = userSettings.skinIDsBlocked;
    }

    function doContentBlockCheck() {

        let dragonInfoPage = false;
        let lairPage = false;
        let inventory = false;
        let forums = false;
        //NO marketplace as that might cause a gameplay advantage - you can blur out things you're not interested in to get items you do want faster?

        let needToBlockDragonProfile = false; //**need to eventually make it where you can block a single dragon on a lair while keeping others! */
        let containsList = [];

        //dragon profiles=====================
        //block dragon, familiar, apparel, skins, vistas, items in description, tooltips if possible
        if (document.getElementsByClassName("dragon-profile-stat-icon-value").length > 1) {
            dragonInfoPage = true;

            let dragonInfoPieces = document.getElementsByClassName("dragon-profile-stat-icon-value");
            let familiarInfo = document.getElementById("dragon-profile-familiar-type");

            let blockMapping = {
                0: primaryGenesBlocked,
                1: secondaryGenesBlocked,
                2: tertiaryGenesBlocked,
                3: eyesBlocked,
                4: itemsBlocked,
                5: familiarsBlocked,
                6: vistasBlocked,
                7: skinIDsBlocked
            }

            //check dragon image
            for (let i = 0; i < dragonInfoPieces.length; i++) {
                //prep
                let tokens = dragonInfoPieces.item(i).textContent;
                tokens = tokens.replace(/\s+/g, ' ').trim();
                tokens = tokens.split(" ");

                //Loop through all
                Object.keys(blockMapping).forEach((blockItem, index) => {
                    if (tokens.some(token => {
                        let included = blockMapping[index].includes(token);
                        if (included) containsList.push(token);
                        return included;
                    })) {
                        blockDragonInfoPage();
                    }
                });
            }

            //check familiar image and tooltip if dragon has a familiar
            if (familiarInfo) {
                let tokens = familiarInfo.textContent;
                tokens = tokens.split(" ");

                if (tokens.some(token => {
                    let included = familiarsBlocked.includes(token);
                    if (included) containsList.push(token);
                    return included;
                })) {
                    needToBlockDragonProfile = true;
                }
            }

            function blockDragonInfoPage() {
                let dragonImageFrame = document.getElementById("dragon-profile-dragon-frame");
                let dragonImage = dragonImageFrame.getElementsByTagName("img")[0];

                dragonImage.style.filter = 'blur(20px)';

                let blockInfoContainer = document.createElement("div");
                blockInfoContainer.style = "position: fixed; left: -150px; z-index: 1000; width: 150px";
                blockInfoContainer.id = "block-info-container";

                let blockNotice = document.createElement("p");
                let blockText = document.createTextNode("This page contains blocked elements - " + containsList);
                blockNotice.style = "background: #d4bb77; padding: 5px; border-radius: 5px; color: black;";
                blockNotice.appendChild(blockText);

                blockInfoContainer.appendChild(blockNotice);

                document.getElementById("dragon-profile-dragon-frame").insertBefore(blockInfoContainer, dragonImage);

                isBlocking = true;
            }
        }
    }

    function addSettingsWidget() {
        //add editing widget layout================================
        let editSettingsWidget = document.createElement("div");
        editSettingsWidget.style = "cursor: pointer; width: 200px; background: #d4bb77; padding: 10px; border-radius: 5px; color: black; position: fixed; bottom: 25px; z-index: 1000";
        let editSettingsNotExpanded = document.createTextNode("Click to edit content blocking settings");
        editSettingsWidget.id = "expand-content-block-settings";
        editSettingsWidget.appendChild(editSettingsNotExpanded);

        let editSettingsExpanded = document.createElement("div");
        editSettingsExpanded.id = "edit-settings-expanded";
        editSettingsExpanded.style = "display: flex; visibility: collapse; width: 1000px; min-height: 200px; max-height: 1500px; height: 500px; background: #d4bb77; padding: 10px; border-radius: 5px; color: black; position: fixed; bottom: 25px; overflow: auto;";

        let editSettingsCollapse = document.createTextNode("Click to collapse");
        let editSettingsCollapseDiv = document.createElement("div");
        editSettingsCollapseDiv.id = "collapse-content-block-settings";
        editSettingsCollapseDiv.style = "cursor: pointer";
        editSettingsCollapseDiv.appendChild(editSettingsCollapse);

        editSettingsExpanded.appendChild(editSettingsCollapseDiv);

        editSettingsWidget.appendChild(editSettingsExpanded);
        document.body.appendChild(editSettingsWidget);

        createBlockingSection("primary");
        createBlockingSection("secondary");
        createBlockingSection("tertiary");
        createBlockingSection("eyes");
        createBlockingSection("items");
        createBlockingSection("familiars");
        createBlockingSection("vistas");
        createBlockingSection("skin IDs");

        document.getElementById("expand-content-block-settings").onclick = function (event) {
            event.stopPropagation();
            document.getElementById("edit-settings-expanded").style["visibility"] = "visible";
            document.getElementById("expand-content-block-settings").style["visibility"] = "collapse";
        }

        document.getElementById("collapse-content-block-settings").onclick = function () {
            event.stopPropagation();
            document.getElementById("edit-settings-expanded").style["visibility"] = "collapse";
            document.getElementById("expand-content-block-settings").style["visibility"] = "visible";
        }

        document.getElementById("edit-settings-expanded").style["visibility"] = "collapse";
        document.getElementById("expand-content-block-settings").style["visibility"] = "visible";


        function createBlockingSection(sectionName) {
            let genesContainer = document.createElement("div");
            genesContainer.id = `${sectionName}-genes-blocked-container`;
            genesContainer.style = "display: flex; flex-direction: column; margin: 3px; padding: 10px; width: 200px; min-width: 200px; min-height: 200px; height: 450px; max-height: 800px; overflow: auto; border: 2px solid #a37c49; border-radius: 5px; background-image: linear-gradient(#d9c1a3, #b8a184);"

            document.getElementById("edit-settings-expanded").appendChild(genesContainer);

            let genesContainerRef = document.getElementById(`${sectionName}-genes-blocked-container`);

            let genesLabel = document.createTextNode(`${sectionName} Genes Blocked`);
            let genesAddInput = document.createElement("input");
            genesAddInput.id = `${sectionName}-gene-add-input`;

            let geneButton = document.createElement("button");
            let geneButtonText = document.createTextNode("Add");
            geneButton.id = `${sectionName}-gene-add`;
            geneButton.appendChild(geneButtonText);

            genesContainer.appendChild(genesLabel);
            genesContainer.appendChild(genesAddInput);
            genesContainerRef.appendChild(geneButton);

            //Add rows of the blocked section genes ==============================
            let blockedContentCheck = [];
            let blockedContentObjectName = "";

            switch (sectionName) {
                case 'primary':
                    blockedContentCheck = primaryGenesBlocked;
                    blockedContentObjectName = "primaryGenesBlocked";
                    break;
                case 'secondary':
                    blockedContentCheck = secondaryGenesBlocked;
                    blockedContentObjectName = "secondaryGenesBlocked";
                    break;
                case 'tertiary':
                    blockedContentCheck = tertiaryGenesBlocked;
                    blockedContentObjectName = "tertiaryGenesBlocked";
                    break;
                case 'eyes':
                    blockedContentCheck = eyesBlocked;
                    blockedContentObjectName = "eyesBlocked";
                    break;
                case 'items':
                    blockedContentCheck = itemsBlocked;
                    blockedContentObjectName = "itemsBlocked";
                    break;
                case 'familiars':
                    blockedContentCheck = familiarsBlocked;
                    blockedContentObjectName = "familiarsBlocked";
                    break;
                case 'vistas':
                    blockedContentCheck = vistasBlocked;
                    blockedContentObjectName = "vistasBlocked";
                    break;
                case 'skins':
                    blockedContentCheck = skinIDsBlocked;
                    blockedContentObjectName = "skinIDsBlocked";
                    break;
                default:
                    break;
            }

            blockedContentCheck?.forEach((blockedItem) => {
                let geneLabel = `${blockedItem}`;

                let geneTextDiv = document.createElement("div");
                let geneText = document.createTextNode(blockedItem);

                geneTextDiv.appendChild(geneText);
                geneTextDiv.style = "margin: 3px; padding: 2px; border-bottom: 1px solid #a37c49; display: flex; justify-content: space-between;";
                geneTextDiv.id = `${blockedItem}-gene_${geneLabel.replace(" ", "_")}`;

                let geneDeleteButton = document.createElement("button");
                let geneDeleteButtonText = document.createTextNode("Remove");
                geneDeleteButton.id = `${blockedItem}-gene-remove_${geneLabel.replace(" ", "_")}`;
                geneDeleteButton.appendChild(geneDeleteButtonText);

                geneTextDiv.appendChild(geneDeleteButton);

                genesContainerRef.appendChild(geneTextDiv);
            });

            //Add gene button function ========================================
            document.getElementById(`${sectionName}-gene-add`).onclick = function () {
                let geneItemInput = document.getElementById(`${sectionName}-gene-add-input`);

                if (geneItemInput.value && !blockedContentCheck.includes(geneItemInput.value)) {
                    blockedContentCheck.push(geneItemInput.value);
                    localStorage.setItem("flightRisingContentBlocker", JSON.stringify({
                        ...userSettings, [blockedContentObjectName]: blockedContentCheck
                    }));

                    refreshUserSettings();
                    doContentBlockCheck();

                    let newGeneTextDiv = document.createElement("div");
                    let newGeneText = document.createTextNode(geneItemInput.value);

                    let newGeneLabel = `${geneItemInput.value}`;
                    let geneName = `${geneItemInput.value}`;

                    newGeneTextDiv.appendChild(newGeneText);
                    newGeneTextDiv.style = "margin: 3px; padding: 2px; border-bottom: 1px solid #a37c49; display: flex; justify-content: space-between;";
                    newGeneTextDiv.id = `${sectionName}-gene_${newGeneLabel.replace(" ", "_")}`;

                    let newGeneDeleteButton = document.createElement("button");
                    let newGeneDeleteButtonText = document.createTextNode("Remove");
                    newGeneDeleteButton.id = `${sectionName}-gene-remove_${newGeneLabel.replace(" ", "_")}`;

                    newGeneDeleteButton.onclick = function () {
                        //remove from list first, then remove element
                        let indexToSplice = blockedContentCheck.indexOf(geneName);

                        if (indexToSplice > -1) {
                            blockedContentCheck.splice(indexToSplice, 1);
                            localStorage.setItem("flightRisingContentBlocker", JSON.stringify({
                                ...userSettings, [blockedContentObjectName]: blockedContentCheck
                            }));

                            document.getElementById(`${sectionName}-gene_` + newGeneLabel).remove();

                            refreshUserSettings();
                            doContentBlockCheck();
                        }
                    };

                    newGeneDeleteButton.appendChild(newGeneDeleteButtonText);

                    newGeneTextDiv.appendChild(newGeneDeleteButton);

                    genesContainerRef.appendChild(newGeneTextDiv);
                    geneItemInput.value = "";
                }
            };

            //Remove gene button function ======================
            blockedContentCheck.forEach((blockedItem) => {
                let geneRemoveLabel = `${blockedItem}`;
                let geneRemoveButton = document.getElementById(`${blockedItem}-gene-remove_` + geneRemoveLabel.replace(" ", "_"));

                geneRemoveButton.onclick = function () {
                    //remove from list first, then remove element
                    let indexToSplice = blockedContentCheck.indexOf(blockedItem);

                    if (indexToSplice > -1) {
                        blockedContentCheck.splice(indexToSplice, 1);
                        localStorage.setItem("flightRisingContentBlocker", JSON.stringify({
                            ...userSettings, [blockedContentObjectName]: blockedContentCheck
                        }));

                        document.getElementById(`${blockedItem}-gene_${geneRemoveLabel.replace(" ", "_")}`).remove();

                        refreshUserSettings();
                        doContentBlockCheck();
                    }
                }
            });
        }
    }
    //End!
})();