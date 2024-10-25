import {Modal, Notice, Setting, ViewStateResult, WorkspaceLeaf} from 'obsidian';
import DSAPlugin from "../../main";
import { DSAView } from "./DSAView";
import {HeroData, Item, RegisteredHero} from "../data/HeroData";
import {ATTR_CHARISMA, ATTR_DEXTERITY, ATTR_AGILITY, ATTR_INTUITION, ATTR_STRENGTH, ATTR_SAGACITY, ATTR_CONSTITUTION, ATTR_COURAGE, OptoDataSheet} from "../data/OptoDataSheet";
import {ConfirmWarningModal, ConfirmModalStyle} from "../modal/ConfirmWarningModal";
import {it} from "node:test";
import {EditItemModal} from "../modal/EditItemModal";

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

		const attributesCard = heroPage.createDiv({cls: "hero-card attributes-card paper"});

		attributesCard.createEl("h1", { cls: "name", text: `${heroData.name || 'Unknown Hero'} ${heroData.title ? `"${heroData.title}"` : ''} ${heroData.familyName || ''} (${heroData.adventurePoints} AP)` });

		attributesCard.createEl("hr");

		const attributes = attributesCard.createDiv({cls: "attributes"});
		this.createLabel(attributes, "MU").createDiv({cls: "attribute shadow mu", text: `${heroData.courage}`})
		this.createLabel(attributes, "KL").createDiv({cls: "attribute shadow kl", text: `${heroData.sagacity}`})
		this.createLabel(attributes, "IN").createDiv({cls: "attribute shadow in", text: `${heroData.intuition}`})
		this.createLabel(attributes, "CH").createDiv({cls: "attribute shadow ch", text: `${heroData.charisma}`})
		this.createLabel(attributes, "FF").createDiv({cls: "attribute shadow ff", text: `${heroData.dexterity}`})
		this.createLabel(attributes, "GE").createDiv({cls: "attribute shadow ge", text: `${heroData.agility}`})
		this.createLabel(attributes, "KO").createDiv({cls: "attribute shadow ko", text: `${heroData.constitution}`})
		this.createLabel(attributes, "KK").createDiv({cls: "attribute shadow kk", text: `${heroData.strength}`})

		attributesCard.createEl("hr");

		// Inventory

		const labelWrapper = attributesCard.createDiv({cls: "inventory-label-wrapper"});
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

		const portraitCard = heroPage.createDiv({cls: "hero-card portrait-card paper"});

		const heroPortrait = portraitCard.createDiv({ cls: "hero-portrait shadow" });
		heroPortrait.style.backgroundImage = `url(${heroData.getAvatar()})`;

		const bars = portraitCard.createDiv({cls: "progress-bars"});

		this.createLabel(bars, "Lebensenergie").appendChild(this.createProgressbar(heroData.lifePoints, heroData.lifePoints - heroData.currentLifePointsLost, ["bg-health"]))

		if (heroData.arcaneEnergy > 0) {
			this.createLabel(bars, "Astralenergie").appendChild(this.createProgressbar(heroData.arcaneEnergy, heroData.arcaneEnergy - heroData.currentArcaneEnergyLost, ["bg-astral"]))
		}

		if (heroData.karmaEnergy > 0) {
			this.createLabel(bars, "Karmaenergie").appendChild(this.createProgressbar(heroData.karmaEnergy, heroData.karmaEnergy - heroData.currentKarmaEnergyLost, ["bg-karma"]))
		}

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

	}

	createLabel(parent: HTMLElement, labelText: string): HTMLElement {
		const wrapper = parent.createDiv({cls: "labeled-element"})
		wrapper.createDiv({ cls: "labeled-text", text: labelText });
		return wrapper;
	}

	createProgressbar(max: number, value: number, classes: string[]): HTMLDivElement {
		const progress = createDiv({cls: "progress shadow"});

		const progressBar = progress.createDiv({cls: "progress-bar"});
		if (max > 0) {
        	progressBar.style.width = `${(value / max) * 100}%`;
		} else {
			progressBar.style.width = "0%";
		}
		progressBar.addClasses(classes);

		progress.createDiv({ cls: "progress-value-label", text: `${value} / ${max}` });

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
