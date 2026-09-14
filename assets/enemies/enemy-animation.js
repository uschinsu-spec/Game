/**
 * enemy-animation.js
 * ==================
 * EnemyAnimationController with:
 *   - Animation playback (loop / one-shot)
 *   - Time-based event callbacks (hit frame, footstep, custom)
 *   - 4 lifecycle events: onAttackHit, onFootstep, onDeath, onAnimationEnd
 *
 * Event system design:
 *   Events are fired at a specific NORMALIZED time within the animation
 *   (0.0 = start, 1.0 = end). The controller polls currentFrame each tick
 *   via advanceEvents(dt), which must be called from EnemyController.update().
 */
(function(global) {
  'use strict';

  // ─── AnimationEventEmitter ────────────────────────────────────────────────
  class AnimationEventEmitter {
    constructor() {
      this._listeners = {};
    }

    on(event, fn) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(fn);
      return this; // chainable
    }

    off(event, fn) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    }

    once(event, fn) {
      const wrapper = (...args) => { fn(...args); this.off(event, wrapper); };
      this.on(event, wrapper);
    }

    emit(event, ...args) {
      (this._listeners[event] || []).forEach(fn => {
        try { fn(...args); } catch(e) { console.warn('[AnimEvent] Error in ' + event + ':', e); }
      });
    }

    clear(event) {
      if (event) delete this._listeners[event];
      else this._listeners = {};
    }
  }

  // ─── Pending event descriptor ─────────────────────────────────────────────
  // { normalizedTime: 0.0–1.0, eventName: string, fired: bool }

  // ─── EnemyAnimationController ─────────────────────────────────────────────
  class EnemyAnimationController {
    /**
     * @param {BABYLON.AnimationGroup[]} animationGroups
     */
    constructor(animationGroups = []) {
      this.animationGroups = new Map();
      this.currentAnim  = null;
      this.currentName  = '';

      // Public event emitter — attach handlers here
      this.events = new AnimationEventEmitter();

      // Internal tracking for time-based events
      this._pendingEvents  = [];   // [{normalizedTime, eventName, payload, fired}]
      this._animDuration   = 0;   // seconds of current clip (at speedRatio=1)
      this._elapsed        = 0;   // seconds elapsed in current clip
      this._currentSpeed   = 1.0;

      for (const ag of animationGroups) {
        if (!ag || !ag.name) continue;

        this.animationGroups.set(ag.name.toLowerCase(), ag);

        const noUidSuffix = ag.name.replace(/_\d+$/g, '').toLowerCase();
        if (noUidSuffix !== ag.name.toLowerCase()) {
          if (!this.animationGroups.has(noUidSuffix)) {
            this.animationGroups.set(noUidSuffix, ag);
          }
        }
      }

      // ── Two-layer event emitter ────────────────────────────────────────
      // _internalEvents : wired once at EnemyController constructor, NEVER cleared.
      //                   Handles damage, death, etc. — permanent game logic.
      // events          : external per-spawn hooks (VFX, sound, loot).
      //                   Cleared on recycle so old callbacks don't accumulate.
      this._internalEvents = new AnimationEventEmitter();
    }

    // ── Name resolution with aliases ────────────────────────────────────────
    //
    // Priority order inside each alias list matters:
    //   - More specific names first (e.g. 'flying_idle' before 'idle')
    //   - Aliases use FULL lowercase names matching what's in the Map
    resolveAnimName(name) {
      const n = name.toLowerCase();
      if (this.animationGroups.has(n)) return n;

      const aliases = {
        // Logical → ordered list of actual GLB animation names to try
        'attack': ['punch', 'weapon', 'shoot', 'jump'],
        'hit':    ['hitreact', 'duck'],
        'die':    ['death'],
        'death':  ['death'],
        // 'idle' tries compound names LAST so they don't steal the slot
        'idle':   ['idle', 'flying_idle', 'jump_idle'],
        // 'walk' — 'flying' is for flying enemies that use it as movement anim
        'walk':   ['walk', 'run', 'flying'],
        'run':    ['run', 'walk', 'flying'],
        // Explicit compound aliases for direct requests
        'jump_idle':   ['jump_idle'],
        'jump_land':   ['jump_land'],
        'flying_idle': ['flying_idle']
      };

      if (aliases[n]) {
        for (const candidate of aliases[n]) {
          if (this.animationGroups.has(candidate)) return candidate;
        }
      }

      // Last resort: partial match — look for any key that ENDS WITH the name
      // e.g. resolving 'idle' finds 'jump_idle' only if no exact 'idle' exists
      // (already covered above, but this catches exotic naming)
      for (const key of this.animationGroups.keys()) {
        if (key === n || key.endsWith('_' + n)) return key;
      }

      return null;
    }

    // ── Compute clip duration in seconds ───────────────────────────────────
    _getClipDuration(ag) {
      if (!ag) return 1.0;
      const fps = ag.targetedAnimations.length > 0
        ? (ag.targetedAnimations[0].animation.framePerSecond || 60)
        : 60;
      return (ag.to - ag.from) / fps;
    }

    // ── Play ───────────────────────────────────────────────────────────────
    /**
     * Play an animation clip.
     * @param {string}   name        - logical name ('Attack', 'Idle', etc.)
     * @param {boolean}  loop
     * @param {number}   speedRatio
     * @param {Function} onAnimationEnd - called when non-looping clip finishes
     * @param {Array}    timeEvents   - [{normalizedTime, eventName, payload}]
     *                                 Fired at specific points in the clip.
     */
    play(name, loop = true, speedRatio = 1.0, onAnimationEnd = null, timeEvents = []) {
      const resolved = this.resolveAnimName(name);
      if (!resolved) return null;

      const targetAG = this.animationGroups.get(resolved);
      if (!targetAG) return null;

      if (this.currentAnim === targetAG && this.currentAnim.isPlaying && !timeEvents.length) {
        return this.currentAnim;
      }

      // Stop previous
      if (this.currentAnim && this.currentAnim !== targetAG) {
        this.currentAnim.stop();
      }

      this.currentAnim    = targetAG;
      this.currentName    = name;
      this._elapsed       = 0;
      this._currentSpeed  = speedRatio;
      this._animDuration  = this._getClipDuration(targetAG) / speedRatio;

      // Register time-based events (reset fired flag)
      this._pendingEvents = timeEvents.map(e => ({
        normalizedTime: e.normalizedTime,
        eventName:      e.eventName,
        payload:        e.payload || null,
        fired:          false
      }));

      targetAG.speedRatio = speedRatio;
      targetAG.start(loop, speedRatio, targetAG.from, targetAG.to, false);

      if (onAnimationEnd && !loop) {
        targetAG.onAnimationGroupEndObservable.addOnce(() => {
          this._internalEvents.emit('onAnimationEnd', { name });
          this.events.emit('onAnimationEnd', { name });
          if (onAnimationEnd) onAnimationEnd();
        });
      }

      return targetAG;
    }

    // ── Advance time-based events ──────────────────────────────────────────
    /**
     * Must be called every frame from EnemyController.update().
     * dt = delta time in seconds (real, not throttled).
     */
    advanceEvents(dt) {
      if (!this.currentAnim || !this.currentAnim.isPlaying || !this._pendingEvents.length) return;

      this._elapsed += dt * this._currentSpeed;

      const progress = this._animDuration > 0
        ? Math.min(1.0, this._elapsed / this._animDuration)
        : 0;

      for (const ev of this._pendingEvents) {
        if (!ev.fired && progress >= ev.normalizedTime) {
          ev.fired = true;
          // Fire internal layer first (controller damage/recovery logic)
          this._internalEvents.emit(ev.eventName, ev.payload);
          // Then fire external layer (VFX, sound, loot — provided by caller)
          this.events.emit(ev.eventName, ev.payload);
        }
      }
    }

    stop() {
      if (this.currentAnim) {
        this.currentAnim.stop();
        this.currentAnim    = null;
        this.currentName    = '';
        this._pendingEvents = [];
        this._elapsed       = 0;
      }
    }

    pause() {
      if (this.currentAnim) this.currentAnim.pause();
    }

    restart() {
      if (this.currentAnim) {
        this.currentAnim.restart();
        this._elapsed = 0;
        // IMPORTANT: do NOT reset _pendingEvents fired flags here.
        // fired flags are only reset by a new play() call with timeEvents.
        // Resetting here would cause double-fire of onAttackHit / _attackRecovery
        // when Tier 3 pauses animation and Tier 1 resumes it.
      }
    }

    getAvailableAnimations() {
      return Array.from(this.animationGroups.keys());
    }

    /**
     * Reset external (per-spawn) event listeners only.
     * Internal listeners wired by EnemyController._hookAnimEvents() are preserved.
     * Call this on pool recycle to clear caller-provided VFX/sound callbacks.
     */
    reset() {
      this.stop();
      this.events.clear();        // clear external per-spawn listeners
      // _internalEvents is intentionally NOT cleared here
    }
  }

  global.EnemyAnimationController = EnemyAnimationController;
  global.AnimationEventEmitter     = AnimationEventEmitter;

})(typeof window !== 'undefined' ? window : this);

