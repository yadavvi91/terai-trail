// ── Terai Trail — GameState Singleton ──

import {
    FamilyMember,
    FamilyRole,
    Supplies,
    Weather,
    WorkPace,
    Rations,
    MemberStatus,
    SettlementFlags,
    OriginDistrict,
} from '../utils/types';
import { ORIGIN_DISTRICT_DATA, PARTY_SIZE, TOTAL_ACRES } from '../utils/constants';

const DEFAULT_ROLES: FamilyRole[] = [
    FamilyRole.SARDAR,
    FamilyRole.WIFE,
    FamilyRole.ELDER,
    FamilyRole.CHILD,
    FamilyRole.CHILD,
];

export class GameState {
    private static instance: GameState;

    // Family
    public family: FamilyMember[] = [];
    public originDistrict: OriginDistrict = OriginDistrict.LAHORE;

    // Supplies
    public supplies: Supplies = {
        food: 0,
        bullocks: 0,
        shelterMaterials: 0,
        tools: 0,
        medicine: 0,
        governmentCredits: 0,
    };

    // Settlement progress
    public acresCleared: number = 0;
    public currentDate: Date = new Date(1952, 2, 1); // March 1, 1952
    public weather: Weather = Weather.CLEAR;
    public workPace: WorkPace = WorkPace.STEADY;
    public rations: Rations = Rations.FILLING;

    // Settlement flags
    public flags: SettlementFlags = {
        shelterBuilt: false,
        wellDug: false,
        ddtArrived: false,
        cropsPlanted: false,
        gurdwaraFounded: false,
        schoolBuilt: false,
        canalDug: false,
    };

    // Speed multiplier (1, 2, 4, 8)
    public speedMultiplier: number = 1;
    private static readonly SPEED_OPTIONS = [1, 2, 4, 8];

    private constructor() {}

    public static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    public startGame(names: string[], district: OriginDistrict): void {
        this.originDistrict = district;
        const districtData = ORIGIN_DISTRICT_DATA[district];

        // Create family members
        this.family = names.slice(0, PARTY_SIZE).map((name, i) => ({
            name: name.trim() || 'Unknown',
            health: 100,
            status: MemberStatus.HEALTHY,
            role: DEFAULT_ROLES[i] ?? FamilyRole.CHILD,
        }));

        // Initialize supplies
        this.supplies = {
            food: 0,
            bullocks: 0,
            shelterMaterials: 0,
            tools: districtData.bonusTools,
            medicine: 0,
            governmentCredits: districtData.startingCredits,
        };

        // Reset progress
        this.acresCleared = 0;
        this.currentDate = new Date(1952, 2, 1);
        this.weather = Weather.CLEAR;
        this.workPace = WorkPace.STEADY;
        this.rations = Rations.FILLING;
        this.speedMultiplier = 1;

        // Reset flags
        this.flags = {
            shelterBuilt: false,
            wellDug: false,
            ddtArrived: false,
            cropsPlanted: false,
            gurdwaraFounded: false,
            schoolBuilt: false,
            canalDug: false,
        };
    }

    // ── Settlement ──

    public clearAcres(amount: number): void {
        this.acresCleared = Math.min(TOTAL_ACRES, this.acresCleared + amount);
    }

    public consumeFood(amount: number): void {
        this.supplies.food = Math.max(0, this.supplies.food - amount);
    }

    public spendCredits(amount: number): boolean {
        if (this.supplies.governmentCredits < amount) return false;
        this.supplies.governmentCredits -= amount;
        return true;
    }

    // ── Party ──

    public getAliveMemberCount(): number {
        return this.family.filter(m => m.status !== MemberStatus.DEAD).length;
    }

    public isGameOver(): boolean {
        return this.family.length > 0 && this.getAliveMemberCount() === 0;
    }

    public isVictory(): boolean {
        return this.acresCleared >= TOTAL_ACRES && this.getAliveMemberCount() > 0;
    }

    public getLeader(): FamilyMember | undefined {
        return this.family[0];
    }

    // ── Date ──

    public advanceDay(): void {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
    }

    public getFormattedDate(): string {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getDate()}, ${this.currentDate.getFullYear()}`;
    }

    // ── Speed ──

    public cycleSpeed(): number {
        const idx = GameState.SPEED_OPTIONS.indexOf(this.speedMultiplier);
        this.speedMultiplier = GameState.SPEED_OPTIONS[(idx + 1) % GameState.SPEED_OPTIONS.length];
        return this.speedMultiplier;
    }

    public resetSpeed(): void {
        this.speedMultiplier = 1;
    }

    public getPartySize(): number {
        return Math.min(this.family.length, PARTY_SIZE);
    }
}
