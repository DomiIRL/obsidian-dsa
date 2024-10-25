import {Advantage, Attributes} from "../../HeroData";

class OptoAdvantage implements Advantage {
    id: string;
    name: string;
    type: 'positive' | 'negative';
    modifier: Attributes;

    constructor(id: string, name: string, string: 'positive' | 'negative', modifier: Attributes) {
        this.id = id;
        this.name = name;
        this.type = string;
        this.modifier = modifier;
    }

    toAdvantage(): Advantage {
        return {
            name: this.name,
            type: this.type,
            modifier: this.modifier
        }
    }

    static getFromId(id: string): OptoAdvantage | undefined {
        return advantages.find((advantage) => advantage.id === id);
    }
}

const advantages: OptoAdvantage[] = [
    new OptoAdvantage(
        "ADV_25",
        'Hohe Lebenskraft',
        'positive',
        Object.assign(new Attributes(), {
            lifePoints: 1
        })
    ),
    new OptoAdvantage(
        "ADV_24",
        'Hohe Karmalenergie',
        'positive',
        Object.assign(new Attributes(), {
            karmaEnergy: 1
        })
    )
];