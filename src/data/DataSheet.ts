import {Notice} from "obsidian";

export interface AttributeData {
	id: string;
	value: number;
}

export interface Item {
	id: string;
	name: string;
	gr: number;
	amount: number;

}

export interface Race {
	id: string;
	name: string;
	lp: number;
}

export const ATTR_MU = "ATTR_1";
export const ATTR_KL = "ATTR_2";
export const ATTR_IN = "ATTR_3";
export const ATTR_CH = "ATTR_4";
export const ATTR_FF = "ATTR_5";
export const ATTR_GE = "ATTR_6";
export const ATTR_KO = "ATTR_7";
export const ATTR_KK = "ATTR_8"

export const ADV_MAGIC = "ADV_50";
export const ADV_CONSECRATED = "ADV_12";

export const RACE_HUMAN = "R_1";
export const RACE_ELF = "R_2";
export const RACE_HALFELF = "R_3";
export const RACE_DWARF = "R_4";

const Races: Race[] = [
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

export class DataSheet {
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
		values: AttributeData[];
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
		items: Item[]
	}
	activatable: {

	} = {}

	getRace(): Race | undefined {
		return Races.find((race) => race.id === this.r);
	}

	getMaxHealth(): number {
		const ko = this.getAttributeById(ATTR_KO);
		let baseValue = (this.getRace()?.lp || 0) + ko + ko;
		baseValue += this.attr.lp;
		baseValue -= this.attr.permanentLP.lost;
		return baseValue;
	}

	getMaxAstralEnergy(): number {
		if (!this.hasActivatable(ADV_MAGIC)) {
			return 0;
		}
		let baseValue = this.getAttributeById(this.attr.attributeAdjustmentSelected) + 20;
		baseValue -= this.attr.ae;
		baseValue -= this.attr.permanentAE.lost + this.attr.permanentAE.redeemed;
		return baseValue;
	}

	getMaxKarmaEnergy(): number {
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

	// Static method to create a new DataSheet instance from JSON
	static fromJson(jsonData: any): DataSheet {
		const dataSheet = new DataSheet();
		Object.assign(dataSheet, jsonData);  // Assign the JSON data to the class
		return dataSheet;
	}
}
