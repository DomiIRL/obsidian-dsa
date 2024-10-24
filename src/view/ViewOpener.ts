import {PaneType, ViewState, Workspace, WorkspaceLeaf} from "obsidian";
import {VIEW_HERO_LIST} from "./HeroListView";
import DSAPlugin from "../../main";
import {VIEW_HERO_OVERVIEW} from "./HeroOverview";
import {VIEW_TOKENIZER} from "./TokenizerView";

export class ViewOpener {

	readonly plugin: DSAPlugin;

	constructor(plugin: DSAPlugin) {
		this.plugin = plugin;
	}

	openTokenizerView() {
		this.openOrRevealView(VIEW_TOKENIZER);
	}

	openHeroListView() {
		this.openOrRevealView(VIEW_HERO_LIST);
	}

	openHeroOverview(id: string) {
		this.openView(VIEW_HERO_OVERVIEW, true, { id });
	}

	async openOrRevealView(type: ViewState["type"]) {
		const { workspace } = this.plugin.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(type);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getLeaf(true);
			// @ts-ignore
			await leaf.setViewState({ type: type, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf instanceof WorkspaceLeaf) {
			workspace.revealLeaf(leaf).then(r => {});
		}
	}

	async openView(
		type: ViewState["type"],
		openInNewTab: boolean,
		state: unknown
	) {
		const { workspace } = this.plugin.app;

		const leaf = workspace.getLeaf(openInNewTab);
		await leaf.setViewState({
			type,
		// @ts-ignore
			state,
		});
		workspace.setActiveLeaf(leaf);
	}

}
