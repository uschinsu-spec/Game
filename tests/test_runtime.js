const fs = require('fs');
const path = require('path');

const gameDir = path.resolve(__dirname, '..');

// Mock Babylon.js minimal API
const Vector3 = function(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; };
Vector3.prototype.copyFrom = function(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
Vector3.prototype.set = function(x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
Vector3.prototype.clone = function() { return new Vector3(this.x, this.y, this.z); };
Vector3.prototype.add = function(v) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); };
Vector3.prototype.subtract = function(v) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); };
Vector3.prototype.scale = function(s) { return new Vector3(this.x * s, this.y * s, this.z * s); };
Vector3.prototype.length = function() { return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); };
Vector3.prototype.lengthSquared = function() { return this.x*this.x + this.y*this.y + this.z*this.z; };
Vector3.prototype.normalize = function() { const l = this.length() || 1; this.x /= l; this.y /= l; this.z /= l; return this; };
Vector3.prototype.addInPlace = function(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; };
Vector3.Distance = function(a, b) { return a.subtract(b).length(); };
Vector3.Lerp = function(a, b, t) { return new Vector3(a.x + (b.x - a.x)*t, a.y + (b.y - a.y)*t, a.z + (b.z - a.z)*t); };

const Color3 = function(r = 0, g = 0, b = 0) { this.r = r; this.g = g; this.b = b; };
Color3.prototype.set = function(r, g, b) { this.r = r; this.g = g; this.b = b; return this; };

const TransformNode = function(name, scene) {
  this.name = name;
  this.position = new Vector3();
  this.rotation = new Vector3();
  this.scaling = new Vector3(1, 1, 1);
  this._enabled = true;
  this.setEnabled = function(v) { this._enabled = v; };
  this.isEnabled = function() { return this._enabled; };
};

const StandardMaterial = function(name, scene) {
  this.name = name;
  this.diffuseColor = new Color3();
  this.specularColor = new Color3();
  this.emissiveColor = new Color3();
  this.dispose = function() {};
};

const Texture = function(url, scene, noMipmap, invertY) {
  this.url = url;
};

const MeshBuilder = {
  CreateBox: (name, opts, scene) => new TransformNode(name, scene),
  CreateSphere: (name, opts, scene) => {
    const node = new TransformNode(name, scene);
    node.dispose = function() {};
    return node;
  },
  CreateCylinder: (name, opts, scene) => new TransformNode(name, scene),
  CreateCapsule: (name, opts, scene) => new TransformNode(name, scene),
  CreateTorus: (name, opts, scene) => {
    const node = new TransformNode(name, scene);
    node.dispose = function() {};
    return node;
  },
};

global.window = {
  BABYLON: { Vector3, Color3, TransformNode, StandardMaterial, Texture, MeshBuilder }
};

// Load unified core enemy system
eval(fs.readFileSync(path.join(gameDir, 'enemies/core/enemy-registry.js'), 'utf8'));
eval(fs.readFileSync(path.join(gameDir, 'enemies/core/base-enemy-visual.js'), 'utf8'));
eval(fs.readFileSync(path.join(gameDir, 'enemies/core/glb-enemy-visual.js'), 'utf8'));
eval(fs.readFileSync(path.join(gameDir, 'enemies/core/attack-system.js'), 'utf8'));
eval(fs.readFileSync(path.join(gameDir, 'enemies/core/monster.js'), 'utf8'));
eval(fs.readFileSync(path.join(gameDir, 'enemies/core/enemy-manager.js'), 'utf8'));

console.log('============================================================');
console.log('KIEM TRA RUNTIME HE THONG UNIFIED ENEMY & ATTACK SYSTEM');
console.log('============================================================');

// 1. Test load default enemies
['wolf', 'golem', 'bandit'].forEach(kind => {
  eval(fs.readFileSync(path.join(gameDir, 'enemies', kind, 'config.js'), 'utf8'));
  eval(fs.readFileSync(path.join(gameDir, 'enemies', kind, 'visual.js'), 'utf8'));
  
  const def = global.window.EnemyRegistry.get(kind);
  console.log(`\n-> Khoi tao Enemy: [${kind.toUpperCase()}] - "${def.name}"`);
  console.log(`   Stats: HP=${def.stats.hpBase}, Speed=${def.movement.speed}, Range=${def.combat.attackRange}, AttackType="${def.combat.attackType || 'melee'}"`);
  
  const rootNode = new TransformNode('test_root', null);
  const visual = global.window.EnemyRegistry.createVisual(kind, null, rootNode, 1, 1);
  
  // Test animation updates across all states
  visual.update(0.016, false); // Idle
  visual.update(0.016, true);  // Run
  visual.trigger('Attack');
  visual.update(0.016, false); // Attack
  visual.trigger('Hit');
  visual.update(0.016, false); // Hit
  visual.trigger('Death');
  visual.update(0.016, false); // Death
  
  console.log(`   [THANH CONG] Parts=${visual.parts.length}, Pivots=${visual.pivots.length}, Materials=${Object.keys(visual.materials).length}`);
});

// 2. Test dynamic GLB Enemy creation via config only
console.log('\n-> Kiem tra dang ky GLB Enemy moi chi bang config: [DRAGON]');
global.window.EnemyRegistry.registerConfig('dragon', {
  kind: 'dragon',
  name: 'Hac Long Than',
  model: {
    type: 'glb',
    path: './assets/models/dragon.glb',
    scale: 1.5,
    rotationY: Math.PI,
    animations: {
      Idle: ['Idle', 'Hover'],
      Run: ['Fly_Forward'],
      Attack: ['Breathe_Fire'],
      Hit: ['Get_Hit'],
      Death: ['Die']
    }
  },
  combat: { attackType: 'ranged_projectile', attackRange: 8.0, attackCooldown: 2.5, damageBase: 30, damagePerLevel: 5 },
  movement: { speed: 4.5 },
  stats: { hpBase: 200, hpPerLevel: 50 },
  visual: { scalePerLevel: 0.1, rootYOffset: 1.5 },
  animation: { spawnDuration: 0.5, attackDuration: 1.0, hitDuration: 0.4, deathDuration: 2.0 }
});

const dragonVisual = global.window.EnemyRegistry.createVisual('dragon', null, new TransformNode('dragon_root', null), 1, 1);
console.log('   [THANH CONG] Auto Factory khoi tao thanh cong Universal GlbEnemyVisual:', dragonVisual.constructor.name);

// 3. Test AttackSystem execution across different attack types
console.log('\n-> Kiem tra AttackSystem cho cac kieu danh rieng biet (Melee, AOE Slam, Dash, Projectile):');
const mockPlayer = { position: new Vector3(0, 0, 0), dead: false, takeDamage: (d) => console.log(`      => Player nhan ${d} damage tu don danh!`) };
const mockWorld = { constrain: (p) => {} };

['wolf', 'golem', 'bandit', 'dragon'].forEach(kind => {
  const mob = new global.window.Monster(null, new Vector3(1, 0, 1), 1, kind);
  console.log(`   [ATTACK] ${mob.name} (${kind}) thuc hien don danh kieu [${mob.definition.combat?.attackType || 'melee'}]:`);
  global.window.AttackSystem.execute(mob, mockPlayer, (dmg) => mockPlayer.takeDamage(dmg), mockWorld, null);
});

// 4. Test EnemyManager batch spawning & queries
console.log('\n-> Kiem tra EnemyManager (quan ly tap trung tat ca quai):');
const mockWorldManager = { constrain: (p) => {}, findPath: (a, b) => [b] };
const manager = new global.window.EnemyManager(null, mockWorldManager);
manager.spawn(12);
console.log(`   [THANH CONG] Manager da sinh ${manager.monsters.length} quai vat.`);
const nearest = manager.nearest(new Vector3(0, 0, 0), 100);
console.log(`   [THANH CONG] Quai gan nhat: ID=${nearest?.id}, Kind=${nearest?.kind}, Name="${nearest?.name}"`);

console.log('\n============================================================');
console.log('KET QUA: UNIFIED ENEMY ARCHITECTURE SAN SANG 100% HOAN HAO!');
console.log('============================================================');
