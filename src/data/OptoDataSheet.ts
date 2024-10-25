import {HeroData} from "./HeroData";

export interface OptoAttributeData {
	id: string;
	value: number;
}

export interface OptoItem {
	id: string;
	name: string;
	amount: number;

}

export interface OptoRace {
	id: string;
	name: string;
	lp: number;
}

export const ATTR_COURAGE = "ATTR_1";
export const ATTR_SAGACITY = "ATTR_2";
export const ATTR_INTUITION = "ATTR_3";
export const ATTR_CHARISMA = "ATTR_4";
export const ATTR_DEXTERITY = "ATTR_5";
export const ATTR_AGILITY = "ATTR_6";
export const ATTR_CONSTITUTION = "ATTR_7";
export const ATTR_STRENGTH = "ATTR_8"

export const ADV_MAGIC = "ADV_50";
export const ADV_CONSECRATED = "ADV_12";

export const RACE_HUMAN = "R_1";
export const RACE_ELF = "R_2";
export const RACE_HALFELF = "R_3";
export const RACE_DWARF = "R_4";

const OptoRaces: OptoRace[] = [
	{
		id: RACE_HUMAN,
		name: "Mensch",
		lp: 5,
	},
	{
		id: RACE_ELF,
        name: "Elf",
        lp: 2,
	},
	{
        id: RACE_HALFELF,
        name: "Halfelf",
        lp: 5,
    },
	{
		id: RACE_DWARF,
        name: "Zwerg",
        lp: 8,
	}
]

export class OptoDataSheet {
	name: string = "Unknown Hero";
	avatar: string = "";
	ap: {
		total: number;
	} = {
		total: 0
	};
	r: string = "";
	pers: {
		family: string;
		placeofbirth: string;
		dateofbirth: string;
		age: number;
		size: string;
		weight: string;
		title: string;
	} = {
		family: "",
		placeofbirth: "",
		dateofbirth: "",
		age: 0,
		size: "",
		weight: "",
		title: ""
	};
	attr: {
		values: OptoAttributeData[];
		attributeAdjustmentSelected: string;
		ae: number;
		kp: number;
		lp: number;
		permanentAE: {
			lost: number;
            redeemed: number;
		},
		permanentKP: {
			lost: number;
            redeemed: number;
		},
		permanentLP: {
			lost: number;
		}
	} = {
		values: [],
		attributeAdjustmentSelected: "",
		ae: 0,
		kp: 0,
		lp: 0,
		permanentAE: {
			lost: 0,
			redeemed: 0
		},
		permanentKP: {
			lost: 0,
			redeemed: 0
		},
		permanentLP: {
			lost: 0
		}
	};
	sex: string = "";
	belongings: {
		items: {
			[id: string]: OptoItem;
		}
	} = {
		items: {}
	}
	activatable: {

	} = {}

	getRace(): OptoRace | undefined {
		return OptoRaces.find((race) => race.id === this.r);
	}

	calculateLifePoints(): number {
		const ko = this.getAttributeById(ATTR_CONSTITUTION);
		let baseValue = (this.getRace()?.lp || 0) + ko + ko;
		baseValue += this.attr.lp;
		baseValue -= this.attr.permanentLP.lost;
		return baseValue;
	}

	calculateArcaneEnergy(): number {
		if (!this.hasActivatable(ADV_MAGIC)) {
			return 0;
		}
		let baseValue = this.getAttributeById(this.attr.attributeAdjustmentSelected) + 20;
		baseValue -= this.attr.ae;
		baseValue -= this.attr.permanentAE.lost + this.attr.permanentAE.redeemed;
		return baseValue;
	}

	calculateKarmaEnergy(): number {
		if (!this.hasActivatable(ADV_CONSECRATED)) {
			return 0;
		}
		let baseValue = this.getAttributeById(this.attr.attributeAdjustmentSelected) + 20;
		baseValue -= this.attr.kp;
		baseValue -= this.attr.permanentKP.lost + this.attr.permanentKP.redeemed;
		return baseValue;
	}

	getAttributeById(id: string): number {
		const attribute = this.attr.values.find((attr) => attr.id === id);
        if (attribute) {
            return attribute.value;
        } else {
            return 8;
        }
	}

	hasActivatable(id: string): boolean {
		return this.activatable.hasOwnProperty(id);
	}

	writeToHeroData(heroData: HeroData): HeroData {

		const templateData = new HeroData();

		heroData.name = this.name || templateData.name;
		heroData.avatar = this.avatar || templateData.avatar;
		heroData.familyName = this.pers.family || templateData.familyName;
		heroData.title = this.pers.title || templateData.title;
		heroData.age = `${this.pers.age || templateData.age}`;

		const race = this.getRace();
		if (race) {
			heroData.race = {
				name: race.name,
				lp: race.lp,
			};
		} else {
			heroData.race = templateData.race;
		}

		heroData.adventurePoints = this.ap.total;

		// Attributes assignment with checks
		const attributesMap = {
			"ATTR_1": "courage",
			"ATTR_2": "sagacity",
			"ATTR_3": "intuition",
			"ATTR_4": "charisma",
			"ATTR_5": "dexterity",
			"ATTR_6": "agility",
			"ATTR_7": "constitution",
			"ATTR_8": "strength",
		};

		for (const [attrId, propName] of Object.entries(attributesMap)) {
			const attrValue = this.getAttributeById(attrId);
			if (attrValue !== undefined) {
				// @ts-ignore
				heroData[propName] = attrValue;
			}
		}

		// Calculating life points, arcane energy, and karma energy
		heroData.lifePoints = this.calculateLifePoints();
		heroData.arcaneEnergy = this.calculateArcaneEnergy();
		heroData.karmaEnergy = this.calculateKarmaEnergy();

		const manuallyAddedItems = Object.values(heroData.inventory).filter((item: any) =>!item.fromThirdPartySoftware);

		// Inventory mapping
		const dataSheetItems = Object.values(this.belongings.items).map((item: any) => ({
			fromThirdPartySoftware: true,
			name: item.name,
			quantity: item.amount || 1,
		}));
		// Remove items that are also in manually added items
		const filteredItems = dataSheetItems.filter((item: any) =>!manuallyAddedItems.some((manuallyAddedItem: any) => manuallyAddedItem.name === item.name));

		// Merge manually added items with the inventory
		heroData.inventory = [...dataSheetItems, ...manuallyAddedItems];

		return heroData;
	}

	// Static method to create a new DataSheet instance from JSON
	static fromJson(jsonData: any): OptoDataSheet {
		const dataSheet = new OptoDataSheet();
		Object.assign(dataSheet, jsonData);  // Assign the JSON data to the class
		return dataSheet;
	}
}
