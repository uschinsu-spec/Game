(() => {
  "use strict";
  const B = window.BABYLON;
  const CFG = window.PlayerConfig;
  const m = cm => cm / 100;

  class PlayerRig {
    constructor(scene, parent) {
      this.scene = scene;
      this.nodes = {};
      this._poseNodes = [];
      this.root = this._node("rigRoot", new B.Vector3(0,0,0), parent);
      this._buildHumanoid();
      this._captureBasePose();
    }

    _node(name, position, parent=this.root) {
      const n = new B.TransformNode(`playerRig_${name}`, this.scene);
      n.parent = parent || null;
      n.position.copyFrom(position);
      n.rotation.set(0,0,0);
      this.nodes[name] = n;
      this._poseNodes.push(n);
      return n;
    }

    _buildHumanoid() {
      const n=this.nodes,A=CFG.anthropometry;

      // Absolute anatomical landmarks encoded as hierarchical offsets.
      // Sole = 0 cm, crown = 175 cm.
      n.pelvis=this._node("pelvis",new B.Vector3(0,m(A.hipJointHeightCm),0),this.root); // 92 cm
      n.spineLower=this._node("spineLower",new B.Vector3(0,m(15),0),n.pelvis);           // 107 cm
      n.spineUpper=this._node("spineUpper",new B.Vector3(0,m(18),0),n.spineLower);     // 125 cm
      n.chest=this._node("chest",new B.Vector3(0,m(15),0),n.spineUpper);               // 140 cm
      n.neck=this._node("neck",new B.Vector3(0,m(12),0),n.chest);                      // 152 cm
      n.head=this._node("head",new B.Vector3(0,m(11.5),0),n.neck);                    // 163.5 cm head centre

      for(const side of [-1,1]){
        const s=side<0?"L":"R";
        // Shoulder joint centres are 36 cm apart and sit at 143 cm.
        n[`clavicle${s}`]=this._node(`clavicle${s}`,new B.Vector3(m(9)*side,m(3),0),n.chest);
        n[`upperArm${s}`]=this._node(`upperArm${s}`,new B.Vector3(m(9)*side,0,0),n[`clavicle${s}`]);
        n[`forearm${s}`]=this._node(`forearm${s}`,new B.Vector3(0,-m(A.upperArmLengthCm),0),n[`upperArm${s}`]);
        n[`hand${s}`]=this._node(`hand${s}`,new B.Vector3(0,-m(A.forearmLengthCm),0),n[`forearm${s}`]);

        // Hip joint -> knee -> ankle. thigh node is the animated hip pivot.
        n[`hip${s}`]=this._node(`hip${s}`,new B.Vector3(m(9)*side,0,0),n.pelvis);
        n[`thigh${s}`]=this._node(`thigh${s}`,new B.Vector3(0,0,0),n[`hip${s}`]);
        n[`shin${s}`]=this._node(`shin${s}`,new B.Vector3(0,-m(A.thighLengthCm),0),n[`thigh${s}`]);
        n[`foot${s}`]=this._node(`foot${s}`,new B.Vector3(0,-m(A.lowerLegLengthCm),m(4)),n[`shin${s}`]);
        n[`toe${s}`]=this._node(`toe${s}`,new B.Vector3(0,-m(3),m(14)),n[`foot${s}`]);
      }

      // Rigid attachment sockets. Values are sized around the 175 cm reference rig.
      n.weaponSocket=this._node("weaponSocket",new B.Vector3(0,-m(5),m(3)),n.handR);
      n.weaponSocket.rotation.set(Math.PI * 0.40, 0, 0.10);
      n.offhandSocket=this._node("offhandSocket",new B.Vector3(0,-m(5),m(3)),n.handL);
      n.offhandSocket.rotation.set(Math.PI * 0.40, 0, -0.10);
      n.backSocket=this._node("backSocket",new B.Vector3(0,m(1),-m(12)),n.chest);
      n.headSocket=this._node("headSocket",new B.Vector3(0,m(11.5),0),n.head); // crown = 175 cm
      n.vfxHandR=this._node("vfxHandR",new B.Vector3(0,-m(9),m(2)),n.handR);
      n.vfxHandL=this._node("vfxHandL",new B.Vector3(0,-m(9),m(2)),n.handL);
      n.vfxChest=this._node("vfxChest",new B.Vector3(0,m(1),m(11)),n.chest);
      n.vfxFootR=this._node("vfxFootR",new B.Vector3(0,-m(3),m(13)),n.footR);
      n.vfxFootL=this._node("vfxFootL",new B.Vector3(0,-m(3),m(13)),n.footL);
    }

    _captureBasePose(){
      for(const node of this._poseNodes){
        node._playerBase={position:node.position.clone(),rotation:node.rotation.clone(),scaling:node.scaling.clone()};
      }
    }

    resetPose(){
      for(const node of this._poseNodes){
        const b=node._playerBase;if(!b)continue;
        node.position.copyFrom(b.position);node.rotation.copyFrom(b.rotation);node.scaling.copyFrom(b.scaling);
      }
    }

    get(name){return this.nodes[name]||null;}
    getSocket(name){return this.nodes[name]||null;}
  }

  window.PlayerRig=PlayerRig;
})();
