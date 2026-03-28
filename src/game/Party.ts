// ── Terai Trail — Family Party ──

import { FamilyMember, FamilyRole, MemberStatus } from '../utils/types';
import { PARTY_SIZE, HEALTH } from '../utils/constants';

const DEFAULT_ROLES: FamilyRole[] = [
    FamilyRole.SARDAR,
    FamilyRole.WIFE,
    FamilyRole.ELDER,
    FamilyRole.CHILD,
    FamilyRole.CHILD,
];

export class Party {
    public members: FamilyMember[];

    constructor(names: string[], roles?: FamilyRole[]) {
        const assignedRoles = roles ?? DEFAULT_ROLES;
        this.members = names.slice(0, PARTY_SIZE).map((name, i) => ({
            name: name.trim() || 'Unknown',
            health: HEALTH.MAX_HEALTH,
            status: MemberStatus.HEALTHY,
            role: assignedRoles[i] ?? FamilyRole.CHILD,
        }));
    }

    public getAlive(): FamilyMember[] {
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

    /**
     * Apply daily health effects. foodPerPerson = lbs of food each person gets.
     * Returns total food consumed across all alive members.
     */
    public applyDailyHealthEffects(foodPerPerson: number): number {
        let totalFoodConsumed = 0;
        this.members.forEach(member => {
            if (member.status === MemberStatus.DEAD) return;

            totalFoodConsumed += foodPerPerson;

            // Starvation
            if (foodPerPerson <= 0) {
                member.health = Math.max(0, member.health - HEALTH.STARVATION_DAMAGE);
            }

            // Update status
            if (member.health <= 0) {
                member.status = MemberStatus.DEAD;
                member.health = 0;
            } else if (member.health < 30) {
                member.status = MemberStatus.VERY_SICK;
            } else if (member.health < 60) {
                member.status = MemberStatus.SICK;
            } else {
                member.status = MemberStatus.HEALTHY;
            }
        });
        return totalFoodConsumed;
    }
}
