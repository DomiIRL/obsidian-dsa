import DSAPlugin from "../../main";
import {HeroData, RegisteredHero} from "./HeroData";
import {Notice} from "obsidian";
import {OptoDataSheet} from "./parser/optolith/OptoDataSheet";

export class HeroManager {

	readonly plugin: DSAPlugin;

	constructor(plugin: DSAPlugin) {
		this.plugin = plugin;
	}

	async reloadData() {
		await this.plugin.loadSettings();
	}

	getHeroFolderPath(heroId: string): string {
		return `${this.plugin.settings.heroPath}/${heroId}`;
	}

	getRegisteredHero(heroId: string): RegisteredHero | undefined {
		return this.plugin.settings.heroesList.find(hero => hero.id === heroId);
	}

	getRegisteredHeroes(): RegisteredHero[] {
		return this.plugin.settings.heroesList;
	}

	updateHero(heroData: RegisteredHero) {
		const index = this.plugin.settings.heroesList.findIndex(hero => hero.id === heroData.id);
        if (index > -1) {
            this.plugin.settings.heroesList[index] = heroData;
            this.plugin.saveSettings().then();
        }
	}

	createHero(heroData: RegisteredHero, optoDatasheetRaw: string): void {
		this.plugin.settings.heroesList.push(heroData);
		this.plugin.saveSettings();
		this.createHeroFolders();

		this.plugin.heroManager.updateOptoDataSheet(heroData.id, optoDatasheetRaw).then(r => {
			this.plugin.viewOpener.openHeroOverview(heroData.id);
		});
	}

	deleteHero(id: string) {
		const index = this.plugin.settings.heroesList.findIndex(hero => hero.id === id);
		if (index > -1) {
			this.plugin.settings.heroesList.splice(index, 1);
			this.plugin.saveSettings().then();
		}

		this.deleteHeroFolder(id).then();
	}

	createHeroFolders() {
		this.plugin.settings.heroesList.forEach((value) => {
			this.createHeroFolder(value.id).then()
		});
	}

	async createHeroFolder(heroId: string) {
		await this.plugin.fileWatcher.createFolder(this.getHeroFolderPath(heroId)).then();
	}

	async deleteHeroFolder(heroId: string) {
		await this.plugin.fileWatcher.deleteFolder(this.getHeroFolderPath(heroId));
	}

	async updateOptoDataSheet(heroId: string, optoDataSheetRaw: string): Promise<void> {

		const optoDataSheet = await this.plugin.fileWatcher.readJson<OptoDataSheet>(optoDataSheetRaw, OptoDataSheet.fromJson);
		if (!optoDataSheet) {
            console.error(`Failed to parse optoDataSheet: ${optoDataSheetRaw}`);
            return;
		}
		const heroData = await this.getHeroData(heroId);
		optoDataSheet.writeToHeroData(heroData);

		await this.updateHeroData(heroId, heroData);

		this.extractPortraitAsFile(heroId).then();
	}

	async updateHeroData(heroId: string, heroData: HeroData): Promise<void> {
		const filePath = `${this.plugin.settings.heroPath}/${heroId}/data.json`;
		await this.plugin.fileWatcher.writeObjectToJsonFile(filePath, heroData);
	}

	async getHeroData(heroId: string): Promise<HeroData> {
		return new Promise(async (resolve) => {
			const filePath = `${this.plugin.settings.heroPath}/${heroId}/data.json`;

			const file = await this.plugin.fileWatcher.getFile(filePath);
			let heroData: HeroData | undefined;
			if (file) {
				heroData = await this.plugin.fileWatcher.readJsonFile<HeroData>(file, HeroData.fromJson);
			} else {
				heroData = new HeroData();
			}
			if (heroData) {
				resolve(heroData);
			} else {
				return new HeroData();
			}
		});

	}

	async extractPortraitAsFile(heroId: string): Promise<void> {
		const heroDataSheet = await this.getHeroData(heroId);
		const avatar = heroDataSheet.avatar;
		if (!avatar) return;
		const filename = `portrait.png`;
		try {
			await this.plugin.fileWatcher.saveBase64Image(avatar, `${this.getHeroFolderPath(heroId)}/${filename}`);
		} catch (error) {
			console.error('Failed to save avatar image:', error);
			new Notice(`Failed to save avatar for heroId: ${heroId}`);
		}
	}

}


