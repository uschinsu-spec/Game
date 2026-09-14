// Lightweight procedural placeholder asset library.
// Replaces removed town and flora asset packs with Babylon.js primitives.
(()=>{
  if (typeof BABYLON === 'undefined') return;

  const makeMat = (scene, name, color) => {
    let m = scene.getMaterialByName(name);
    if (m) return m;
    m = new BABYLON.StandardMaterial(name, scene);
    m.diffuseColor = BABYLON.Color3.FromHexString(color);
    m.specularColor = new BABYLON.Color3(0.04, 0.04, 0.04);
    return m;
  };

  function createTree(scene, parent, name, x, z, scale = 1, variant = 0) {
    const root = new BABYLON.TransformNode(name, scene);
    root.parent = parent || null;
    root.position.set(x, 0, z);
    root.scaling.setAll(scale);

    const bark = makeMat(scene, 'PlaceholderBark', '#6b4423');
    const leaves = makeMat(scene, variant === 1 ? 'PlaceholderLeavesWarm' : 'PlaceholderLeaves', variant === 1 ? '#b86432' : '#4f9b45');
    const trunk = BABYLON.MeshBuilder.CreateCylinder(name + '_Trunk', { height: 3.6, diameterTop: 0.38, diameterBottom: 0.55, tessellation: 7 }, scene);
    trunk.parent = root; trunk.position.y = 1.8; trunk.material = bark; trunk.isPickable = false;
    const crown = BABYLON.MeshBuilder.CreateSphere(name + '_Crown', { diameter: 3.0, segments: 7 }, scene);
    crown.parent = root; crown.position.y = 4.2; crown.scaling.y = 1.15; crown.material = leaves; crown.isPickable = false;
    return root;
  }

  function createRock(scene, parent, name, x, z, scale = 1) {
    const rock = BABYLON.MeshBuilder.CreateSphere(name, { diameter: 1.5, segments: 5 }, scene);
    rock.parent = parent || null;
    rock.position.set(x, 0.55 * scale, z);
    rock.scaling.set(1.3 * scale, 0.75 * scale, scale);
    rock.material = makeMat(scene, 'PlaceholderRock', '#7f8a85');
    rock.isPickable = false;
    return rock;
  }

  function createHouse(scene, parent, name, x, z, rotation = 0, scale = 1) {
    const root = new BABYLON.TransformNode(name, scene);
    root.parent = parent || null;
    root.position.set(x, 0, z);
    root.rotation.y = rotation;
    root.scaling.setAll(scale);

    const wallMat = makeMat(scene, 'PlaceholderHouseWall', '#d8c29a');
    const woodMat = makeMat(scene, 'PlaceholderHouseWood', '#70452c');
    const roofMat = makeMat(scene, 'PlaceholderHouseRoof', '#824238');

    const body = BABYLON.MeshBuilder.CreateBox(name + '_Body', { width: 7, height: 3.8, depth: 5.5 }, scene);
    body.parent = root; body.position.y = 1.9; body.material = wallMat; body.isPickable = false;

    const roof = BABYLON.MeshBuilder.CreateCylinder(name + '_Roof', { height: 5.8, diameter: 6.3, tessellation: 3 }, scene);
    roof.parent = root; roof.position.y = 4.5; roof.rotation.z = Math.PI / 2; roof.scaling.x = 1.25; roof.material = roofMat; roof.isPickable = false;

    const door = BABYLON.MeshBuilder.CreateBox(name + '_Door', { width: 1.25, height: 2.25, depth: 0.18 }, scene);
    door.parent = root; door.position.set(0, 1.15, -2.84); door.material = woodMat; door.isPickable = false;
    return root;
  }

  function createFence(scene, parent, name, x, z, rotation = 0, scale = 1) {
    const root = new BABYLON.TransformNode(name, scene);
    root.parent = parent || null;
    root.position.set(x, 0, z); root.rotation.y = rotation; root.scaling.setAll(scale);
    const wood = makeMat(scene, 'PlaceholderFenceWood', '#705039');
    [-1.35, 1.35].forEach((px, i) => {
      const post = BABYLON.MeshBuilder.CreateBox(name + '_Post' + i, { width: 0.22, height: 1.55, depth: 0.22 }, scene);
      post.parent = root; post.position.set(px, 0.78, 0); post.material = wood; post.isPickable = false;
    });
    const rail = BABYLON.MeshBuilder.CreateBox(name + '_Rail', { width: 3.0, height: 0.25, depth: 0.18 }, scene);
    rail.parent = root; rail.position.y = 0.85; rail.material = wood; rail.isPickable = false;
    return root;
  }

  window.PlaceholderAssets = { makeMat, createTree, createRock, createHouse, createFence };
})();