import DSAPlugin from "../../main";
import {HeroData} from "./HeroData";
import {FileSystemAdapter, Notice, TFile, TFolder} from "obsidian";
import {DataSheet} from "./DataSheet";
import {HeroOverview, VIEW_HERO_OVERVIEW} from "../view/HeroOverview";

export class HeroManager {

	readonly plugin: DSAPlugin;

	constructor(plugin: DSAPlugin) {
		this.plugin = plugin;
	}

	async reloadData() {
		await this.plugin.loadSettings();
	}

	validateHeroData() {

		this.plugin.settings.heroesList.forEach(async (value) => {

			const folderName = value.id
			const folderPath = this.plugin.settings.heroPath + "/" + folderName;

			if (!this.plugin.app.vault.getFolderByPath(folderPath)) {
				await this.plugin.app.vault.createFolder(folderPath);
			}
		})
	}

	getHeroData(heroId: string): HeroData | undefined {
		return this.plugin.settings.heroesList.find(hero => hero.id === heroId);
	}

	getHeroDataSheet(heroId: string): Promise<DataSheet | undefined> {
		return new Promise(async (resolve) => {
			const folderPath = this.plugin.settings.heroPath + "/" + heroId;
			const fileName = "data.json";
			const filePath = folderPath + "/" + fileName;

			// Get the file by path
			const file = this.plugin.app.vault.getAbstractFileByPath(filePath) as TFile;

			if (!file) {
				console.error(`File not found: ${filePath}`);
				resolve(undefined); // Resolve with undefined if the file doesn't exist
				return;
			}

			// Read the file and parse it as JSON
			const dataSheet = await this.readJsonFile(file);

			resolve(dataSheet);
		});
	}

	getHeroes(): HeroData[] {
		return this.plugin.settings.heroesList;
	}

	createHero(heroData: HeroData): void {
		this.plugin.settings.heroesList.push(heroData);
		this.plugin.saveSettings();
		this.validateHeroData();
	}

	deleteHero(id: string) {
		const index = this.plugin.settings.heroesList.findIndex(hero => hero.id === id);
		if (index > -1) {
			this.plugin.settings.heroesList.splice(index, 1);
			this.plugin.saveSettings();
		}

		// dont delete for now
		// this.deleteHeroFolder(id).then(r => {});
	}

	async deleteHeroFolder(heroId: string) {
		const folderPath = this.plugin.settings.heroPath + "/" + heroId;
		const folder = this.plugin.app.vault.getAbstractFileByPath(folderPath);
		if (folder) {
			// todo: doesnt really work only deletes files inside the folder
			await this.plugin.app.vault.adapter.rmdir(folderPath, true)

		}
	}

	async pushNewDataSheet(heroId: string, jsonData: string): Promise<void> {
		await this.saveNewDataSheet(heroId, jsonData);

		this.extractPortraitAsFile(heroId).then();
	}

	async extractPortraitAsFile(heroId: string): Promise<void> {
		const heroDataSheet = await this.getHeroDataSheet(heroId);
		const avatar = heroDataSheet?.avatar;
		if (!avatar) return;
		const folderPath = `${this.plugin.settings.heroPath}/${heroId}`;
		const filename = `portrait.png`;
		try {
			await this.saveBase64Image(avatar, `${folderPath}/${filename}`);
		} catch (error) {
			console.error('Failed to save avatar image:', error);
			new Notice(`Failed to save avatar for heroId: ${heroId}`);
		}
	}

	async saveBase64Image(base64Data: string, filePath: string): Promise<void> {
		// Remove the data URL prefix if it exists
		const base64Image = base64Data.replace(/^data:image\/png;base64,/, "");

		// Decode the base64 string
		const binaryString = atob(base64Image);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);

		// Convert binary string to bytes
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		// Create an ArrayBuffer from the Uint8Array
		const arrayBuffer = bytes.buffer;

		// Use the Obsidian API to save the file as binary
		await this.plugin.app.vault.createBinary(filePath, arrayBuffer);
	}


	async saveNewDataSheet(heroId: string, jsonData: string): Promise<void> {
		const folderPath = `${this.plugin.settings.heroPath}/${heroId}`;
		const fileName = "data.json";
		const filePath = `${folderPath}/${fileName}`;

		const folder = this.plugin.app.vault.getAbstractFileByPath(folderPath) as TFolder;

		if (folder) {
			// If the folder exists, save the JSON data to the file
			await this.saveJsonToFile(filePath, jsonData); // Await the saving
		} else {
			// Create the folder if it does not exist
			try {
				await this.plugin.app.vault.createFolder(folderPath); // Await folder creation
				await this.saveJsonToFile(filePath, jsonData); // Await the saving after folder creation
			} catch (error) {
				console.error(`Failed to create folder: ${error}`);
				new Notice(`Error creating folder: ${error.message}`);
			}
		}
	}

	async readJsonFile(file: TFile): Promise<DataSheet | undefined> {
		try {
			const fileContent = await this.plugin.app.vault.read(file);
			const jsonData = JSON.parse(fileContent);
			return DataSheet.fromJson(jsonData);  // Automatically load the object
		} catch (error) {
			console.error(`Error reading JSON file: ${error}`);
			return undefined;
		}
	}

	async saveJsonToFile(filePath: string, jsonData: string): Promise<void> {
		try {
			const blob = new Blob([jsonData], { type: 'application/json' });

			await this.plugin.app.vault.adapter.writeBinary(filePath, await this.blobToArrayBuffer(blob));
		} catch (error) {
			console.error(`Error saving file: ${error}`);
			new Notice(`Error saving file: ${error.message}`);
		}
	}

	async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as ArrayBuffer);
			reader.onerror = reject;
			reader.readAsArrayBuffer(blob);
		});
	}
}


