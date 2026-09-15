(()=>{'use strict';
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const aliases={
 idle:['idle','idle01','standingidle','stand'],
 walk:['walk','walking','walkforward','locomotionwalk'],
 run:['run','running','runforward','locomotionrun','sprint'],
 attack:['attack','attack01','swordattack','slash','meleeattack','melee'],
 hit:['hit','hitreact','hurt','damage','gethit','impact'],
 death:['death','die','dead','death01'],
 cast:['cast','spell','skill','magic','casting','spellcast']
};
const boneAliases={
 hips:['hips','pelvis','mixamorighips','defpelvis'],spine:['spine','mixamorigspine','defspine'],chest:['chest','spine1','spine2','upperchest','mixamorigspine2'],head:['head','mixamorighead'],
 armUL:['upperarml','leftarm','mixamorigleftarm','upperarm.l','defupperarm.l'],armUR:['upperarmr','rightarm','mixamorigrightarm','upperarm.r','defupperarm.r'],armLL:['forearml','leftforearm','mixamorigleftforearm','forearm.l','defforearm.l'],armLR:['forearmr','rightforearm','mixamorigrightforearm','forearm.r','defforearm.r'],
 handL:['handl','lefthand','mixamoriglefthand','hand.l','defhand.l'],handR:['handr','righthand','mixamorigrighthand','hand.r','defhand.r'],thighL:['thighl','leftupleg','mixamorigleftupleg','upperleg.l','defthigh.l','defupperleg.l'],thighR:['thighr','rightupleg','mixamorigrightupleg','upperleg.r','defthigh.r','defupperleg.r'],shinL:['shinl','leftleg','mixamorigleftleg','lowerleg.l','defshin.l','deflowerleg.l'],shinR:['shinr','rightleg','mixamorgrightleg','lowerleg.r','defshin.r','deflowerleg.r'],footL:['footl','leftfoot','mixamorigleftfoot','foot.l','deffoot.l'],footR:['footr','rightfoot','mixamorigrightfoot','foot.r','deffoot.r']
};
class PlayerRigAdapter{
 constructor(result,{visualRoot=null}={}){this.result=result||{};this.visualRoot=visualRoot;this.nodes=[...(result?.transformNodes||[]),...(result?.meshes||[])];this.skeletons=result?.skeletons||[];this.bones=this.skeletons.flatMap(s=>s.bones||[]);this.all=[...this.nodes,...this.bones];this.animationGroups=result?.animationGroups||[];this.boneMap={};for(const[k,a]of Object.entries(boneAliases))this.boneMap[k]=this.find(a);this.clipMap=this.mapClips();this.stopAll();this.diagnostics=this.buildDiagnostics()}
 find(names){const nn=names.map(norm);return this.all.find(o=>nn.includes(norm(o?.name)))||this.all.find(o=>nn.some(a=>norm(o?.name).endsWith(a)))||this.all.find(o=>nn.some(a=>norm(o?.name).includes(a)))||null}
 mapClips(){const out={};for(const[k,list]of Object.entries(aliases)){const n=list.map(norm);out[k]=this.animationGroups.find(g=>n.includes(norm(g.name)))||this.animationGroups.find(g=>n.some(a=>norm(g.name).includes(a)))||null}return out}
 duration(group){if(!group)return 0;const fps=group.targetedAnimations?.[0]?.animation?.framePerSecond||30;return Math.max(.05,Math.abs((Number(group.to)||0)-(Number(group.from)||0))/Math.max(1,fps))}
 stopAll(){for(const g of this.animationGroups)try{g.stop();g.reset()}catch(_){}}
 playSemantic(name,{speed=1,restart=false,loop=null}={}){const g=this.clipMap[name];if(!g)return false;for(const other of this.animationGroups)if(other!==g)try{other.stop();other.reset()}catch(_){};if(restart)try{g.stop();g.reset()}catch(_){};const shouldLoop=loop==null?(name==='idle'||name==='walk'||name==='run'):!!loop;g.loopAnimation=shouldLoop;g.speedRatio=speed;try{g.start(shouldLoop,speed,g.from,g.to,false)}catch(_){try{g.play(shouldLoop);g.speedRatio=speed}catch(__){return false}}return true}
 buildDiagnostics(){const anims=this.animationGroups.map(g=>({name:g.name,from:g.from,to:g.to,duration:this.duration(g),targetCount:g.targetedAnimations?.length||0,targets:(g.targetedAnimations||[]).map(t=>t.target?.name||t.target?.id||'(unnamed)').slice(0,80)}));return{animations:anims,mapped:Object.fromEntries(Object.entries(this.clipMap).map(([k,g])=>[k,g?.name||null])),bones:Object.fromEntries(Object.entries(this.boneMap).map(([k,b])=>[k,b?.name||null])),skeletons:this.skeletons.map(s=>({name:s.name,bones:s.bones?.length||0}))}}
}
window.GameCore=window.GameCore||{};window.GameCore.PlayerRigAdapter=PlayerRigAdapter;
})();