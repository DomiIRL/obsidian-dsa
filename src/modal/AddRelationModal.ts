import {Modal, Notice, Setting} from "obsidian";
import DSAPlugin from "../../main";
import {RelationData, RelationType, RelationViewType} from "../data/HeroData";
import {randomUUID} from "crypto";

export class AddRelationModal extends Modal {
    constructor(plugin: DSAPlugin, heroId: string, onSubmit: () => void) {
        super(plugin.app);

        this.setTitle("Neue Beziehung hinzufügen");

        let category: string = 'Hilfsmaterial';
        let displayName: string = '';
        let type: RelationType = RelationType.file;
        let viewType: RelationViewType = RelationViewType.button;
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
                    type = RelationType[value as keyof typeof RelationType];
                });
            });

        // Only web views are currently working. Until file (image, pdf) embedding doesnt work, this feature does not give enough value for active maintenance.
/*        new Setting(this.contentEl)
            .setName("Interaktionstyp")
            .addDropdown(component => {
                component.setValue('button');
                component.addOption('button', 'Knopf');
                component.addOption('card', 'Karte');
                component.addOption('both', 'Knopf und Karte');
                component.onChange(async (value: string) => {
                    viewType = RelationViewType[value as keyof typeof RelationViewType];
                });
            });*/

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
                            relationType: type as RelationType,
                            relationViewType: viewType as RelationViewType,
                            data: data,
                        }

                        const heroData = await plugin.heroManager.getHeroData(heroId);
                        heroData.relations.push(relationData);
                        await plugin.heroManager.updateHeroData(heroId, heroData);

                        onSubmit();
                    }));

    }
}