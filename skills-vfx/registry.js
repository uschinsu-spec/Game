// Skill VFX Registry
// One stable Skill ID -> one isolated VFX module. Numeric aliases keep old game code compatible.
(() => {
  'use strict';

  const definitions = new Map();
  const aliases = new Map();

  const normalizeId = value => String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  const aliasKey = value => typeof value === 'number' ? `#${value}` : normalizeId(value);

  const api = {
    register(definition){
      if(!definition || typeof definition.run !== 'function'){
        throw new TypeError('[SkillVfxRegistry] register() requires { id, run }.');
      }
      const id = normalizeId(definition.id);
      if(!id) throw new TypeError('[SkillVfxRegistry] Skill id is required.');

      const aliasesList = Array.isArray(definition.aliases) ? [...definition.aliases] : [];
      const normalized = Object.freeze({
        ...definition,
        id,
        aliases: Object.freeze(aliasesList)
      });

      if(definitions.has(id)) console.warn(`[SkillVfxRegistry] Replacing duplicate skill id: ${id}`);
      definitions.set(id, normalized);
      aliases.set(aliasKey(id), id);
      for(const alias of aliasesList) aliases.set(aliasKey(alias), id);
      return normalized;
    },

    resolve(key){
      const id = aliases.get(aliasKey(key));
      return id ? definitions.get(id) || null : null;
    },

    has(key){ return Boolean(this.resolve(key)); },

    run(key, vfx, context){
      const skill = this.resolve(key);
      if(!skill) return false;
      skill.run(vfx, {...context, skillId: skill.id, skillDefinition: skill});
      return true;
    },

    ids(){ return [...definitions.keys()]; },
    list(){ return [...definitions.values()]; }
  };

  window.SkillVfxRegistry = api;
})();
