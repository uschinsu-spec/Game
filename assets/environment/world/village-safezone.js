// ============================================================================
// THANH VÂN TIÊN VỰC - ĐẠI THÔN LÀNG BÌNH AN (EXPANDED 10X VILLAGE SAFE ZONE)
// Scientific Medieval Xianxia Village Layout from assets/THON TRAN/
// Safe Zone Radius: 52.0m (Diameter > 104m) | Central Open Plaza: Radius 18.0m
// ============================================================================
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene) return;

  const prevNode = scene.getTransformNodeByName('PeacefulVillageRoot');
  if (prevNode) prevNode.dispose();

  const villageRoot = new BABYLON.TransformNode('PeacefulVillageRoot', scene);
  villageRoot.position.set(0, 0, 0);

  const SAFE_ZONE_RADIUS = 52.0;
  window.PEACEFUL_VILLAGE_SAFE_ZONE = {
    radius: SAFE_ZONE_RADIUS,
    center: new BABYLON.Vector3(0, 0, 0),
    isInside: (pos) => {
      if (!pos) return false;
      return Math.hypot(pos.x, pos.z) <= SAFE_ZONE_RADIUS;
    }
  };

  // ---------------------------------------------------------------------------
  // 1. CENTRAL OPEN PLAZA FORMATION & 52M GOLDEN BARRIER
  // ---------------------------------------------------------------------------
  // Central Respawn Formation at (0, 0, 0)
  const spawnCircleMat = new BABYLON.StandardMaterial('SpawnFormationMat', scene);
  spawnCircleMat.diffuseColor = BABYLON.Color3.FromHexString('#38bdf8');
  spawnCircleMat.emissiveColor = BABYLON.Color3.FromHexString('#0284c7');
  spawnCircleMat.alpha = 0.60;

  const spawnFormation = BABYLON.MeshBuilder.CreateDisc('SpawnFormation', { radius: 3.5, tessellation: 36 }, scene);
  spawnFormation.parent = villageRoot;
  spawnFormation.position.set(0, 0.04, 0);
  spawnFormation.rotation.x = Math.PI / 2;
  spawnFormation.material = spawnCircleMat;

  // Outer Golden Safe Zone Barrier Circle (Radius 52.0m)
  const barrierMat = new BABYLON.StandardMaterial('SafeZoneBarrierMat', scene);
  barrierMat.diffuseColor = BABYLON.Color3.FromHexString('#fbbf24');
  barrierMat.emissiveColor = BABYLON.Color3.FromHexString('#f59e0b');
  barrierMat.alpha = 0.32;
  barrierMat.backFaceCulling = false;

  const barrierRing = BABYLON.MeshBuilder.CreateTorus('SafeZoneBarrierRing', { diameter: SAFE_ZONE_RADIUS * 2, thickness: 0.35, tessellation: 96 }, scene);
  barrierRing.parent = villageRoot;
  barrierRing.position.set(0, 0.15, 0);
  barrierRing.material = barrierMat;

  // ---------------------------------------------------------------------------
  // 2. ASYNC BUILD 4 SCIENTIFIC DISTRICTS FROM THÔN TRẤN ASSETS
  // ---------------------------------------------------------------------------
  async function buildExpandedVillage() {
    if (!window.ThonTranLoader) {
      setTimeout(buildExpandedVillage, 300);
      return;
    }

    const pieces = [];

    // =========================================================================
    // DISTRICT 1: NORTH DISTRICT - TIÊN DUYÊN PHỦ (DINH THỰ TRƯỞNG THÔN)
    // Position: Z: +28m to +42m
    // =========================================================================
    // Main North Mansion (Tòa Nhà Chính 2 Gian)
    pieces.push(
      // Front Facade
      { id: 'Wall_Plaster_Door_Round', x: 0, y: 0, z: 34.0, ry: 0 },
      { id: 'Door_2_Round', x: 0, y: 0, z: 34.0, ry: 0 },
      { id: 'Wall_Plaster_Window_Wide_Round', x: -3.0, y: 0, z: 34.0, ry: 0 },
      { id: 'Wall_Plaster_Window_Wide_Round', x: 3.0, y: 0, z: 34.0, ry: 0 },
      { id: 'Wall_Plaster_Straight', x: -6.0, y: 0, z: 34.0, ry: 0 },
      { id: 'Wall_Plaster_Straight', x: 6.0, y: 0, z: 34.0, ry: 0 },

      // Side Walls
      { id: 'Wall_Plaster_Straight', x: -7.5, y: 0, z: 38.0, ry: Math.PI / 2 },
      { id: 'Wall_Plaster_Straight', x: -7.5, y: 0, z: 42.0, ry: Math.PI / 2 },
      { id: 'Wall_Plaster_Straight', x: 7.5, y: 0, z: 38.0, ry: -Math.PI / 2 },
      { id: 'Wall_Plaster_Straight', x: 7.5, y: 0, z: 42.0, ry: -Math.PI / 2 },

      // Back Wall
      { id: 'Wall_Plaster_Straight', x: 0, y: 0, z: 44.0, ry: Math.PI },
      { id: 'Wall_Plaster_Straight', x: -4.0, y: 0, z: 44.0, ry: Math.PI },
      { id: 'Wall_Plaster_Straight', x: 4.0, y: 0, z: 44.0, ry: Math.PI },

      // Roofs & Towers
      { id: 'Roof_RoundTiles_8x14', x: 0, y: 3.5, z: 39.0, ry: 0 },
      { id: 'Roof_Tower_RoundTiles', x: 6.5, y: 6.5, z: 34.5, ry: 0 },
      { id: 'Prop_Chimney', x: -4.5, y: 5.2, z: 37.0, ry: 0 },
      { id: 'Prop_Vine5', x: 3.2, y: 0, z: 34.1, ry: 0 },
      { id: 'Prop_Vine6', x: -3.2, y: 0, z: 34.1, ry: 0 },

      // Balconies
      { id: 'Balcony_Cross_Straight', x: 0, y: 3.2, z: 34.2, ry: 0 },
      { id: 'Balcony_Cross_Straight', x: -2.0, y: 3.2, z: 34.2, ry: 0 },
      { id: 'Balcony_Cross_Straight', x: 2.0, y: 3.2, z: 34.2, ry: 0 },

      // North Courtyard Garden
      { id: 'Prop_Wagon', x: 9.5, y: 0, z: 31.0, ry: -0.4 },
      { id: 'Prop_Crate', x: 8.5, y: 0, z: 32.5, ry: 0.2 },
      { id: 'Prop_Brick1', x: -8.5, y: 0, z: 32.0, ry: 0 }
    );

    // =========================================================================
    // DISTRICT 2: WEST DISTRICT - DƯỢC THẢO QUÁN & TIÊN Y ĐƯỜNG
    // Position: X: -28m to -45m, Z: -6m to +12m
    // =========================================================================
    // Main Pharmacy House
    pieces.push(
      { id: 'Wall_UnevenBrick_Door_Flat', x: -32.0, y: 0, z: 0, ry: Math.PI / 2 },
      { id: 'Door_1_Flat', x: -32.0, y: 0, z: 0, ry: Math.PI / 2 },
      { id: 'Wall_UnevenBrick_Window_Wide_Flat', x: -32.0, y: 0, z: 4.0, ry: Math.PI / 2 },
      { id: 'Wall_UnevenBrick_Window_Thin_Round', x: -32.0, y: 0, z: -4.0, ry: Math.PI / 2 },
      { id: 'Wall_UnevenBrick_Straight', x: -36.0, y: 0, z: 6.0, ry: 0 },
      { id: 'Wall_UnevenBrick_Straight', x: -36.0, y: 0, z: -6.0, ry: Math.PI },
      { id: 'Wall_UnevenBrick_Straight', x: -40.0, y: 0, z: 0, ry: -Math.PI / 2 },
      { id: 'Roof_RoundTiles_6x10', x: -36.0, y: 3.4, z: 0, ry: Math.PI / 2 },
      { id: 'Prop_Chimney2', x: -38.5, y: 4.6, z: 2.0, ry: 0 },

      // Herbal Storage Shed
      { id: 'Wall_Plaster_Door_Flat', x: -34.0, y: 0, z: 16.0, ry: Math.PI / 3 },
      { id: 'Door_1_Round', x: -34.0, y: 0, z: 16.0, ry: Math.PI / 3 },
      { id: 'Wall_Plaster_Straight', x: -38.0, y: 0, z: 18.0, ry: Math.PI / 3 },
      { id: 'Roof_RoundTiles_6x6', x: -36.0, y: 3.2, z: 17.0, ry: Math.PI / 3 },

      // Props & Herb Carts
      { id: 'Prop_Wagon', x: -27.0, y: 0, z: -4.0, ry: 0.8 },
      { id: 'Prop_Crate', x: -28.5, y: 0, z: 3.0, ry: -0.3 },
      { id: 'Prop_Crate', x: -28.0, y: 0, z: 4.2, ry: 0.5 },
      { id: 'Prop_Vine1', x: -31.9, y: 0, z: 2.0, ry: Math.PI / 2 },
      { id: 'Prop_Vine2', x: -31.9, y: 0, z: -2.0, ry: Math.PI / 2 }
    );

    // =========================================================================
    // DISTRICT 3: EAST DISTRICT - LINH KIẾM LÒ RÈN & KHO VŨ KHÍ
    // Position: X: +28m to +45m, Z: -6m to +12m
    // =========================================================================
    // Main Blacksmith Forge
    pieces.push(
      { id: 'Wall_Plaster_Door_Flat', x: 32.0, y: 0, z: 0, ry: -Math.PI / 2 },
      { id: 'Door_4_Flat', x: 32.0, y: 0, z: 0, ry: -Math.PI / 2 },
      { id: 'Wall_Plaster_Window_Wide_Flat', x: 32.0, y: 0, z: 4.0, ry: -Math.PI / 2 },
      { id: 'Wall_Plaster_Window_Wide_Flat2', x: 32.0, y: 0, z: -4.0, ry: -Math.PI / 2 },
      { id: 'Wall_Plaster_Straight', x: 36.0, y: 0, z: 6.0, ry: 0 },
      { id: 'Wall_Plaster_Straight', x: 36.0, y: 0, z: -6.0, ry: Math.PI },
      { id: 'Wall_Plaster_Straight', x: 40.0, y: 0, z: 0, ry: Math.PI / 2 },
      { id: 'Roof_RoundTiles_6x10', x: 36.0, y: 3.4, z: 0, ry: -Math.PI / 2 },
      { id: 'Prop_Chimney', x: 38.5, y: 4.8, z: 2.5, ry: 0 },

      // Armory Storage House
      { id: 'Wall_UnevenBrick_Door_Round', x: 34.0, y: 0, z: 16.0, ry: -Math.PI / 3 },
      { id: 'Door_2_Flat', x: 34.0, y: 0, z: 16.0, ry: -Math.PI / 3 },
      { id: 'Wall_UnevenBrick_Straight', x: 38.0, y: 0, z: 18.0, ry: -Math.PI / 3 },
      { id: 'Roof_RoundTiles_6x6', x: 36.0, y: 3.2, z: 17.0, ry: -Math.PI / 3 },

      // Forge Ore Carts, Bricks & Metal Fences
      { id: 'Prop_Wagon', x: 27.0, y: 0, z: -3.0, ry: -0.7 },
      { id: 'Prop_Brick1', x: 29.0, y: 0, z: 4.0, ry: 0.2 },
      { id: 'Prop_Brick2', x: 29.5, y: 0, z: 5.2, ry: -0.4 },
      { id: 'Prop_Brick3', x: 28.0, y: 0, z: -5.0, ry: 0.6 },
      { id: 'Prop_MetalFence_Simple', x: 26.0, y: 0, z: 10.0, ry: 0 },
      { id: 'Prop_MetalFence_Simple', x: 26.0, y: 0, z: 13.0, ry: 0 }
    );

    // =========================================================================
    // DISTRICT 4: SOUTH MAIN GATEWAY - TIÊN MÔN ĐẠI LỘ
    // Position: Z: -36m to -50m
    // =========================================================================
    // West Guard Tower & Wall
    pieces.push(
      { id: 'Wall_Plaster_Straight', x: -10.0, y: 0, z: -42.0, ry: 0 },
      { id: 'Wall_Plaster_Straight', x: -14.0, y: 0, z: -42.0, ry: 0 },
      { id: 'Roof_Tower_RoundTiles', x: -16.0, y: 4.5, z: -42.0, ry: 0 },

      // East Guard Tower & Wall
      { id: 'Wall_Plaster_Straight', x: 10.0, y: 0, z: -42.0, ry: 0 },
      { id: 'Wall_Plaster_Straight', x: 14.0, y: 0, z: -42.0, ry: 0 },
      { id: 'Roof_Tower_RoundTiles', x: 16.0, y: 4.5, z: -42.0, ry: 0 }
    );

    // =========================================================================
    // CROSS PATHWAYS (ĐƯỜNG LÁT GẠCH CHỮ THẬP NỐI 4 PHƯƠNG)
    // =========================================================================
    // North Road (Z: 4m -> 26m)
    for (let z = 6; z <= 24; z += 4) {
      pieces.push(
        { id: 'Floor_RedBrick', x: -1.2, y: 0.02, z: z, ry: 0 },
        { id: 'Floor_RedBrick', x: 1.2, y: 0.02, z: z, ry: 0 }
      );
    }
    // South Road (Z: -6m -> -38m)
    for (let z = -6; z >= -36; z -= 4) {
      pieces.push(
        { id: 'Floor_RedBrick', x: -1.2, y: 0.02, z: z, ry: 0 },
        { id: 'Floor_RedBrick', x: 1.2, y: 0.02, z: z, ry: 0 }
      );
    }
    // West Road (X: -6m -> -26m)
    for (let x = -6; x >= -24; x -= 4) {
      pieces.push(
        { id: 'Floor_UnevenBrick', x: x, y: 0.02, z: -1.0, ry: Math.PI / 2 },
        { id: 'Floor_UnevenBrick', x: x, y: 0.02, z: 1.0, ry: Math.PI / 2 }
      );
    }
    // East Road (X: 6m -> 26m)
    for (let x = 6; x <= 24; x += 4) {
      pieces.push(
        { id: 'Floor_UnevenBrick', x: x, y: 0.02, z: -1.0, ry: Math.PI / 2 },
        { id: 'Floor_UnevenBrick', x: x, y: 0.02, z: 1.0, ry: Math.PI / 2 }
      );
    }

    // =========================================================================
    // PERIMETER FENCE SYSTEM (CHU VI HÀNG RÀO BÁN KÍNH 50.5m)
    // =========================================================================
    const FENCE_RADIUS = 50.5;
    const NUM_FENCES = 40;
    for (let i = 0; i < NUM_FENCES; i++) {
      // Leave open gaps for:
      // - South Main Gate: angles around 270 deg (i = 29, 30, 31)
      // - North Gate: angles around 90 deg (i = 9, 10, 11)
      // - East Gate: angles around 0 deg (i = 0, 1)
      // - West Gate: angles around 180 deg (i = 19, 20, 21)
      if (
        (i >= 29 && i <= 31) ||
        (i >= 9 && i <= 11) ||
        (i >= 0 && i <= 1) ||
        (i >= 19 && i <= 21)
      ) continue;

      const angle = (i / NUM_FENCES) * Math.PI * 2;
      const fx = Math.cos(angle) * FENCE_RADIUS;
      const fz = Math.sin(angle) * FENCE_RADIUS;
      const fenceType = (i % 2 === 0) ? 'Prop_WoodenFence_Extension1' : 'Prop_WoodenFence_Extension2';

      pieces.push({
        id: fenceType,
        x: fx,
        y: 0,
        z: fz,
        ry: -angle + Math.PI / 2
      });
    }

    // Shadow Caster
    const shadowGen = window.GameRuntime && window.GameRuntime.shadow;

    // Load and place all pieces efficiently
    for (const p of pieces) {
      try {
        const api = await window.ThonTranLoader.loadAsset(p.id);
        if (api) {
          const inst = api.createInstance('Village_' + p.id, villageRoot, scene);
          inst.position.set(p.x, p.y, p.z);
          inst.rotation.y = p.ry;
          if (p.scale) inst.scaling.setAll(p.scale);

          if (shadowGen && !p.id.startsWith('Floor_')) {
            inst.getChildMeshes(false).forEach(m => shadowGen.addShadowCaster(m));
          }
        }
      } catch (err) {
        console.warn('[ExpandedVillage] Error placing piece:', p.id, err);
      }
    }

    console.info('Đại Thôn Làng Bình An 10X: Đã quy hoạch & dựng xong toàn bộ 4 phân khu và quảng trường trung tâm!');
  }

  buildExpandedVillage();

  // Gentle barrier floating effect
  let t = 0;
  scene.onBeforeRenderObservable.add(() => {
    t += 0.012;
    if (barrierRing) {
      barrierRing.rotation.y += 0.002;
      barrierMat.alpha = 0.28 + Math.sin(t) * 0.08;
    }
    if (spawnFormation) {
      spawnCircleMat.alpha = 0.50 + Math.sin(t * 1.5) * 0.15;
    }
  });
})();
