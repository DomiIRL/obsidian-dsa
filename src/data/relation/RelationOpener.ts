import {RelationData, RelationType} from "../HeroData";
import DSAPlugin from "../../../main";
import {Notice} from "obsidian";

export function getFullVaultPath(plugin: DSAPlugin, heroId: string, relativePath: string): string {
    return `${plugin.heroManager.getHeroFolderPath(heroId)}/${relativePath}`;
}

export async function handleRelationOpen(plugin: DSAPlugin, heroId: string, relation: RelationData) {

    if (relation.relationType == RelationType.file) {
        const relationFile = await plugin.fileWatcher.getFile(getFullVaultPath(plugin, heroId, relation.data));
        if (relationFile) {
            await this.app.workspace.getLeaf(true).openFile(relationFile);
        } else {
            new Notice("Die Referenzdatei wurde nicht gefunden.");
        }
    } else if (relation.relationType == RelationType.web) {
        plugin.viewOpener.openWebView(relation.displayName, relation.data);
    } else if (relation.relationType == RelationType.hero) {

        if (plugin.heroManager.getRegisteredHeroes().some(h => h.id === relation.data)) {
            plugin.viewOpener.openHeroOverview(relation.data);
        } else {
            new Notice(`Der Referenzheld "${relation.data}" wurde nicht gefunden.`);
        }

    }

}

export async function createRelationEmbed(plugin: DSAPlugin, heroId: string, parent: HTMLElement, relation: RelationData) {

    if (relation.relationType === RelationType.hero) {
        new Notice("Eingebettete Heldenkarten werden nicht unterstützt.");
    } else if (relation.relationType === RelationType.file) {
        new Notice("Eingebettete Dateien werden noch nicht unterstützt.");

        /*const vaultFilePath = getFullVaultPath(plugin, heroId, relation.data);

        const getFileExtension = (filename: string) => {
            // @ts-ignore
            return filename.split('.').pop().toLowerCase();
        };

        const fileType = getFileExtension(vaultFilePath);

        const fullFile= await plugin.fileWatcher.getFile(vaultFilePath);
        const fullFilePath = `${plugin.app.vault.getRoot().path}/${vaultFilePath}`;

        if (fullFile == null) {
            return parent.createDiv({ text: relation.data });
        }

        if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(fileType)) {
            parent.createEl('img', {
                attr: {
                    src: 'Hero/Douma/tiger.png',
                    alt: fullFilePath,
                }
            });
        }

        else if (fileType === 'pdf') {
            parent.createEl('iframe', {
                attr: {
                    src: `file://${vaultFilePath}`,
                }
            });
        }
        else {
            parent.createDiv({ text: `File type ${fileType} is not supported for embedding.` });
        }*/
    } else {
        parent.createEl('iframe', {
            attr: {
                src: relation.data,
            }
        });
    }
}