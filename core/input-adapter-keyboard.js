(()=>{'use strict';
class KeyboardInputAdapter{
 constructor(input,target=window){this.input=input;this.target=target;this.keys=new Set();this.down=e=>{if(e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;this.keys.add(e.code);this.sync()};this.up=e=>{this.keys.delete(e.code);this.sync()};this.blur=()=>this.reset();target.addEventListener('keydown',this.down);target.addEventListener('keyup',this.up);target.addEventListener('blur',this.blur)}
 sync(){let x=(this.keys.has('KeyA')||this.keys.has('ArrowLeft')?1:0)-(this.keys.has('KeyD')||this.keys.has('ArrowRight')?1:0),z=-(this.keys.has('KeyW')||this.keys.has('ArrowUp')?1:0)+(this.keys.has('KeyS')||this.keys.has('ArrowDown')?1:0),m=Math.hypot(x,z);if(m>1){x/=m;z/=m;m=1}if(m)this.input.setMoveSource('KEYBOARD',x,z,m);else this.input.clearMoveSource('KEYBOARD')}
 reset(){this.keys.clear();this.input.clearMoveSource('KEYBOARD')}
 dispose(){this.target.removeEventListener('keydown',this.down);this.target.removeEventListener('keyup',this.up);this.target.removeEventListener('blur',this.blur);this.reset()}
}
window.GameCore=window.GameCore||{};window.GameCore.KeyboardInputAdapter=KeyboardInputAdapter;window.GameCore.keyboardInput=window.GameCore.keyboardInput||new KeyboardInputAdapter(window.GameServices?.input||window.GameCore.input);window.GameServices=Object.assign(window.GameServices||{},{keyboardInput:window.GameCore.keyboardInput});
})();