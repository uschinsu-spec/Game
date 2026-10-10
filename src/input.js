const KEY_DIRS = {ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0],ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1]};
const KEY_ACTIONS={Space:'attack',KeyJ:'attack',KeyQ:'skill',KeyF:'heal'};

export class Input {
  constructor(joystick,knob,onAction,onTap) {
    this.keys=new Set();this.joy={x:0,y:0};this.joyPointer=null;this.joystick=joystick;
    this.knob=knob;this.onAction=onAction;this.onTap=onTap;
    window.addEventListener('keydown',e=>{
      if(['SELECT','INPUT','TEXTAREA'].includes(e.target?.tagName)&&e.code!=='Escape')return;
      if (e.code in KEY_DIRS||e.code in KEY_ACTIONS||e.code==='Escape')e.preventDefault();
      this.keys.add(e.code);
      if(!e.repeat && KEY_ACTIONS[e.code])this.onAction(KEY_ACTIONS[e.code]);
      if(!e.repeat && e.code==='Escape')this.onAction('menu');
    });
    window.addEventListener('keyup',e=>this.keys.delete(e.code));
    window.addEventListener('blur',()=>this.clear());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear()});
    const canvas=document.getElementById('game');
    canvas.addEventListener('pointerdown',e=>{
      if(this.joyPointer!==null||e.button!==0)return;
      const useJoystick=e.pointerType==='touch'&&window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      if(!useJoystick){
        if(e.isPrimary){e.preventDefault();this.onTap(e.clientX,e.clientY)}
        return;
      }
      e.preventDefault();this.joyPointer=e.pointerId;
      this.joyStart={x:e.clientX,y:e.clientY};this.joyDragged=false;
      const shell=joystick.offsetParent||canvas.parentElement,r=shell.getBoundingClientRect();
      joystick.style.left=`${e.clientX-r.left-shell.clientLeft-joystick.offsetWidth/2}px`;
      joystick.style.top=`${e.clientY-r.top-shell.clientTop-joystick.offsetHeight/2}px`;
      joystick.classList.add('active');canvas.setPointerCapture(e.pointerId);
      this.setJoystick(e);
    });
    canvas.addEventListener('pointermove',e=>{
      if(e.pointerId!==this.joyPointer)return;
      if(Math.hypot(e.clientX-this.joyStart.x,e.clientY-this.joyStart.y)>8)this.joyDragged=true;
      this.setJoystick(e);
    });
    for(const evt of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(evt,e=>{
      if(e.pointerId!==this.joyPointer)return;
      const tap=evt==='pointerup'&&!this.joyDragged;
      this.clearJoystick();
      if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
      if(tap)this.onTap(e.clientX,e.clientY);
    });
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    for(const button of document.querySelectorAll('[data-action]')) {
      button.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();this.onAction(button.dataset.action)});
    }
  }
  setJoystick(e) {
    const r=this.joystick.getBoundingClientRect();let x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);
    const max=r.width*.30,d=Math.hypot(x,y);if(d>max){x=x/d*max;y=y/d*max}
    this.joy={x:x/max,y:y/max};this.knob.style.transform=`translate(${x}px,${y}px)`;
  }
  vector(){
    let x=this.joy.x,y=this.joy.y;
    for(const key of this.keys){if(KEY_DIRS[key]){x+=KEY_DIRS[key][0];y+=KEY_DIRS[key][1]}}
    const d=Math.hypot(x,y);if(d<.12)return {x:0,y:0,active:false};
    return {x:x/Math.max(1,d),y:y/Math.max(1,d),active:true};
  }
  clearJoystick(){this.joy={x:0,y:0};this.knob.style.transform='translate(0px,0px)';this.joyPointer=null;this.joystick.classList.remove('active')}
  clear(){this.keys.clear();this.clearJoystick()}
}
