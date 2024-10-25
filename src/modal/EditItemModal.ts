import {Modal, Notice, Setting} from "obsidian";
import DSAPlugin from "../../main";
import {Item} from "../data/HeroData";

export class EditItemModal extends Modal {

    constructor(plugin: DSAPlugin, heroId: string, givenItem: Item | null, onSubmit: () => void) {
        super(plugin.app);


        let newItem = false;
        if (!givenItem) {
            newItem = true;
            givenItem = new Item();
        }

        this.setTitle(`Item ${newItem? "hinzufügen" : "bearbeiten"}`);

        let item = givenItem;

        if (item.fromThirdPartySoftware) {
            this.contentEl.createEl("h5", { text: "Dieses item wird von einer Drittanbietersoftware verwaltet!" });
            this.contentEl.createEl("p", { text: "Wenn du es bearbeitest, wird es in Zukunft (bis du es komplett löschst) beim hochladen von neuen Daten ignoriert." });
        }

        const modifiedItem = new Item();
        modifiedItem.name = item.name;
        modifiedItem.quantity = item.quantity;
        modifiedItem.fromThirdPartySoftware = false;

        new Setting(this.contentEl)
            .setName("Itemname")
            .addText(component => {
                component.setValue(item.name);
                component.onChange(async (value) => {
                    modifiedItem.name = value;
                });
            })

        new Setting(this.contentEl)
            .setName("Anzahl")
            .addText(component => {
                component.setValue(item.quantity.toString());

                component.inputEl.type = "number";

                component.onChange(async (value) => {
                    modifiedItem.quantity = parseFloat(value);
                });
            });

        const buttonsSetting = new Setting(this.contentEl);

        if (!newItem) {
            buttonsSetting.addButton(component => {
                component.setButtonText("Löschen")
                component.onClick(async () => {

                    const heroData = await plugin.heroManager.getHeroData(heroId);
                    heroData.removeItem(modifiedItem.name);
                    await plugin.heroManager.updateHeroData(heroId, heroData);

                    onSubmit();
                    this.close();
                });
            })
        }
        buttonsSetting.addButton(component => {
            component.setButtonText("Übernehmen")
            component.onClick(async () => {

                if (modifiedItem.name.trim() === "" || modifiedItem.quantity <= 0) {
                    new Notice("Bitte füllen Sie alle Felder richtig aus!");
                    return;
                }

                const heroData = await plugin.heroManager.getHeroData(heroId);
                heroData.pushItem(modifiedItem);
                await plugin.heroManager.updateHeroData(heroId, heroData);

                onSubmit();
                this.close();
            });
        })

    }
}