// ── Terai Trail — Core Types ──

export enum MemberStatus {
    HEALTHY = 'Healthy',
    SICK = 'Sick',
    VERY_SICK = 'Very Sick',
    DEAD = 'Dead',
}

export enum WorkPace {
    RESTING = 'Resting',
    STEADY = 'Steady',
    HARD_LABOR = 'Hard Labor',
    GRUELING = 'Grueling',
}

// Keep Pace as alias for backward compatibility during migration
export const Pace = WorkPace;

export enum Rations {
    FILLING = 'Filling',
    MEAGER = 'Meager',
    BARE_BONES = 'Bare Bones',
}

export enum Weather {
    CLEAR = 'Clear',
    HUMID = 'Humid',
    MONSOON_RAIN = 'Monsoon Rain',
    FLOODING = 'Flooding',
    DRY_HEAT = 'Dry Heat',
    FOG = 'Fog',
}

export enum SettlementPhase {
    JUNGLE_CLEARING = 'JUNGLE_CLEARING',
    FIRST_PLANTING = 'FIRST_PLANTING',
    ESTABLISHED_FARM = 'ESTABLISHED_FARM',
}

export enum Season {
    SPRING = 'SPRING',
    MONSOON = 'MONSOON',
    POST_MONSOON = 'POST_MONSOON',
    WINTER = 'WINTER',
}

export enum OriginDistrict {
    LAHORE = 'Lahore',
    SIALKOT = 'Sialkot',
    LYALLPUR = 'Lyallpur',
}

export enum FamilyRole {
    SARDAR = 'Sardar',
    WIFE = 'Wife',
    ELDER = 'Elder',
    CHILD = 'Child',
}

export interface FamilyMember {
    name: string;
    health: number;
    status: MemberStatus;
    role: FamilyRole;
    disease?: string;
}

export interface Supplies {
    food: number;
    bullocks: number;
    shelterMaterials: number;
    tools: number;
    medicine: number;
    governmentCredits: number;
}

export interface Milestone {
    name: string;
    acresRequired: number;
    description: string;
    isCelebration: boolean;
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    choices?: EventChoice[];
}

export interface EventChoice {
    text: string;
    outcome: () => void;
}

export interface SettlementFlags {
    shelterBuilt: boolean;
    wellDug: boolean;
    ddtArrived: boolean;
    cropsPlanted: boolean;
    gurdwaraFounded: boolean;
    schoolBuilt: boolean;
    canalDug: boolean;
}
