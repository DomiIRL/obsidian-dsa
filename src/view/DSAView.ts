import { IconName, ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import DSAPlugin from "../../main";
import { exec, execSync } from 'child_process';
import {CreateHeroModal} from "../modal/CreateHeroModal";
import {bannerImage} from "../assets/BannerImage";

export abstract class DSAView extends ItemView {

	protected readonly plugin: DSAPlugin;

	protected constructor(leaf: WorkspaceLeaf, plugin: DSAPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	abstract getTitle(): string;

	getDisplayText(): string {
		return "DSA - ";
	}

	getIcon(): IconName {
		return 'dice';
	}

	protected onOpen(): Promise<void> {
		this.containerEl.empty();
		this.containerEl.addClass("dsa-view");

		const header = this.containerEl.createDiv({cls: "header" });

		const banner = header.createDiv({ cls: "banner"});
		banner.style.backgroundImage = `url(${bannerImage})`;

		const navigationBox = header.createDiv({ cls: "navigation-box"});
		const navigation = navigationBox.createEl("ul");

		navigation.createEl("li").createEl("button", { text: "Heldenliste" }).onclick = () => {
			this.plugin.viewOpener.openHeroListView();
		};

		navigation.createEl("li").createEl("button", { text: "Neuer Held" }).onclick = () => {
			new CreateHeroModal(this.plugin, result => {

				if (!result.name || !result.id) {
					new Notice("Bitte Name und ID für den Held angeben");
					return;
				}

				// check if id already exists
				if (this.plugin.heroManager.getRegisteredHero(result.id)) {
					new Notice("Ordnername bereits vergeben");
                    return;
				}

				this.plugin.heroManager.createHero(result.toHeroData(), result.optoDataSheetRaw);


			}).open();
		};

		navigation.createEl("li").createEl("button", { text: "Optolith" }).onclick = () => {
			this.openOptolith();
		};


		navigation.createEl("li").createEl("button", { text: "Tokenizer" }).onclick = () => {
			this.plugin.viewOpener.openTokenizerView();
		};

		header.createEl('h1', {text: this.getTitle()});

		header.createEl("hr");


		return super.onOpen();
	}

	createContentElement(clazz: string = ""): HTMLElement {
		return this.containerEl.createDiv({cls: `content ${clazz}`});
	}

	private openOptolith() {
		let optolithPath = this.plugin.settings.optolithPath;

		if (!optolithPath) {
			new Notice("Bitte den Pfad zu Optolith in den Einstellungen festlegen");
			return;
		}

		// Ensure the path is wrapped in quotes
		if (!optolithPath.startsWith('"') && !optolithPath.endsWith('"')) {
			optolithPath = `"${optolithPath}"`; // Add quotes
		}

		// Check if the program is running and handle accordingly
		if (this.isProgramRunning(optolithPath)) {
			new Notice("Optolith läuft bereits.");
			this.focusExistingProgram(optolithPath);
		} else {
			exec(optolithPath, (error, stdout, stderr) => {
				if (error) {
					new Notice(`Fehler beim Öffnen von Optolith: ${error.message}`);
					return;
				}
			});
		}
	}

	private isProgramRunning(programPath: string): boolean {
		const programName = this.getExecutableName(programPath);

		let command: string;

		// Determine the command based on the operating system
		if (process.platform === 'win32') {
			command = `tasklist | findstr /i ${programName}`;
		} else if (process.platform === 'darwin') {
			command = `pgrep -f ${programName}`;
		} else { // Assume Linux
			command = `pgrep -f ${programName}`;
		}

		try {
			const result = execSync(command, { stdio: 'pipe' });
			return result.length > 0;
		} catch {
			return false; // If execSync throws, it means no instances were found
		}
	}

	private focusExistingProgram(programPath: string) {
		const programName = this.getExecutableName(programPath).replace('.exe', '').replace("\"", ""); // Remove .exe for focusing

		// todo: fix
		// if (process.platform === 'win32') {
		// 	// Use PowerShell to focus the window
		// 	const command = `
        //         powershell -Command "
        //         $app = Get-Process | Where-Object { $_.MainWindowTitle -like '*${programName}*' }
        //         if ($app) {
        //             $handle = $app.MainWindowHandle
        //             [void][System.Runtime.InteropServices.Marshal]::GetTypeFromCLSID([Guid]::NewGuid()).InvokeMember('SetForegroundWindow', 'Invoke', $null, [System.Runtime.InteropServices.Marshal]::GetObject($handle), $null)
        //         }"
        //     `;
		// 	exec(command, (error) => {
		// 		if (error) {
		// 			new Notice(`Fehler beim Fokussieren von Optolith: ${error.message}`);
		// 		}
		// 	});
		// } else if (process.platform === 'darwin') {
		// 	// On macOS, use AppleScript to focus the application
		// 	exec(`osascript -e 'tell application "${programName}" to activate'`, (error) => {
		// 		if (error) {
		// 			new Notice(`Fehler beim Fokussieren von Optolith: ${error.message}`);
		// 		}
		// 	});
		// } else {
		// 	// For Linux, you might need a different approach, like using wmctrl
		// 	exec(`wmctrl -a "${programName}"`, (error) => {
		// 		if (error) {
		// 			new Notice(`Fehler beim Fokussieren von Optolith: ${error.message}`);
		// 		}
		// 	});
		// }
	}

	// Function to extract the executable name from the program path
	private getExecutableName(programPath: string): string {
		const parts = programPath.split(/[/\\]/);
		return parts[parts.length - 1]; // Get the last part which is the executable name
	}

}
