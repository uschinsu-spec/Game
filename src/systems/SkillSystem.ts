import { SkillType, type SkillConfig } from '../core/Types';
import { SKILLS_DATA } from '../data/skills.data';
import { Player } from '../entities/Player';
import { Monster } from '../entities/Monster';
import { TargetSystem } from './TargetSystem';
import { CombatSystem } from './CombatSystem';
import { EventBus, GameEvents } from '../core/EventBus';

export class SkillSystem {
  public skills: SkillConfig[];
  public ultimateSkill: SkillConfig;
  private player: Player;
  private targetSystem: TargetSystem;
  private combatSystem: CombatSystem;

  constructor(player: Player, targetSystem: TargetSystem, combatSystem: CombatSystem) {
    this.player = player;
    this.targetSystem = targetSystem;
    this.combatSystem = combatSystem;

    this.skills = JSON.parse(JSON.stringify(SKILLS_DATA.filter(s => s.type !== SkillType.ULTIMATE)));
    this.ultimateSkill = JSON.parse(JSON.stringify(SKILLS_DATA.find(s => s.type === SkillType.ULTIMATE)!));
  }

  public updateAutoSkills(monsters: Monster[], time: number): boolean {
    const primaryTarget = this.targetSystem.selectPrimaryTarget(monsters, 220);
    if (!primaryTarget || !primaryTarget.alive) return false;

    const availableSkills = this.skills
      .filter(s => s.autoEnabled && time - s.lastUsedTime >= s.cooldown && this.player.stats.mp >= s.mpCost)
      .sort((a, b) => b.priority - a.priority);

    if (availableSkills.length === 0) return false;

    const skill = availableSkills[0];
    this.castSkill(skill, primaryTarget, monsters, time);
    return true;
  }

  public castSkill(skill: SkillConfig, primaryTarget: Monster, allMonsters: Monster[], time: number): void {
    if (this.player.stats.mp < skill.mpCost) {
      EventBus.emit(GameEvents.TOAST_MESSAGE, 'Linh lực không đủ!');
      return;
    }

    this.player.spendMp(skill.mpCost);
    skill.lastUsedTime = time;

    const targets = skill.type === SkillType.AOE
      ? this.targetSystem.selectAoeTargets(allMonsters, primaryTarget, skill.targetCount, 0.28)
      : [primaryTarget];

    targets.forEach(target => {
      this.combatSystem.applySkillDamage(target, skill, false);
    });

    EventBus.emit(GameEvents.SKILL_CAST, { skill, targetCount: targets.length });
    EventBus.emit(GameEvents.BATTLE_LOG, `✧ Thi triển [${skill.name}] tấn công ${targets.length} mục tiêu!`);
  }

  public castUltimate(allMonsters: Monster[], time: number): boolean {
    const aliveTargets = allMonsters.filter(m => m.alive && m.active && m.worldZ >= 0.45 && m.worldZ <= 0.9);
    if (aliveTargets.length === 0) {
      EventBus.emit(GameEvents.TOAST_MESSAGE, 'Không có kẻ địch trong tầm tuyệt kỹ!');
      return false;
    }

    if (this.player.stats.mp < this.ultimateSkill.mpCost) {
      EventBus.emit(GameEvents.TOAST_MESSAGE, 'Linh lực không đủ thi triển tuyệt kỹ!');
      return false;
    }

    this.player.spendMp(this.ultimateSkill.mpCost);
    this.ultimateSkill.lastUsedTime = time;

    this.combatSystem.showUltimateVfx();

    aliveTargets.forEach(target => {
      this.combatSystem.applySkillDamage(target, this.ultimateSkill, true);
    });

    EventBus.emit(GameEvents.ULTIMATE_TRIGGERED, { skill: this.ultimateSkill, hitCount: aliveTargets.length });
    EventBus.emit(GameEvents.BATTLE_LOG, `🌟 TUYỆT KỸ BỘC PHÁ: Vạn Kiếm Quy Tông diệt sát ${aliveTargets.length} yêu ma!`);
    EventBus.emit(GameEvents.TOAST_MESSAGE, 'VẠN KIẾM QUY TÔNG!');
    return true;
  }
}
