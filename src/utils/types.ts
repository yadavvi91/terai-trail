export enum MemberStatus {
    HEALTHY = 'Healthy',
    SICK = 'Sick',
    VERY_SICK = 'Very Sick',
    DEAD = 'Dead',
}

export enum Pace {
    STOPPED = 'Stopped',
    STEADY = 'Steady',
    STRENUOUS = 'Strenuous',
    GRUELING = 'Grueling',
}

export enum Rations {
    FILLING = 'Filling',
    MEAGER = 'Meager',
    BARE_BONES = 'Bare Bones',
}

export enum Weather {
    CLEAR = 'Clear',
    RAINY = 'Rainy',
    SNOWY = 'Snowy',
    HOT = 'Hot',
}

export interface PartyMember {
    name: string;
    health: number;
    status: MemberStatus;
    disease?: string;
}

export interface Supplies {
    food: number;
    oxen: number;
    clothing: number;
    ammo: number;
    spareParts: number;
    money: number;
}

export interface Landmark {
    name: string;
    miles: number;
    isRiver: boolean;
    isFort: boolean;
    description: string;
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
