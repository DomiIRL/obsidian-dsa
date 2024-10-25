import {App, Modal, Notice, Setting} from "obsidian";
import DSAPlugin from "../../main";
import {RegisteredHero} from "../data/HeroData";

export class ModifyHeroModal extends Modal {
	constructor(plugin: DSAPlugin, heroId: string, onSubmit: () => void) {
		super(plugin.app);
		this.setTitle('DSA - Held Bearbeiten');

		let name = plugin.heroManager.getRegisteredHero(heroId)?.name || '';

		new Setting(this.contentEl)
			.setName('Anzeigename')
			.setDesc("Der Tabname wird erst beim erneuten öffnen aktualisiert.")
			.addText((text) => {
				text.setValue(name);
				text.onChange((value) => {
					name = value;
				})});

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('Bearbeiten')
					.setCta()
					.onClick(async () => {
						this.close();

						const registeredData = plugin.heroManager.getRegisteredHero(heroId);
						if (registeredData) {
                            registeredData.name = name;
							plugin.heroManager.updateHero(registeredData);
                        }
						onSubmit();
					}));
	}
}
