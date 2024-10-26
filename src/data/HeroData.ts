import exp from "node:constants";
import {noAvatarImage} from "../assets/NoAvatarImage";

export class RegisteredHero {
	constructor(id: string, name: string) {
		this.id = id;
        this.name = name;
	}

	toHeroData(): RegisteredHero {
		return new RegisteredHero(this.id, this.name);
	}

	id: string;
	name: string;
}

export enum RelationTypes {
	file = "file",
	web = "web",
	hero = "hero",
}

export class RelationData {
	uniqueId: string;
	category: string = "";
	displayName: string = "";
	relationType: RelationTypes;
	data: string;
}

export class Item {
	fromThirdPartySoftware: boolean = false;
	name: string = "";
	quantity: number = 1;
}

export interface Race {
	name: string;
	lp: number;
}

// For modifying values
export class Attributes {
	integrateInBaseValues: false; // If the modifier should be integrated into the base values or should be noted separately

	courage: number = 0;
	sagacity: number = 0;
	intuition: number = 0;
	charisma: number = 0;
	dexterity: number = 0;
	agility: number = 0;
	constitution: number = 0;
	strength: number = 0;

	lifePoints: number = 0;
	enhancedLifePointsRegeneration = 0;
	arcaneEnergy: number = 0;
	enhancedArcaneEnergyRegeneration: number = 0;
	karmaEnergy: number = 0;
	enhancedKarmaEnergyRegeneration: number = 0;

	armor: number = 0;
	currentArmorLost: number = 0;

	spirit: number = 0;
	toughness: number = 0;
	dodge: number = 0;
	initiative: number = 0;
	movement: number = 0;
}

export interface Advantage {
	name: string;
	type: 'positive' | 'negative';
	modifier: Attributes;
}

export class HeroData {
	name: string = 'Unknown Hero';
	familyName: string = '';
	title: string = '';
	age: string = '';
	race: Race = {
		name: 'Unknown',
        lp: 0,
	}

	baseAttributes: Attributes = new Attributes();

	currentLifePointsLost: number = 0;
	currentArcaneEnergyLost: number = 0;
	currentKarmaEnergyLost: number = 0;

	adventurePoints: number = 0;

	inventory: Item[] = [];

	relations: RelationData[] = [];

	avatar: string = '';

	getAvatar() {
		return this.avatar || noAvatarImage;
	}

	// Adds or overwrites an item in the inventory.
	pushItem(item: Item) {
		const existingItem = this.inventory.find(i => i.name === item.name);
        if (existingItem) {
			// overwrite the existing item with the new information
			existingItem.name = item.name;
			existingItem.quantity = item.quantity;
			existingItem.fromThirdPartySoftware = item.fromThirdPartySoftware;
        } else {
            this.inventory.push(item);
        }
	}

	removeItem(itemName: string) {
		this.inventory = this.inventory.filter(i => i.name!== itemName);
	}

	static fromJson(jsonData: any): HeroData {
		const dataSheet = new HeroData();
		Object.assign(dataSheet, jsonData);
		return dataSheet;
	}
}