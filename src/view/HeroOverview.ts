import {Modal, Notice, Setting, ViewStateResult, WorkspaceLeaf} from 'obsidian';
import DSAPlugin from "../../main";
import { DSAView } from "./DSAView";
import { HeroData } from "../data/HeroData";
import {ATTR_CH, ATTR_FF, ATTR_GE, ATTR_IN, ATTR_KK, ATTR_KL, ATTR_KO, ATTR_MU, DataSheet} from "../data/DataSheet";
import {ConfirmWarningModal, ConfirmModalStyle} from "../modal/ConfirmWarningModal";
import {it} from "node:test";

export const VIEW_HERO_OVERVIEW = 'hero-overview';

export class HeroOverview extends DSAView {
	id: string;

	constructor(leaf: WorkspaceLeaf, plugin: DSAPlugin) {
		super(leaf, plugin);
		this.id = "";
	}

	getHeroData(): HeroData | undefined {
		return this.plugin.heroManager.getHeroData(this.id);
	}

	async getDataSheet(): Promise<DataSheet> {
		const dataSheet = await this.plugin.heroManager.getHeroDataSheet(this.id);
		if (!dataSheet) {
			return new DataSheet();
		}
		// @ts-ignore
		return dataSheet;
	}

	getDisplayText(): string {
		return `${super.getDisplayText()} ${this.getHeroData()?.name || 'Unknown Hero'}`;
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

		const dataSheet = await this.getDataSheet();

		const heroPage = overview.createDiv({cls: "hero-page"});

		const attributesCard = heroPage.createDiv({cls: "hero-card attributes-card"});

		attributesCard.createEl("h1", { cls: "name", text: `${dataSheet.name || 'Unknown Hero'} ${dataSheet.pers.title ? `"${dataSheet.pers.title}"` : ''} ${dataSheet.pers.family || ''} (${dataSheet.ap.total} AP)` });

		attributesCard.createEl("hr");

		const attributes = attributesCard.createDiv({cls: "attributes"});
		this.createLabel(attributes, "MU").createDiv({cls: "attribute shadow mu", text: `${dataSheet?.getAttributeById(ATTR_MU)}`})
		this.createLabel(attributes, "KL").createDiv({cls: "attribute shadow kl", text: `${dataSheet?.getAttributeById(ATTR_KL)}`})
		this.createLabel(attributes, "IN").createDiv({cls: "attribute shadow in", text: `${dataSheet?.getAttributeById(ATTR_IN)}`})
		this.createLabel(attributes, "CH").createDiv({cls: "attribute shadow ch", text: `${dataSheet?.getAttributeById(ATTR_CH)}`})
		this.createLabel(attributes, "FF").createDiv({cls: "attribute shadow ff", text: `${dataSheet?.getAttributeById(ATTR_FF)}`})
		this.createLabel(attributes, "GE").createDiv({cls: "attribute shadow ge", text: `${dataSheet?.getAttributeById(ATTR_GE)}`})
		this.createLabel(attributes, "KO").createDiv({cls: "attribute shadow ko", text: `${dataSheet?.getAttributeById(ATTR_KO)}`})
		this.createLabel(attributes, "KK").createDiv({cls: "attribute shadow kk", text: `${dataSheet?.getAttributeById(ATTR_KK)}`})

		attributesCard.createEl("hr");

		// Inventory
		const inventory = attributesCard.createDiv({cls: "inventory"});

		const belongings = dataSheet.belongings;
		for (let itemsKey in belongings.items) {
			const item = belongings.items[itemsKey];
			inventory.createDiv({cls: "item", text: item.name });
		}

		const portraitCard = heroPage.createDiv({cls: "hero-card portrait-card"});

		const heroPortrait = portraitCard.createDiv({ cls: "hero-portrait shadow" });
		heroPortrait.style.backgroundImage = `url(${dataSheet?.avatar})`;

		const bars = portraitCard.createDiv({cls: "progress-bars"});

		this.createLabel(bars, "Lebensenergie").appendChild(this.createProgressbar(dataSheet.getMaxHealth(), dataSheet.getMaxHealth(), ["bg-health"]))

		const maxAstralEnergy = dataSheet.getMaxAstralEnergy();
		if (maxAstralEnergy > 0) {
			this.createLabel(bars, "Astralenergie").appendChild(this.createProgressbar(maxAstralEnergy, maxAstralEnergy, ["bg-astral"]))
		}

		const maxKarmaEnergy = dataSheet.getMaxKarmaEnergy();
		if (maxKarmaEnergy > 0) {
			this.createLabel(bars, "Karmaenergie").appendChild(this.createProgressbar(maxKarmaEnergy, maxKarmaEnergy, ["bg-karma"]))
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
