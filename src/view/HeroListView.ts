import {WorkspaceLeaf} from 'obsidian';
import DSAPlugin from "../../main";
import {HeroData} from "../data/HeroData";
import {DSAView} from "./DSAView";

export const VIEW_HERO_LIST = 'hero-list';

export class HeroListView extends DSAView {

	constructor(leaf: WorkspaceLeaf, plugin: DSAPlugin) {
		super(leaf, plugin);

		this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf) => {
			// Check if the currently active leaf's view is the one you want to update
			if (leaf.view instanceof HeroListView) {
				this.onOpen();
			}
		}));
	}

	getViewType(): string {
		return VIEW_HERO_LIST;
	}

	getDisplayText(): string {
		return `${super.getDisplayText()}Heldenliste`;
	}

	getTitle(): string {
		return "Deine Helden";
	}

	async onOpen() {
		await super.onOpen();

		const listContainer = this.createContentElement(VIEW_HERO_LIST);

		const { heroManager } = this.plugin;

		heroManager.validateHeroData();

		const heroes = heroManager.getHeroes();

		const heroList = listContainer.createDiv();
		heroList.addClass("dsa-hero-list");
		for (let i = 0; i < heroes.length; i++) {
			const hero: HeroData = heroes[i];

			const heroItemWrapper = heroList.createDiv();
			heroItemWrapper.addClass("hero-item-wrapper");

			const heroItem = heroItemWrapper.createEl("button");

			heroItem.addClass("hero-item");

			heroManager.getHeroDataSheet(hero.id).then(value => {
				if (!value) return;
				heroItem.style.backgroundImage = `url(${value.avatar})`;
			});

			const nameWrapper = heroItemWrapper.createDiv();
			nameWrapper.addClass("name-wrapper");
			nameWrapper.createDiv({ text: hero.name }).addClass("name")

			heroItem.onclick = () => {
				this.plugin.viewOpener.openHeroOverview(hero.id);
			};
		}
	}

	async onClose() {
		// Nothing to clean up.
	}

}
