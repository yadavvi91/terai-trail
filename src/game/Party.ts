import { PartyMember, MemberStatus } from '../utils/types';
import { PARTY_SIZE } from '../utils/constants';

export class Party {
    public members: PartyMember[];

    constructor(names: string[]) {
        this.members = names.slice(0, PARTY_SIZE).map(name => ({
            name: name.trim() || 'Unknown',
            health: 100,
            status: MemberStatus.HEALTHY,
        }));
    }

    public getAlive(): PartyMember[] {
        return this.members.filter(m => m.status !== MemberStatus.DEAD);
    }

    public isWiped(): boolean {
        return this.members.every(m => m.status === MemberStatus.DEAD);
    }

    public getAverageHealth(): number {
        const alive = this.getAlive();
        if (alive.length === 0) return 0;
        return alive.reduce((sum, m) => sum + m.health, 0) / alive.length;
    }

    public applyDailyHealthEffects(food: number, partySize: number): number {
        let foodConsumed = 0;
        this.members.forEach(member => {
            if (member.status === MemberStatus.DEAD) return;
            foodConsumed += food > 0 ? 1 : 0;
            if (food <= 0) {
                member.health = Math.max(0, member.health - 5);
            }
            if (member.health <= 0) {
                member.status = MemberStatus.DEAD;
                member.health = 0;
            }
        });
        return Math.min(foodConsumed, partySize);
    }
}
