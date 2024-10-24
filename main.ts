import {App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf} from 'obsidian';
import {HeroListView, VIEW_HERO_LIST} from "./src/view/HeroListView";
import {HeroManager} from "./src/data/HeroManager";
import {RegisteredHero} from "./src/data/HeroData";
import {ViewOpener} from "./src/view/ViewOpener";
import {HeroOverview, VIEW_HERO_OVERVIEW} from "./src/view/HeroOverview";
import {TokenizerView, VIEW_TOKENIZER} from "./src/view/TokenizerView";
import {FileWatcher} from "./src/data/FileWatcher";

// Remember to rename these classes and interfaces!

interface DSAPluginSettings {
	heroPath: string;
	optolithPath: string;
	heroesList: RegisteredHero[];
}

const DEFAULT_SETTINGS: DSAPluginSettings = {
	heroPath: "",
	optolithPath: "",
	heroesList: []
}

export default class DSAPlugin extends Plugin {
	settings: DSAPluginSettings;
	heroManager: HeroManager;
	viewOpener: ViewOpener;
	fileWatcher: FileWatcher;

	injectSVGFilter() {
		const svgFilter = `
            <svg style="display:none;">
                <filter id="wavy2">
                    <feTurbulence x="0" y="0" baseFrequency="0.02" numOctaves="5" seed="1" />
                    <feDisplacementMap in="SourceGraphic" scale="20" />
                </filter>
            </svg>
        `;
		document.body.insertAdjacentHTML('afterbegin', svgFilter);
	}

	async onload() {
		this.fileWatcher = new FileWatcher(this);
		this.heroManager = new HeroManager(this);
		this.viewOpener = new ViewOpener(this);
		await this.loadSettings();

		this.injectSVGFilter();

		const dsaRibbon = this.addRibbonIcon('dice', 'Heldenliste', (evt: MouseEvent) => {
			this.viewOpener.openHeroListView();
		});

		// useable anywhere
		this.addCommand({
			id: 'open-characters-view',
			name: 'Heldenliste öffnen',
			callback: () => {
				this.viewOpener.openHeroListView();
			}
		});

		// init settings tab
		this.addSettingTab(new DSASettingsTab(this.app, this));

		// register view
		this.registerView(
			VIEW_HERO_LIST,
			(leaf) => {
				return new HeroListView(leaf, this)
			},
		)

		this.registerView(
			VIEW_HERO_OVERVIEW,
			(leaf) => {
				return new HeroOverview(leaf, this)
			},
		)

		this.registerView(
			VIEW_TOKENIZER,
			(leaf) => {
				return new TokenizerView(leaf, this)
			},
		)

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.heroManager.createHeroFolders();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}

class DSASettingsTab extends PluginSettingTab {
	plugin: DSAPlugin;

	constructor(app: App, plugin: DSAPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Hero Location')
			.setDesc('Where do you want to have your character files saved?')
			.addText(text => text
				.setPlaceholder('/path/to/characters')
				.setValue(this.plugin.settings.heroPath)
				.onChange(async (value) => {
					this.plugin.settings.heroPath = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Optolith install location')
			.setDesc('Where is Optolith installed?')
			.addText(text => text
				.setPlaceholder('/path/to/optolith')
				.setValue(this.plugin.settings.optolithPath)
				.onChange(async (value) => {
					this.plugin.settings.optolithPath = value;
					await this.plugin.saveSettings();
				}));
	}

}
