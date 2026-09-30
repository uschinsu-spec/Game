import { RELATION_TYPES } from '../core/factionConstants.js';
import { relationId } from '../core/factionIds.js';

const clamp = (v,min=-1000,max=1000) => Math.max(min,Math.min(max,Number(v||0)));

export function createRelation({ a, b, type = RELATION_TYPES.NEUTRAL, trust = 0, fear = 0, respect = 0, grievance = 0, economicDependency = 0, militaryDependency = 0, tags = [] }) {
  if (a === b) throw new Error('Self relation is invalid');
  return Object.freeze({ id: relationId(a,b), a, b, type, trust:clamp(trust), fear:clamp(fear), respect:clamp(respect), grievance:clamp(grievance), economicDependency:clamp(economicDependency,0,1000), militaryDependency:clamp(militaryDependency,0,1000), tags:Object.freeze([...tags]) });
}

export function relationFor(relations = [], a, b) {
  return relations.find(r => (r.a===a&&r.b===b)||(r.a===b&&r.b===a)) || null;
}

export function applyRelationDelta(relation, delta = {}) {
  if (!relation) return null;
  return Object.freeze({ ...relation, ...delta,
    trust: clamp((relation.trust||0)+(delta.trustDelta||0)), fear: clamp((relation.fear||0)+(delta.fearDelta||0)),
    respect: clamp((relation.respect||0)+(delta.respectDelta||0)), grievance: clamp((relation.grievance||0)+(delta.grievanceDelta||0))
  });
}
