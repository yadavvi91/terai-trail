import { PartyMember, Supplies, Weather, Pace, Rations, MemberStatus } from '../utils/types';
import { Profession, PROFESSION_DATA, PARTY_SIZE } from '../utils/constants';
import { Party } from './Party';

export class GameState {
    private static instance: GameState;

    // Party
    public party: PartyMember[] = [];
    public profession: Profession = Profession.BANKER;

    // Supplies
    public supplies: Supplies = {
        food: 0,
        oxen: 0,
        clothing: 0,
        ammo: 0,
        spareParts: 0,
        money: 0,
    };

    // Trail progress
    public milesTraveled: number = 0;
    public currentDate: Date = new Date(1848, 3, 1); // April 1, 1848
    public weather: Weather = Weather.CLEAR;
    public pace: Pace = Pace.STEADY;
    public rations: Rations = Rations.FILLING;
    public nextLandmarkIndex: number = 0;

    // Speed multiplier (1, 2, 4, 8)
    public speedMultiplier: number = 1;
    private static readonly SPEED_OPTIONS = [1, 2, 4, 8];

    public cycleSpeed(): number {
        const idx = GameState.SPEED_OPTIONS.indexOf(this.speedMultiplier);
        this.speedMultiplier = GameState.SPEED_OPTIONS[(idx + 1) % GameState.SPEED_OPTIONS.length];
        return this.speedMultiplier;
    }

    public resetSpeed(): void {
        this.speedMultiplier = 1;
    }

    private constructor() {}

    public static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    public startGame(names: string[], profession: Profession): void {
        this.profession = profession;
        const partyObj = new Party(names);
        this.party = partyObj.members;
        this.supplies = {
            food: 0,
            oxen: 0,
            clothing: 0,
            ammo: 0,
            spareParts: 0,
            money: PROFESSION_DATA[profession].startingMoney,
        };
        this.milesTraveled = 0;
        this.currentDate = new Date(1848, 3, 1);
        this.weather = Weather.CLEAR;
        this.pace = Pace.STEADY;
        this.rations = Rations.FILLING;
        this.nextLandmarkIndex = 0;
    }

    public getAliveMemberCount(): number {
        return this.party.filter(m => m.status !== MemberStatus.DEAD).length;
    }

    public isGameOver(): boolean {
        return this.party.length > 0 && this.getAliveMemberCount() === 0;
    }

    public getLeader(): PartyMember | undefined {
        return this.party[0];
    }

    public getFormattedDate(): string {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getDate()}, ${this.currentDate.getFullYear()}`;
    }

    public advanceDay(): void {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
    }

    public spendMoney(amount: number): boolean {
        if (this.supplies.money < amount) return false;
        this.supplies.money -= amount;
        return true;
    }

    public getPartySize(): number {
        return Math.min(this.party.length, PARTY_SIZE);
    }
}
