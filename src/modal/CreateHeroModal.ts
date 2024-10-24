import {App, Modal, Notice, Setting} from "obsidian";
import DSAPlugin from "../../main";
import {RegisteredHero} from "../data/HeroData";

export class HeroCreationData extends RegisteredHero {

	optoDataSheetRaw: string = '{}';

	constructor(id: string, name: string, optoDataSheetRaw: any) {
		super(id, name);
        this.optoDataSheetRaw = optoDataSheetRaw;
	}

}

export class CreateHeroModal extends Modal {
	constructor(plugin: DSAPlugin, onSubmit: (result: HeroCreationData) => void) {
		super(plugin.app);
		this.setTitle('DSA - Neuer Held');

		let id = '';
		let name = '';
		let optoDataSheetRaw = {};
		new Setting(this.contentEl)
			.setName('Ordnername')
			.addText((text) =>
				text.onChange((value) => {
					id = value;
				}));

		new Setting(this.contentEl)
			.setName('Anzeigename')
			.addText((text) =>
				text.onChange((value) => {
					name = value;
				}));

		new Setting(this.contentEl)
			.setName('Optolith Json Datei')
			.addButton((button) => {
				button.setButtonText('Choose File').onClick(() => {
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
							optoDataSheetRaw = fileText;
						} catch (error) {
							new Notice('Invalid JSON file');
						}
					});

					fileInput.click();
				});
			});

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('Erstellen')
					.setCta()
					.onClick(() => {
						this.close();
						onSubmit(new HeroCreationData(id, name, optoDataSheetRaw));
					}));
	}
}
