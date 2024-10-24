import {Notice, TFile} from "obsidian";
import DSAPlugin from "../../main";
import {OptoDataSheet} from "./DataSheet";

export class FileWatcher {
    plugin: DSAPlugin;

    constructor(plugin: DSAPlugin) {
        this.plugin = plugin;
    }

    async createFolder(folderPath: string): Promise<void> {
        try {
            await this.plugin.app.vault.createFolder(folderPath);
        } catch (error) {}
    }

    async deleteFolder(folderPath: string): Promise<void> {
        try {
            const files = this.plugin.app.vault.getFiles().filter(file => file.path.startsWith(folderPath));
            for (const file of files) {
                try {
                    await this.plugin.app.vault.delete(file);
                    console.log(`Deleted file: ${file.path}`);
                } catch (error) {
                    console.error(`Error deleting file: ${file.path}`, error);
                }
            }
            const folder = this.plugin.app.vault.getFolderByPath(folderPath);
            if (folder) {
                console.log(`Deleted folder: ${folder.path}`);
                await this.plugin.app.vault.delete(folder, true);
            }
        } catch (error) {}
    }

    async getOrCreateFile(filePath: string): Promise<TFile> {
        const fileByPath = this.plugin.app.vault.getFileByPath(filePath);

        if (fileByPath) {
            return fileByPath;
        }

        try {
            return await this.plugin.app.vault.create(filePath, '');
        } catch (error) {
            console.error(`Error creating file: ${filePath}`, error);
            throw error;
        }
    }

    async getFile(filePath: string): Promise<TFile | null> {
        return this.plugin.app.vault.getFileByPath(filePath);
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

    async readJsonFile<T>(file: TFile, fromJson: (data: any) => T): Promise<T | undefined> {
        try {
            const json = await this.plugin.app.vault.read(file);
            const jsonData = JSON.parse(json);
            return fromJson(jsonData);
        } catch (error) {
            console.error(`Error reading JSON file: ${error}`);
            return undefined;
        }
    }

    async readJson<T>(json: string, fromJson: (data: any) => T): Promise<T | undefined> {
        try {
            const jsonData = JSON.parse(json);
            return fromJson(jsonData);
        } catch (error) {
            console.error(`Error reading JSON file: ${error}`);
            return undefined;
        }
    }

    async writeRawJsonToFile(filePath: string, jsonData: string): Promise<void> {
        try {
            const blob = new Blob([jsonData], { type: 'application/json' });

            await this.plugin.app.vault.adapter.writeBinary(filePath, await this.blobToArrayBuffer(blob));
        } catch (error) {
            console.error(`Error saving file: ${error}`);
            new Notice(`Error saving file: ${error.message}`);
        }
    }

    async writeObjectToJsonFile<T>(filePath: string, data: T): Promise<void> {
        try {
            const jsonData = JSON.stringify(data, null, 2); // Converts object to JSON string with formatting
            await this.plugin.app.vault.modify(await this.getOrCreateFile(filePath), jsonData); // Writes the JSON string back to the file
        } catch (error) {
            console.error(`Error writing JSON file: ${error}`);
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

