import {Modal, Setting} from "obsidian";
import DSAPlugin from "../../main";
import {HeroCreationData} from "./CreateHeroModal";

export interface ConfirmModalStyle {
	title: string;
	description: string;
	confirmButtonText: string;
	cancelButtonText: string;
}

const defaultStyle: ConfirmModalStyle = {
	title: "Bestätigen?",
    description: "",
    confirmButtonText: "Bestätigen",
    cancelButtonText: "Abbrechen",
}

export class ConfirmWarningModal extends Modal {
	constructor(plugin: DSAPlugin, style: ConfirmModalStyle = defaultStyle, onSubmit: () => void) {
		super(plugin.app);

		this.setTitle(style.title);

		this.contentEl.createEl("p", { text: style.description });

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText(style.cancelButtonText)
					.setCta()
					.onClick(() => {
						this.close();
					}))
			.addButton((btn) =>
				btn
					.setButtonText(style.confirmButtonText)
					.setCta()
					.setWarning()
					.onClick(() => {
						this.close();
						onSubmit();
					}));


	}
}
