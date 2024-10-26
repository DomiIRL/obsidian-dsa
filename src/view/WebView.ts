import {DSAView} from "./DSAView";
import {WorkspaceLeaf} from "obsidian";
import DSAPlugin from "../../main";

export const VIEW_TOKENIZER = 'tokenizer';

export class WebView extends DSAView {

	name: string;
	url: string;

	constructor(leaf: WorkspaceLeaf, plugin: DSAPlugin, name: string, url: string) {
		super(leaf, plugin);
	}

	getTitle(): string {
		return this.name;
	}

	getViewType(): string {
		return VIEW_TOKENIZER;
	}

	getDisplayText(): string {
		return `${super.getDisplayText()}Tokenizer`;
	}

	async onOpen() {
		await super.onOpen();

		// Create a new HTML element for the web view
		const container = this.containerEl;

		// Create an iframe to load the webpage
		const iframe = container.createEl('iframe', {
			attr: {
				src: this.url,
				style: 'width: 100%; height: 100%; border: none;', // Ensure it fills the container
			}
		});
		
	}

}
