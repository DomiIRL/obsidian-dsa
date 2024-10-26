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
		let heroPagePdf: File | null = null;
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
			.setName('Dateigrundlagen')
			.addButton((button) => {
				button.setButtonText('Optolith JSON').onClick(() => {
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
							button.buttonEl.style.backgroundColor = '#49AF41'
							optoDataSheetRaw = fileText;
						} catch (error) {
							new Notice('Invalid JSON file');
						}
					});

					fileInput.click();
				});
			})
/*			.addButton((button) => {
			button.setButtonText('Heldenbogen PDF').onClick(() => {
				const fileInput = document.createElement('input');
				fileInput.type = 'file';
				fileInput.accept = '.pdf';
				fileInput.style.display = 'none';

				fileInput.addEventListener('change', async (event) => {
					const target = event.target as HTMLInputElement;
					if (!target.files || !target.files.length) return;

					const file = target.files[0];

					if (file && file.type === 'application/pdf') {
						heroPagePdf = file;
						button.buttonEl.style.backgroundColor = '#49AF41'
						new Notice('PDF file uploaded successfully!');
					} else {
						new Notice('Please upload a valid PDF file.');
					}
				});

				fileInput.click();
			});
		})*/
		;

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('Erstellen')
					.setCta()
					.onClick(async () => {
						this.close();
						onSubmit(new HeroCreationData(id, name, optoDataSheetRaw));
						if (heroPagePdf) {
							try {
								const fileData = await this.readFileAsArrayBuffer(heroPagePdf);

								const pdfPath = `${plugin.heroManager.getHeroFolderPath(id)}\overview.pdf`

								await this.app.vault.createBinary(pdfPath, fileData);

								new Notice(`PDF saved to ${pdfPath}`);
								this.close();
							} catch (error) {
								new Notice('Error saving PDF file.');
							}
						}
					}));
	}

	private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as ArrayBuffer);
			reader.onerror = reject;
			reader.readAsArrayBuffer(file);
		});
	}

}
