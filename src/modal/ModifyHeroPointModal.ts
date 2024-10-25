import {Modal, Setting, TextComponent} from "obsidian";
import DSAPlugin from "../../main";
import {evaluateExpression} from "../data/Mather";

export interface HeroPointModalSettings {
    title: string;
    description: string;
    max: number;
    currentLost: number;
    onSubmit: (max: number, currentLost: number) => void;
}

export class ModifyHeroPointModal extends Modal {

    constructor(plugin: DSAPlugin, heroId: string, settings: HeroPointModalSettings) {
        super(plugin.app);

        this.setTitle(settings.title)

        this.contentEl.createEl("p", { text: settings.description });

        let max = settings.max
        let currentLost = settings.currentLost;
        let current = max - currentLost;

        new Setting(this.contentEl)
            .setName("Maximal")
            .addText(component => {
                component.setValue(`${max}`);

                component.onChange(async (value) => {
                    try {
                        max = evaluateExpression(value);
                        current = max - currentLost;

                    } catch (error) {
                        component.setValue(`${max}`);
                    }
                });
            });

        let currentComponent: TextComponent | undefined;

        new Setting(this.contentEl)
            .setName("Aktuell")
            .addButton(component => {
                component.setButtonText("Zurücksetzen")

                component.onClick(() => {
                    current = max;
                    currentLost = 0;

                    if (currentComponent) {
                        currentComponent.setValue(`${current}`);
                    }

                });
            })
            .addText(component => {
                component.setValue(`${current}`);

                currentComponent = component;

                component.onChange(async (value) => {
                    try {
                        current = evaluateExpression(value);
                        currentLost = max - current;
                    } catch (error) {
                        component.setValue(`${current}`);
                    }
                });
            });

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Abbrechen")
                    .setCta()
                    .onClick(() => {
                        this.close();
                    }))
            .addButton((btn) =>
                btn
                    .setButtonText("Bestätigen")
                    .setCta()
                    .setWarning()
                    .onClick(() => {
                        settings.onSubmit(max, currentLost);
                        this.close();
                    }));


    }

}