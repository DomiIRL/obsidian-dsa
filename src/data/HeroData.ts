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

export class Item {
	fromThirdPartySoftware: boolean = false;
	name: string = "";
	quantity: number = 1;
}

export interface Race {
	name: string;
	lp: number;
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

	adventurePoints: number = 0;

	courage: number = 8;
	sagacity: number = 8;
	intuition: number = 8;
	charisma: number = 8;
	dexterity: number = 8;
	agility: number = 8;
	constitution: number = 8;
	strength: number = 8;

	lifePoints: number = 0;
	currentLifePointsLost: number = 0;

	arcaneEnergy: number = 0;
	currentArcaneEnergyLost: number = 0;

	karmaEnergy: number = 0;
	currentKarmaEnergyLost: number = 0;

	armor: number = 0;
	currentArmorLost: number = 0;

	spirit: number = 0;
	toughness: number = 0;
	dodge: number = 0;
	initiative: number = 0;
	movement: number = 0;

	inventory: Item[] = [];

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