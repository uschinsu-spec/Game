(function(global) {
  'use strict';

  const THON_TRAN_CATALOG = {
  "Balcony_Cross_Corner": "./assets/THON TRAN/asset_balcony_cross_corner.js",
  "Balcony_Cross_Straight": "./assets/THON TRAN/asset_balcony_cross_straight.js",
  "Balcony_Simple_Corner": "./assets/THON TRAN/asset_balcony_simple_corner.js",
  "Balcony_Simple_Straight": "./assets/THON TRAN/asset_balcony_simple_straight.js",
  "Corner_ExteriorWide_Brick": "./assets/THON TRAN/asset_corner_exteriorwide_brick.js",
  "Corner_ExteriorWide_Wood": "./assets/THON TRAN/asset_corner_exteriorwide_wood.js",
  "Corner_Exterior_Brick": "./assets/THON TRAN/asset_corner_exterior_brick.js",
  "Corner_Exterior_TopDown": "./assets/THON TRAN/asset_corner_exterior_topdown.js",
  "Corner_Exterior_TopOnly": "./assets/THON TRAN/asset_corner_exterior_toponly.js",
  "Corner_Exterior_Wood": "./assets/THON TRAN/asset_corner_exterior_wood.js",
  "Corner_Interior_Big": "./assets/THON TRAN/asset_corner_interior_big.js",
  "Corner_Interior_Small": "./assets/THON TRAN/asset_corner_interior_small.js",
  "DoorFrame_Flat_Brick": "./assets/THON TRAN/asset_doorframe_flat_brick.js",
  "DoorFrame_Flat_WoodDark": "./assets/THON TRAN/asset_doorframe_flat_wooddark.js",
  "DoorFrame_Round_Brick": "./assets/THON TRAN/asset_doorframe_round_brick.js",
  "DoorFrame_Round_WoodDark": "./assets/THON TRAN/asset_doorframe_round_wooddark.js",
  "Door_1_Flat": "./assets/THON TRAN/asset_door_1_flat.js",
  "Door_1_Round": "./assets/THON TRAN/asset_door_1_round.js",
  "Door_2_Flat": "./assets/THON TRAN/asset_door_2_flat.js",
  "Door_2_Round": "./assets/THON TRAN/asset_door_2_round.js",
  "Door_4_Flat": "./assets/THON TRAN/asset_door_4_flat.js",
  "Door_4_Round": "./assets/THON TRAN/asset_door_4_round.js",
  "Door_8_Flat": "./assets/THON TRAN/asset_door_8_flat.js",
  "Door_8_Round": "./assets/THON TRAN/asset_door_8_round.js",
  "Floor_Brick": "./assets/THON TRAN/asset_floor_brick.js",
  "Floor_RedBrick": "./assets/THON TRAN/asset_floor_redbrick.js",
  "Floor_UnevenBrick": "./assets/THON TRAN/asset_floor_unevenbrick.js",
  "Floor_WoodDark": "./assets/THON TRAN/asset_floor_wooddark.js",
  "Floor_WoodDark_Half1": "./assets/THON TRAN/asset_floor_wooddark_half1.js",
  "Floor_WoodDark_Half2": "./assets/THON TRAN/asset_floor_wooddark_half2.js",
  "Floor_WoodDark_Half3": "./assets/THON TRAN/asset_floor_wooddark_half3.js",
  "Floor_WoodDark_OverhangCorner": "./assets/THON TRAN/asset_floor_wooddark_overhangcorner.js",
  "Floor_WoodDark_OverhangCorner2": "./assets/THON TRAN/asset_floor_wooddark_overhangcorner2.js",
  "Floor_WoodLight": "./assets/THON TRAN/asset_floor_woodlight.js",
  "Floor_WoodLight_OverhangCorner": "./assets/THON TRAN/asset_floor_woodlight_overhangcorner.js",
  "Floor_WoodLight_OverhangCorner2": "./assets/THON TRAN/asset_floor_woodlight_overhangcorner2.js",
  "HoleCover_90Angle": "./assets/THON TRAN/asset_holecover_90angle.js",
  "HoleCover_90Half": "./assets/THON TRAN/asset_holecover_90half.js",
  "HoleCover_90Stairs": "./assets/THON TRAN/asset_holecover_90stairs.js",
  "HoleCover_Straight": "./assets/THON TRAN/asset_holecover_straight.js",
  "HoleCover_StraightHalf": "./assets/THON TRAN/asset_holecover_straighthalf.js",
  "Overhang_Plaster_Corner": "./assets/THON TRAN/asset_overhang_plaster_corner.js",
  "Overhang_Plaster_Corner_Front": "./assets/THON TRAN/asset_overhang_plaster_corner_front.js",
  "Overhang_Plaster_Long": "./assets/THON TRAN/asset_overhang_plaster_long.js",
  "Overhang_Plaster_Short": "./assets/THON TRAN/asset_overhang_plaster_short.js",
  "Overhang_RoofIncline_Plaster": "./assets/THON TRAN/asset_overhang_roofincline_plaster.js",
  "Overhang_RoofIncline_UnevenBricks": "./assets/THON TRAN/asset_overhang_roofincline_unevenbricks.js",
  "Overhang_Roof_Plaster": "./assets/THON TRAN/asset_overhang_roof_plaster.js",
  "Overhang_Roof_UnevenBricks": "./assets/THON TRAN/asset_overhang_roof_unevenbricks.js",
  "Overhang_Side_Plaster_Long_L": "./assets/THON TRAN/asset_overhang_side_plaster_long_l.js",
  "Overhang_Side_Plaster_Long_R": "./assets/THON TRAN/asset_overhang_side_plaster_long_r.js",
  "Overhang_Side_Plaster_Short_L": "./assets/THON TRAN/asset_overhang_side_plaster_short_l.js",
  "Overhang_Side_Plaster_Short_R": "./assets/THON TRAN/asset_overhang_side_plaster_short_r.js",
  "Overhang_Side_UnevenBrick_Long_L": "./assets/THON TRAN/asset_overhang_side_unevenbrick_long_l.js",
  "Overhang_Side_UnevenBrick_Long_R": "./assets/THON TRAN/asset_overhang_side_unevenbrick_long_r.js",
  "Overhang_Side_UnevenBrick_Short_L": "./assets/THON TRAN/asset_overhang_side_unevenbrick_short_l.js",
  "Overhang_Side_UnevenBrick_Short_R": "./assets/THON TRAN/asset_overhang_side_unevenbrick_short_r.js",
  "Overhang_UnevenBrick_Corner": "./assets/THON TRAN/asset_overhang_unevenbrick_corner.js",
  "Overhang_UnevenBrick_Corner_Front": "./assets/THON TRAN/asset_overhang_unevenbrick_corner_front.js",
  "Overhang_UnevenBrick_Long": "./assets/THON TRAN/asset_overhang_unevenbrick_long.js",
  "Overhang_UnevenBrick_Short": "./assets/THON TRAN/asset_overhang_unevenbrick_short.js",
  "Prop_Brick1": "./assets/THON TRAN/asset_prop_brick1.js",
  "Prop_Brick2": "./assets/THON TRAN/asset_prop_brick2.js",
  "Prop_Brick3": "./assets/THON TRAN/asset_prop_brick3.js",
  "Prop_Brick4": "./assets/THON TRAN/asset_prop_brick4.js",
  "Prop_Chimney": "./assets/THON TRAN/asset_prop_chimney.js",
  "Prop_Chimney2": "./assets/THON TRAN/asset_prop_chimney2.js",
  "Prop_Crate": "./assets/THON TRAN/asset_prop_crate.js",
  "Prop_ExteriorBorder_Corner": "./assets/THON TRAN/asset_prop_exteriorborder_corner.js",
  "Prop_ExteriorBorder_Straight1": "./assets/THON TRAN/asset_prop_exteriorborder_straight1.js",
  "Prop_ExteriorBorder_Straight2": "./assets/THON TRAN/asset_prop_exteriorborder_straight2.js",
  "Prop_MetalFence_Ornament": "./assets/THON TRAN/asset_prop_metalfence_ornament.js",
  "Prop_MetalFence_Simple": "./assets/THON TRAN/asset_prop_metalfence_simple.js",
  "Prop_Support": "./assets/THON TRAN/asset_prop_support.js",
  "Prop_Vine1": "./assets/THON TRAN/asset_prop_vine1.js",
  "Prop_Vine2": "./assets/THON TRAN/asset_prop_vine2.js",
  "Prop_Vine4": "./assets/THON TRAN/asset_prop_vine4.js",
  "Prop_Vine5": "./assets/THON TRAN/asset_prop_vine5.js",
  "Prop_Vine6": "./assets/THON TRAN/asset_prop_vine6.js",
  "Prop_Vine9": "./assets/THON TRAN/asset_prop_vine9.js",
  "Prop_Wagon": "./assets/THON TRAN/asset_prop_wagon.js",
  "Prop_WoodenFence_Extension1": "./assets/THON TRAN/asset_prop_woodenfence_extension1.js",
  "Prop_WoodenFence_Extension2": "./assets/THON TRAN/asset_prop_woodenfence_extension2.js",
  "Prop_WoodenFence_Single": "./assets/THON TRAN/asset_prop_woodenfence_single.js",
  "Roof_2x4_RoundTile": "./assets/THON TRAN/asset_roof_2x4_roundtile.js",
  "Roof_Dormer_RoundTile": "./assets/THON TRAN/asset_roof_dormer_roundtile.js",
  "Roof_FrontSupports": "./assets/THON TRAN/asset_roof_frontsupports.js",
  "Roof_Front_Brick2": "./assets/THON TRAN/asset_roof_front_brick2.js",
  "Roof_Front_Brick4": "./assets/THON TRAN/asset_roof_front_brick4.js",
  "Roof_Front_Brick4_Half_L": "./assets/THON TRAN/asset_roof_front_brick4_half_l.js",
  "Roof_Front_Brick4_Half_R": "./assets/THON TRAN/asset_roof_front_brick4_half_r.js",
  "Roof_Front_Brick6": "./assets/THON TRAN/asset_roof_front_brick6.js",
  "Roof_Front_Brick6_Half_L": "./assets/THON TRAN/asset_roof_front_brick6_half_l.js",
  "Roof_Front_Brick6_Half_R": "./assets/THON TRAN/asset_roof_front_brick6_half_r.js",
  "Roof_Front_Brick8": "./assets/THON TRAN/asset_roof_front_brick8.js",
  "Roof_Front_Brick8_Half_L": "./assets/THON TRAN/asset_roof_front_brick8_half_l.js",
  "Roof_Front_Brick8_Half_R": "./assets/THON TRAN/asset_roof_front_brick8_half_r.js",
  "Roof_Log": "./assets/THON TRAN/asset_roof_log.js",
  "Roof_Modular_RoundTiles": "./assets/THON TRAN/asset_roof_modular_roundtiles.js",
  "Roof_RoundTile_2x1": "./assets/THON TRAN/asset_roof_roundtile_2x1.js",
  "Roof_RoundTile_2x1_Long": "./assets/THON TRAN/asset_roof_roundtile_2x1_long.js",
  "Roof_RoundTiles_4x4": "./assets/THON TRAN/asset_roof_roundtiles_4x4.js",
  "Roof_RoundTiles_4x6": "./assets/THON TRAN/asset_roof_roundtiles_4x6.js",
  "Roof_RoundTiles_4x8": "./assets/THON TRAN/asset_roof_roundtiles_4x8.js",
  "Roof_RoundTiles_6x10": "./assets/THON TRAN/asset_roof_roundtiles_6x10.js",
  "Roof_RoundTiles_6x12": "./assets/THON TRAN/asset_roof_roundtiles_6x12.js",
  "Roof_RoundTiles_6x14": "./assets/THON TRAN/asset_roof_roundtiles_6x14.js",
  "Roof_RoundTiles_6x4": "./assets/THON TRAN/asset_roof_roundtiles_6x4.js",
  "Roof_RoundTiles_6x6": "./assets/THON TRAN/asset_roof_roundtiles_6x6.js",
  "Roof_RoundTiles_6x8": "./assets/THON TRAN/asset_roof_roundtiles_6x8.js",
  "Roof_RoundTiles_8x10": "./assets/THON TRAN/asset_roof_roundtiles_8x10.js",
  "Roof_RoundTiles_8x12": "./assets/THON TRAN/asset_roof_roundtiles_8x12.js",
  "Roof_RoundTiles_8x14": "./assets/THON TRAN/asset_roof_roundtiles_8x14.js",
  "Roof_RoundTiles_8x8": "./assets/THON TRAN/asset_roof_roundtiles_8x8.js",
  "Roof_Support2": "./assets/THON TRAN/asset_roof_support2.js",
  "Roof_Tower_RoundTiles": "./assets/THON TRAN/asset_roof_tower_roundtiles.js",
  "Roof_Wooden_2x1": "./assets/THON TRAN/asset_roof_wooden_2x1.js",
  "Roof_Wooden_2x1_Center": "./assets/THON TRAN/asset_roof_wooden_2x1_center.js",
  "Roof_Wooden_2x1_Center_Mirror": "./assets/THON TRAN/asset_roof_wooden_2x1_center_mirror.js",
  "Roof_Wooden_2x1_Corner": "./assets/THON TRAN/asset_roof_wooden_2x1_corner.js",
  "Roof_Wooden_2x1_L": "./assets/THON TRAN/asset_roof_wooden_2x1_l.js",
  "Roof_Wooden_2x1_Middle": "./assets/THON TRAN/asset_roof_wooden_2x1_middle.js",
  "Roof_Wooden_2x1_R": "./assets/THON TRAN/asset_roof_wooden_2x1_r.js",
  "Stair_Interior_Rails": "./assets/THON TRAN/asset_stair_interior_rails.js",
  "Stair_Interior_Simple": "./assets/THON TRAN/asset_stair_interior_simple.js",
  "Stair_Interior_Solid": "./assets/THON TRAN/asset_stair_interior_solid.js",
  "Stair_Interior_SolidExtended": "./assets/THON TRAN/asset_stair_interior_solidextended.js",
  "Stairs_Exterior_NoFirstStep": "./assets/THON TRAN/asset_stairs_exterior_nofirststep.js",
  "Stairs_Exterior_Platform": "./assets/THON TRAN/asset_stairs_exterior_platform.js",
  "Stairs_Exterior_Platform45": "./assets/THON TRAN/asset_stairs_exterior_platform45.js",
  "Stairs_Exterior_Platform45Clean": "./assets/THON TRAN/asset_stairs_exterior_platform45clean.js",
  "Stairs_Exterior_PlatformU": "./assets/THON TRAN/asset_stairs_exterior_platformu.js",
  "Stairs_Exterior_SidePlatform": "./assets/THON TRAN/asset_stairs_exterior_sideplatform.js",
  "Stairs_Exterior_Sides": "./assets/THON TRAN/asset_stairs_exterior_sides.js",
  "Stairs_Exterior_Sides45": "./assets/THON TRAN/asset_stairs_exterior_sides45.js",
  "Stairs_Exterior_SidesU": "./assets/THON TRAN/asset_stairs_exterior_sidesu.js",
  "Stairs_Exterior_SingleSide": "./assets/THON TRAN/asset_stairs_exterior_singleside.js",
  "Stairs_Exterior_SingleSideThick": "./assets/THON TRAN/asset_stairs_exterior_singlesidethick.js",
  "Stairs_Exterior_Straight": "./assets/THON TRAN/asset_stairs_exterior_straight.js",
  "Stairs_Exterior_Straight_Center": "./assets/THON TRAN/asset_stairs_exterior_straight_center.js",
  "Stairs_Exterior_Straight_L": "./assets/THON TRAN/asset_stairs_exterior_straight_l.js",
  "Stairs_Exterior_Straight_R": "./assets/THON TRAN/asset_stairs_exterior_straight_r.js",
  "Wall_Arch": "./assets/THON TRAN/asset_wall_arch.js",
  "Wall_BottomCover": "./assets/THON TRAN/asset_wall_bottomcover.js",
  "Wall_Plaster_Door_Flat": "./assets/THON TRAN/asset_wall_plaster_door_flat.js",
  "Wall_Plaster_Door_Round": "./assets/THON TRAN/asset_wall_plaster_door_round.js",
  "Wall_Plaster_Door_RoundInset": "./assets/THON TRAN/asset_wall_plaster_door_roundinset.js",
  "Wall_Plaster_Straight": "./assets/THON TRAN/asset_wall_plaster_straight.js",
  "Wall_Plaster_Straight_Base": "./assets/THON TRAN/asset_wall_plaster_straight_base.js",
  "Wall_Plaster_Straight_L": "./assets/THON TRAN/asset_wall_plaster_straight_l.js",
  "Wall_Plaster_Straight_R": "./assets/THON TRAN/asset_wall_plaster_straight_r.js",
  "Wall_Plaster_Window_Thin_Round": "./assets/THON TRAN/asset_wall_plaster_window_thin_round.js",
  "Wall_Plaster_Window_Wide_Flat": "./assets/THON TRAN/asset_wall_plaster_window_wide_flat.js",
  "Wall_Plaster_Window_Wide_Flat2": "./assets/THON TRAN/asset_wall_plaster_window_wide_flat2.js",
  "Wall_Plaster_Window_Wide_Round": "./assets/THON TRAN/asset_wall_plaster_window_wide_round.js",
  "Wall_Plaster_WoodGrid": "./assets/THON TRAN/asset_wall_plaster_woodgrid.js",
  "Wall_UnevenBrick_Door_Flat": "./assets/THON TRAN/asset_wall_unevenbrick_door_flat.js",
  "Wall_UnevenBrick_Door_Round": "./assets/THON TRAN/asset_wall_unevenbrick_door_round.js",
  "Wall_UnevenBrick_Straight": "./assets/THON TRAN/asset_wall_unevenbrick_straight.js",
  "Wall_UnevenBrick_Window_Thin_Round": "./assets/THON TRAN/asset_wall_unevenbrick_window_thin_round.js",
  "Wall_UnevenBrick_Window_Wide_Flat": "./assets/THON TRAN/asset_wall_unevenbrick_window_wide_flat.js",
  "Wall_UnevenBrick_Window_Wide_Round": "./assets/THON TRAN/asset_wall_unevenbrick_window_wide_round.js",
  "WindowShutters_Thin_Flat_Closed": "./assets/THON TRAN/asset_windowshutters_thin_flat_closed.js",
  "WindowShutters_Thin_Flat_Open": "./assets/THON TRAN/asset_windowshutters_thin_flat_open.js",
  "WindowShutters_Thin_Round_Closed": "./assets/THON TRAN/asset_windowshutters_thin_round_closed.js",
  "WindowShutters_Thin_Round_Open": "./assets/THON TRAN/asset_windowshutters_thin_round_open.js",
  "WindowShutters_Wide_Flat_Closed": "./assets/THON TRAN/asset_windowshutters_wide_flat_closed.js",
  "WindowShutters_Wide_Flat_Open": "./assets/THON TRAN/asset_windowshutters_wide_flat_open.js",
  "WindowShutters_Wide_Round_Closed": "./assets/THON TRAN/asset_windowshutters_wide_round_closed.js",
  "WindowShutters_Wide_Round_Open": "./assets/THON TRAN/asset_windowshutters_wide_round_open.js",
  "Window_Roof_Thin": "./assets/THON TRAN/asset_window_roof_thin.js",
  "Window_Roof_Wide": "./assets/THON TRAN/asset_window_roof_wide.js",
  "Window_Thin_Flat1": "./assets/THON TRAN/asset_window_thin_flat1.js",
  "Window_Thin_Round1": "./assets/THON TRAN/asset_window_thin_round1.js",
  "Window_Wide_Flat1": "./assets/THON TRAN/asset_window_wide_flat1.js",
  "Window_Wide_Round1": "./assets/THON TRAN/asset_window_wide_round1.js"
};
  const loadedScripts = new Set();

  function loadAsset(modelName) {
    return new Promise((resolve) => {
      if (global.ThonTranRegistry && global.ThonTranRegistry[modelName]) {
        return resolve(global.ThonTranRegistry[modelName]);
      }
      const url = THON_TRAN_CATALOG[modelName];
      if (!url) return resolve(null);
      if (loadedScripts.has(url)) {
        return resolve(global.ThonTranRegistry ? global.ThonTranRegistry[modelName] : null);
      }
      loadedScripts.add(url);
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => resolve(global.ThonTranRegistry ? global.ThonTranRegistry[modelName] : null);
      s.onerror = () => resolve(null);
      document.body.appendChild(s);
    });
  }

  function preloadCategory(catId, manifestData) {
    if (!manifestData) return Promise.resolve([]);
    const keys = Object.keys(manifestData).filter(k => manifestData[k].category === catId);
    return Promise.all(keys.map(loadAsset));
  }

  function preloadAll() {
    return Promise.all(Object.keys(THON_TRAN_CATALOG).map(loadAsset));
  }

  // Preload in idle time
  if (typeof window !== 'undefined') {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => preloadAll());
    } else {
      setTimeout(() => preloadAll(), 1000);
    }
  }

  global.ThonTranLoader = {
    catalog: THON_TRAN_CATALOG,
    loadAsset: loadAsset,
    preloadCategory: preloadCategory,
    preloadAll: preloadAll,
    getAsset: (modelName) => global.ThonTranRegistry ? global.ThonTranRegistry[modelName] : null
  };
})(typeof window !== 'undefined' ? window : this);
