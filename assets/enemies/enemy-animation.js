/**
 * enemy-animation.js
 * Robust animation resolver for mixed Quaternius clip naming.
 */
(function(global) {
  'use strict';

  class AnimationEventEmitter {
    constructor(){ this._listeners = {}; }
    on(event,fn){ if(!this._listeners[event]) this._listeners[event]=[]; this._listeners[event].push(fn); return this; }
    off(event,fn){ if(!this._listeners[event]) return; this._listeners[event]=this._listeners[event].filter(f=>f!==fn); }
    once(event,fn){ const wrapper=(...args)=>{ fn(...args); this.off(event,wrapper); }; this.on(event,wrapper); }
    emit(event,...args){ (this._listeners[event]||[]).forEach(fn=>{ try{ fn(...args); }catch(e){ console.warn('[AnimEvent] Error in '+event+':',e); } }); }
    clear(event){ if(event) delete this._listeners[event]; else this._listeners={}; }
  }

  class EnemyAnimationController {
    constructor(animationGroups=[]){
      this.animationGroups=new Map();
      this.currentAnim=null;
      this.currentName='';
      this.events=new AnimationEventEmitter();
      this._pendingEvents=[];
      this._animDuration=0;
      this._elapsed=0;
      this._currentSpeed=1;
      this._internalEvents=new AnimationEventEmitter();

      for(const ag of animationGroups){
        if(!ag||!ag.name) continue;
        const raw=ag.name.toLowerCase();
        this.animationGroups.set(raw,ag);
        const clean=ag.name.replace(/_enemy_[\s\S]*$/i,'').toLowerCase();
        if(clean&&!this.animationGroups.has(clean)) this.animationGroups.set(clean,ag);
        const noNum=clean.replace(/_\d+$/g,'').toLowerCase();
        if(noNum&&!this.animationGroups.has(noNum)) this.animationGroups.set(noNum,ag);
      }
    }

    _normalize(name){ return String(name||'').toLowerCase().replace(/[\s\-]+/g,'_'); }

    resolveAnimName(name){
      const n=this._normalize(name);
      if(this.animationGroups.has(n)) return n;

      const aliases={
        attack:['bite_front','bite','headbutt','punch','weapon','shoot','attack','jump'],
        hit:['hitreact','hit_react','hitrecieve','hitreceive','hurt','damage','duck'],
        die:['death','die'],
        death:['death','die'],
        idle:['idle','flying_idle','jump_idle'],
        walk:['fast_flying','flying','walk','run'],
        run:['fast_flying','flying','run','walk'],
        flying:['fast_flying','flying','walk','run'],
        flying_idle:['flying_idle','idle'],
        jump_idle:['jump_idle','idle'],
        jump_land:['jump_land','idle']
      };

      const candidates=aliases[n]||[];
      for(const candidate of candidates){ if(this.animationGroups.has(candidate)) return candidate; }

      for(const key of this.animationGroups.keys()){
        if(key===n||key.endsWith('_'+n)||key.includes(n)) return key;
      }

      // Semantic fallback: choose a safe animation by intent rather than failing silently.
      const safeFallback = n==='attack' ? ['punch','weapon','shoot','bite_front','headbutt','jump']
        : n==='hit' ? ['hitreact','hit_react','hitrecieve','hitreceive','duck']
        : (n==='die'||n==='death') ? ['death','die']
        : n==='idle' ? ['idle','flying_idle','jump_idle']
        : (n==='walk'||n==='run'||n==='flying') ? ['fast_flying','flying','walk','run'] : [];
      for(const candidate of safeFallback){
        for(const key of this.animationGroups.keys()){
          if(key===candidate||key.includes(candidate)) return key;
        }
      }
      return null;
    }

    _getClipDuration(ag){
      if(!ag) return 1;
      const fps=ag.targetedAnimations.length>0?(ag.targetedAnimations[0].animation.framePerSecond||60):60;
      return Math.max(0.001,(ag.to-ag.from)/fps);
    }

    play(name,loop=true,speedRatio=1,onAnimationEnd=null,timeEvents=[]){
      const resolved=this.resolveAnimName(name);
      if(!resolved){
        console.warn('[EnemyAnimation] Missing clip for',name,'available:',this.getAvailableAnimations());
        return null;
      }
      const targetAG=this.animationGroups.get(resolved);
      if(!targetAG) return null;
      if(this.currentAnim===targetAG&&this.currentAnim.isPlaying&&!timeEvents.length) return this.currentAnim;
      if(this.currentAnim&&this.currentAnim!==targetAG) this.currentAnim.stop();

      const safeSpeed=Math.max(0.05,Number(speedRatio)||1);
      this.currentAnim=targetAG;
      this.currentName=name;
      this._elapsed=0;
      this._currentSpeed=safeSpeed;
      this._animDuration=this._getClipDuration(targetAG)/safeSpeed;
      this._pendingEvents=(timeEvents||[]).map(e=>({normalizedTime:e.normalizedTime,eventName:e.eventName,payload:e.payload||null,fired:false}));
      targetAG.speedRatio=safeSpeed;
      targetAG.start(loop,safeSpeed,targetAG.from,targetAG.to,false);

      if(onAnimationEnd&&!loop){
        targetAG.onAnimationGroupEndObservable.addOnce(()=>{
          this._internalEvents.emit('onAnimationEnd',{name});
          this.events.emit('onAnimationEnd',{name});
          onAnimationEnd();
        });
      }
      return targetAG;
    }

    advanceEvents(dt){
      if(!this.currentAnim||!this.currentAnim.isPlaying||!this._pendingEvents.length) return;
      this._elapsed+=dt*this._currentSpeed;
      const progress=this._animDuration>0?Math.min(1,this._elapsed/this._animDuration):0;
      for(const ev of this._pendingEvents){
        if(!ev.fired&&progress>=ev.normalizedTime){
          ev.fired=true;
          this._internalEvents.emit(ev.eventName,ev.payload);
          this.events.emit(ev.eventName,ev.payload);
        }
      }
    }

    stop(){ if(this.currentAnim){ this.currentAnim.stop(); this.currentAnim=null; this.currentName=''; this._pendingEvents=[]; this._elapsed=0; } }
    pause(){ if(this.currentAnim) this.currentAnim.pause(); }
    restart(){ if(this.currentAnim){ this.currentAnim.restart(); this._elapsed=0; } }
    getAvailableAnimations(){ return Array.from(this.animationGroups.keys()); }
    reset(){ this.stop(); this.events.clear(); }
  }

  global.EnemyAnimationController=EnemyAnimationController;
  global.AnimationEventEmitter=AnimationEventEmitter;
})(typeof window!=='undefined'?window:this);
