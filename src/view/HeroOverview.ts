import {Notice, ViewStateResult, WorkspaceLeaf} from 'obsidian';
import DSAPlugin from "../../main";
import {DSAView} from "./DSAView";
import {HeroData, RegisteredHero, RelationData, RelationTypes} from "../data/HeroData";
import {ConfirmModalStyle, ConfirmWarningModal} from "../modal/ConfirmWarningModal";
import {EditItemModal} from "../modal/EditItemModal";
import {HeroPointModalSettings, ModifyHeroPointModal} from "../modal/ModifyHeroPointModal";
import {ModifyHeroModal} from "../modal/ModifyHeroModal";
import {AddRelationModal} from "../modal/AddRelationModal";

export const VIEW_HERO_OVERVIEW = 'hero-overview';

export class HeroOverview extends DSAView {
	id: string;

	constructor(leaf: WorkspaceLeaf, plugin: DSAPlugin) {
		super(leaf, plugin);
		this.id = "";
	}

	getRegisteredHeroData(): RegisteredHero | undefined {
		return this.plugin.heroManager.getRegisteredHero(this.id);
	}

	async getHeroData(): Promise<HeroData> {
		const heroData = await this.plugin.heroManager.getHeroData(this.id);
		if (!heroData) {
			return new HeroData();
		}
		// @ts-ignore
		return heroData;
	}

	getDisplayText(): string {
		return `${super.getDisplayText()} ${this.getRegisteredHeroData()?.name || 'Unknown Hero'}`;
	}

	getViewType(): string {
		return VIEW_HERO_OVERVIEW;
	}

	async onOpen() {
		// @ts-ignore
		const heroId: string = this.getState()?.id;
		if (heroId) {
			this.id = heroId;
		} else {
			return;
		}

		await super.onOpen();

		const overview = this.createContentElement("hero-overview")

		const heroData = await this.getHeroData();

		const heroPage = overview.createDiv({cls: "hero-page"});

		const relationsCard = this.createPaperCard(heroPage);
		relationsCard.addClasses([ "hero-card", "relations-card" ]);

		const relationsByCategory = new Map<string, RelationData[]>();

		for (let relation of heroData.relations) {
			const category = relation.category;
			if (relationsByCategory.has(category)) {
				// @ts-ignore
				relationsByCategory.get(category).push(relation);
			} else {
				relationsByCategory.set(category, [relation]);
			}
		}

		for (let categoryName of relationsByCategory.keys()) {
			const relations = relationsByCategory.get(categoryName);

			if (!relations) continue;

			const categoryElement = this.createLabel(relationsCard, categoryName);
			categoryElement.addClass("relation-category");

			relations.forEach(relation => {
				const relationElement = categoryElement.createDiv({cls: "relation name button", text: relation.displayName});
				relationElement.onclick = async () => {

					if (relation.relationType == RelationTypes.file) {
						const relationFile = await this.plugin.fileWatcher.getFile(`${this.plugin.heroManager.getHeroFolderPath(heroId)}/${relation.data}`);
                        if (relationFile) {
							await this.app.workspace.getLeaf(true).openFile(relationFile);
                        } else {
							new Notice("Die Referenzdatei wurde nicht gefunden.");
						}
					}
				}
			})
		}

		const leftCard = heroPage.createDiv({cls: "left-card"});

		const attributesCard = this.createPaperCard(leftCard);
		attributesCard.addClasses([ "hero-card", "attributes-card" ]);

		attributesCard.createEl("h1", { cls: "hero-name", text: `${heroData.name || 'Unknown Hero'} ${heroData.title ? `"${heroData.title}"` : ''} ${heroData.familyName || ''} (${heroData.adventurePoints} AP)` });

		const attributes = attributesCard.createDiv({cls: "attributes"});
		this.createLabel(attributes, "MU").createDiv({cls: "attribute shadow mu", text: `${heroData.baseAttributes.courage}`})
		this.createLabel(attributes, "KL").createDiv({cls: "attribute shadow kl", text: `${heroData.baseAttributes.sagacity}`})
		this.createLabel(attributes, "IN").createDiv({cls: "attribute shadow in", text: `${heroData.baseAttributes.intuition}`})
		this.createLabel(attributes, "CH").createDiv({cls: "attribute shadow ch", text: `${heroData.baseAttributes.charisma}`})
		this.createLabel(attributes, "FF").createDiv({cls: "attribute shadow ff", text: `${heroData.baseAttributes.dexterity}`})
		this.createLabel(attributes, "GE").createDiv({cls: "attribute shadow ge", text: `${heroData.baseAttributes.agility}`})
		this.createLabel(attributes, "KO").createDiv({cls: "attribute shadow ko", text: `${heroData.baseAttributes.constitution}`})
		this.createLabel(attributes, "KK").createDiv({cls: "attribute shadow kk", text: `${heroData.baseAttributes.strength}`})

		// Inventory
		const inventoryCard = this.createPaperCard(leftCard);
		inventoryCard.addClasses([ "hero-card", "inventory-card" ])

		const labelWrapper = inventoryCard.createDiv({cls: "inventory-label-wrapper"});
		const inventory = this.createLabel(labelWrapper, "Inventar").createDiv({cls: "inventory "});

		const belongings = heroData.inventory;
		belongings.forEach(item => {
			const itemElement = inventory.createDiv({cls: "item", text: `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}` });
			itemElement.onclick = async () => {
				new EditItemModal(this.plugin, heroId, item, async () => {
					await this.onOpen();
				}).open();
			}
		})

		// add add button as item
		const addItemButton = inventory.createDiv({  cls: "item" });
		addItemButton.createDiv({ text: "+", cls: "add-item" })
		addItemButton.onclick = async () => {
			new EditItemModal(this.plugin, heroId, null, async () => {
				await this.onOpen();
			}).open();
		}

		const portraitCard = this.createPaperCard(heroPage);
		portraitCard.addClasses([ "hero-card", "portrait-card" ]);

		const heroPortrait = portraitCard.createDiv({ cls: "hero-portrait shadow" });

/*		heroPortrait.createDiv({ cls: "tape-section" });
		heroPortrait.createDiv({ cls: "tape-section" });*/

		heroPortrait.style.backgroundImage = `url(${heroData.getAvatar()})`;

		const bars = portraitCard.createDiv({cls: "progress-bars"});

		this.createLabel(bars, "Lebensenergie").appendChild(this.createPointBar(["bg-health"], {
			title: "Lebensenergie",
			description: "Lebensenergie des Helden",
			max: heroData.baseAttributes.lifePoints,
			currentLost: heroData.currentLifePointsLost,
			onSubmit: (max, currentLost) => {
				heroData.baseAttributes.lifePoints = max;
				heroData.currentLifePointsLost = currentLost;
				this.plugin.heroManager.updateHeroData(heroId, heroData);
				this.onOpen();
			}
		}));

		this.createLabel(bars, "Astralenergie").appendChild(this.createPointBar(["bg-astral"], {
			title: "Astralenergie",
			description: "Astralenergie des Helden",
			max: heroData.baseAttributes.arcaneEnergy,
			currentLost: heroData.currentArcaneEnergyLost,
			onSubmit: (max, currentLost) => {
				heroData.baseAttributes.arcaneEnergy = max;
				heroData.currentArcaneEnergyLost = currentLost;
				this.plugin.heroManager.updateHeroData(heroId, heroData);
				this.onOpen();
			}
		}));


		this.createLabel(bars, "Karmaenergie").appendChild(this.createPointBar(["bg-karma"], {
			title: "Karmaenergie",
			description: "Karmaenergie des Helden",
			max: heroData.baseAttributes.karmaEnergy,
			currentLost: heroData.currentKarmaEnergyLost,
			onSubmit: (max, currentLost) => {
				heroData.baseAttributes.karmaEnergy = max;
				heroData.currentKarmaEnergyLost = currentLost;
				this.plugin.heroManager.updateHeroData(heroId, heroData);
				this.onOpen();
			}
		}))

		this.createLabel(bars, "Rüstung").appendChild(this.createPointBar(["bg-armor"], {
			title: "Rüstung",
			description: "Rüstung des Helden",
			max: heroData.baseAttributes.armor,
			currentLost: heroData.baseAttributes.currentArmorLost,
			onSubmit: (max, currentLost) => {
				heroData.baseAttributes.armor = max;
				heroData.baseAttributes.currentArmorLost = currentLost;
				this.plugin.heroManager.updateHeroData(heroId, heroData);
				this.onOpen();
			}
		}))

		overview.createEl('hr');

		const manageButtons = overview.createDiv({cls: "manage-buttons"});

		const deleteButton = manageButtons.createEl("button", { text: "Löschen", cls: "button delete" });
		deleteButton.onclick = () => {
			const modalStyle: ConfirmModalStyle = {
				title: "Held löschen?",
				description: "Soll der ausgewählte Hero wirklich gelöscht werden?",
				confirmButtonText: "Löschen",
				cancelButtonText: "Abbrechen"
			}
			new ConfirmWarningModal(this.plugin, modalStyle, () => {
				this.plugin.heroManager.deleteHero(this.id);
				this.leaf.detach();
				this.plugin.viewOpener.openHeroListView();
			}).open();
		}

		const editButton = manageButtons.createEl("button", { text: "Bearbeiten", cls: "button edit" });
		editButton.onclick = () => {
            new ModifyHeroModal(this.plugin, this.id, () => {
                this.onOpen();
            }).open();
        }

		const updateOptolithButton = manageButtons.createEl("button", { text: "Optolith Datei Aktualisieren", cls: "button" });
		updateOptolithButton.onclick = () => {
			const fileInput = document.createElement('input');
			fileInput.type = 'file';
			fileInput.accept = '.json';
			fileInput.style.display = 'none';

			fileInput.addEventListener('change', async (event) => {
				const target = event.target as HTMLInputElement;
				if (!target.files || !target.files.length) return;

				const file = target.files[0];
				const fileText = await file.text();

				try {
					JSON.parse(fileText);
					new Notice('File uploaded successfully!');
					await this.plugin.heroManager.updateOptoDataSheet(heroId, fileText);
					await this.onOpen();
				} catch (error) {
					new Notice('Invalid JSON file');
				}
			});

			fileInput.click();
		}

		const addRelationButton = manageButtons.createEl("button", { text: "Relation hinzufügen", cls: "button" });
		addRelationButton.onclick = () => {
			new AddRelationModal(this.plugin, heroId, () => {
				this.onOpen();
			}).open();
		}

	}

	createLabel(parent: HTMLElement, labelText: string): HTMLElement {
		const wrapper = parent.createDiv({cls: "labeled-element"})
		wrapper.createDiv({ cls: "labeled-text", text: labelText });
		return wrapper;
	}

	createPointBar(classes: string[], modifySettings: HeroPointModalSettings): HTMLDivElement {
		const progress = createDiv({cls: "progress shadow"});

		progress.onclick = () => {
			new ModifyHeroPointModal(this.plugin, this.id, modifySettings).open();
		}

		const max = modifySettings.max;
		const currentLost = modifySettings.currentLost;
		const current = max - currentLost;

		const progressBar = progress.createDiv({cls: "progress-bar"});
		if (max > 0) {
			progressBar.style.width = `${(current / max) * 100}%`;
		} else {
			progressBar.style.width = "0%";
		}
		progressBar.addClasses(classes);

		progress.createDiv({ cls: "progress-value-label", text: `${current} / ${max}` });

		return progress;
	}

	getState(): Record<string, unknown> {
		return {
			id: this.id
		}
	}

	async setState(
		state: { id: string },
		result: ViewStateResult
	): Promise<void> {
		if (state && typeof state === "object") {
			if (
				"id" in state &&
				state.id &&
				typeof state.id === "string"
			) {
				this.id = state.id;
				this.onOpen();
			}
		}
		super.setState(state, result);
	}

	async onClose() {
	}

	getTitle(): string {
		return `Heldenübersicht`;
	}
}
