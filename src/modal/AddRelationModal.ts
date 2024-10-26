import {Modal, Notice, Setting} from "obsidian";
import DSAPlugin from "../../main";
import {RelationData, RelationTypes} from "../data/HeroData";
import {randomUUID} from "crypto";

export class AddRelationModal extends Modal {
    constructor(plugin: DSAPlugin, heroId: string, onSubmit: () => void) {
        super(plugin.app);

        this.setTitle("Neue Beziehung hinzufügen");

        let category: string = 'Hilfsmaterial';
        let displayName: string = '';
        let type: RelationTypes = RelationTypes.file;
        let data: string = '';

        new Setting(this.contentEl)
            .setName("Kategorie")
            .addText(component => {
                component.setValue(category);
                component.onChange(async (value) => {
                    category = value;
                });
            });

        new Setting(this.contentEl)
            .setName("Anzeigename")
            .addText(component => {
                component.setValue(displayName);
                component.onChange(async (value) => {
                    displayName = value;
                });
            });

        new Setting(this.contentEl)
            .setName("Beziehungstyp")
            .addDropdown(component => {
                component.setValue('file');
                component.addOption('file', 'Datei');
                component.addOption('web', 'Webseite');
                component.addOption('hero', 'Held');
                component.onChange(async (value: string) => {
                    type = RelationTypes[value as keyof typeof RelationTypes];
                });
            });

        new Setting(this.contentEl)
            .setName("Dateipfad / URL / Heldenname")
            .addText(component => {
                component.setValue(data);
                component.onChange(async (value) => {
                    data = value;
                });
            });

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Abbrechen')
                    .onClick(() => {
                        this.close();
                    }))
            .addButton((btn) =>
                btn
                    .setButtonText('Hinzufügen')
                    .setCta()
                    .onClick(async () => {
                        this.close();

                        if (!data || !displayName || !category) {
                            new Notice("Bitte füllen Sie alle Felder aus.")
                        }

                        const relationData: RelationData = {
                            uniqueId: randomUUID(),
                            category: category,
                            displayName: displayName,
                            relationType: type as RelationTypes,
                            data: category,
                        }

                        const heroData = await plugin.heroManager.getHeroData(heroId);
                        heroData.relations.push(relationData);
                        await plugin.heroManager.updateHeroData(heroId, heroData);

                        onSubmit();
                    }));

    }
}