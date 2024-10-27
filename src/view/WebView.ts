import {DSAView} from "./DSAView";
import {ViewStateResult, WorkspaceLeaf} from "obsidian";
import DSAPlugin from "../../main";

export const VIEW_WEB = 'dsa-web';

export class WebView extends DSAView {

	name: string;
	url: string;

	constructor(leaf: WorkspaceLeaf, plugin: DSAPlugin) {
		super(leaf, plugin);
	}

	getTitle(): string {
		return this.name || 'Web View';
	}

	getViewType(): string {
		return VIEW_WEB;
	}

	getDisplayText(): string {
		return `${super.getDisplayText()}${this.name}`;
	}

	async onOpen() {
		await super.onOpen();

		// Create a new HTML element for the web view
		const container = this.containerEl;

		if (!this.url) {
			return;
		}

		// Create an iframe to load the webpage
		const iframe = container.createEl('iframe', {
			attr: {
				src: this.url,
				style: 'width: 100%; height: 100%; border: none;', // Ensure it fills the container
			}
		});
		
	}

	getState(): Record<string, unknown> {
		return {
			name: this.name,
			url: this.url
		}
	}

	async setState(
		state: { url: string, name: string },
		result: ViewStateResult
	): Promise<void> {
		if (state && typeof state === "object") {
			let hadState = false;
			if (
				"name" in state &&
				state.name &&
				typeof state.name === "string"
			) {
				hadState = true;
				this.name = state.name;
			}
			if (
				"url" in state &&
				state.url &&
				typeof state.url === "string"
			) {
				hadState = true;
				this.url = state.url;
			}
			if (hadState) {
				await this.onOpen();
			}
		}
		await super.setState(state, result);
	}

}
