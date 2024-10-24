
export class HeroData {
	constructor(id: string, name: string) {
		this.id = id;
        this.name = name;
	}

	toHeroData(): HeroData {
		return new HeroData(this.id, this.name);
	}

	id: string;
	name: string;
}
