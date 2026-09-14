(function(global) {
  'use strict';
  
  const FLORA_CATALOG = {
    // Birch Trees
    'BirchTree_1': './assets/environment/flora/asset_birchtree_1.js',
    'BirchTree_2': './assets/environment/flora/asset_birchtree_2.js',
    'BirchTree_3': './assets/environment/flora/asset_birchtree_3.js',
    'BirchTree_4': './assets/environment/flora/asset_birchtree_4.js',
    'BirchTree_5': './assets/environment/flora/asset_birchtree_5.js',
    // Normal Trees
    'NormalTree_1': './assets/environment/flora/asset_normaltree_1.js',
    'NormalTree_2': './assets/environment/flora/asset_normaltree_2.js',
    'NormalTree_3': './assets/environment/flora/asset_normaltree_3.js',
    'NormalTree_4': './assets/environment/flora/asset_normaltree_4.js',
    'NormalTree_5': './assets/environment/flora/asset_normaltree_5.js',
    // Pine Trees
    'PineTree_1': './assets/environment/flora/asset_pinetree_1.js',
    'PineTree_2': './assets/environment/flora/asset_pinetree_2.js',
    'PineTree_3': './assets/environment/flora/asset_pinetree_3.js',
    'PineTree_4': './assets/environment/flora/asset_pinetree_4.js',
    'PineTree_5': './assets/environment/flora/asset_pinetree_5.js',
    // Maple Trees
    'MapleTree_1': './assets/environment/flora/asset_mapletree_1.js',
    'MapleTree_2': './assets/environment/flora/asset_mapletree_2.js',
    'MapleTree_3': './assets/environment/flora/asset_mapletree_3.js',
    'MapleTree_4': './assets/environment/flora/asset_mapletree_4.js',
    'MapleTree_5': './assets/environment/flora/asset_mapletree_5.js',
    // Palm Trees
    'PalmTree_1': './assets/environment/flora/asset_palmtree_1.js',
    'PalmTree_2': './assets/environment/flora/asset_palmtree_2.js',
    'PalmTree_3': './assets/environment/flora/asset_palmtree_3.js',
    'PalmTree_4': './assets/environment/flora/asset_palmtree_4.js',
    'PalmTree_5': './assets/environment/flora/asset_palmtree_5.js',
    // Dead Trees
    'DeadTree_1': './assets/environment/flora/asset_deadtree_1.js',
    'DeadTree_2': './assets/environment/flora/asset_deadtree_2.js',
    'DeadTree_3': './assets/environment/flora/asset_deadtree_3.js',
    'DeadTree_4': './assets/environment/flora/asset_deadtree_4.js',
    'DeadTree_5': './assets/environment/flora/asset_deadtree_5.js',
    'DeadTree_6': './assets/environment/flora/asset_deadtree_6.js',
    'DeadTree_7': './assets/environment/flora/asset_deadtree_7.js',
    'DeadTree_8': './assets/environment/flora/asset_deadtree_8.js',
    'DeadTree_9': './assets/environment/flora/asset_deadtree_9.js',
    'DeadTree_10': './assets/environment/flora/asset_deadtree_10.js',
    // Bushes
    'Bush': './assets/environment/flora/asset_bush.js',
    'Bush_Flowers': './assets/environment/flora/asset_bush_flowers.js',
    'Bush_Large': './assets/environment/flora/asset_bush_large.js',
    'Bush_Large_Flowers': './assets/environment/flora/asset_bush_large_flowers.js',
    'Bush_Small': './assets/environment/flora/asset_bush_small.js',
    'Bush_Small_Flowers': './assets/environment/flora/asset_bush_small_flowers.js',
    // Flowers & Plants
    'Flower_1': './assets/environment/flora/asset_flower_1.js',
    'Flower_1_Clump': './assets/environment/flora/asset_flower_1_clump.js',
    'Flower_2': './assets/environment/flora/asset_flower_2.js',
    'Flower_2_Clump': './assets/environment/flora/asset_flower_2_clump.js',
    'Flower_3_Clump': './assets/environment/flora/asset_flower_3_clump.js',
    'Flower_4_Clump': './assets/environment/flora/asset_flower_4_clump.js',
    'Flower_5_Clump': './assets/environment/flora/asset_flower_5_clump.js',
    'Plant_1': './assets/environment/flora/asset_plant_1.js',
    'Plant_2': './assets/environment/flora/asset_plant_2.js',
    'Plant_Flowers': './assets/environment/flora/asset_plant_flowers.js',
    'Petals_1': './assets/environment/flora/asset_petals_1.js',
    'Petals_2': './assets/environment/flora/asset_petals_2.js',
    'Petals_3': './assets/environment/flora/asset_petals_3.js',
    'Petals_4': './assets/environment/flora/asset_petals_4.js',
    // Grass
    'Grass_Large': './assets/environment/flora/asset_grass_large.js',
    'Grass_Large_Extruded': './assets/environment/flora/asset_grass_large_extruded.js',
    'Grass_Small': './assets/environment/flora/asset_grass_small.js',
    // Rocks
    'Rock_1': './assets/environment/flora/asset_rock_1.js',
    'Rock_2': './assets/environment/flora/asset_rock_2.js',
    'Rock_3': './assets/environment/flora/asset_rock_3.js',
    'Rock_4': './assets/environment/flora/asset_rock_4.js',
    'Rock_5': './assets/environment/flora/asset_rock_5.js'
  };

  const loadedScripts = new Set();

  function loadAsset(modelName) {
    return new Promise((resolve) => {
      if (global.FloraAssetRegistry && global.FloraAssetRegistry[modelName]) {
        return resolve(global.FloraAssetRegistry[modelName]);
      }
      const url = FLORA_CATALOG[modelName];
      if (!url) return resolve(null);
      if (loadedScripts.has(url)) {
        return resolve(global.FloraAssetRegistry ? global.FloraAssetRegistry[modelName] : null);
      }
      loadedScripts.add(url);
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => resolve(global.FloraAssetRegistry ? global.FloraAssetRegistry[modelName] : null);
      s.onerror = () => resolve(null);
      document.body.appendChild(s);
    });
  }

  function preloadKeyAssets() {
    const keyModels = [
      'BirchTree_1', 'NormalTree_1', 'PineTree_1', 'MapleTree_1',
      'PalmTree_1', 'DeadTree_1', 'Bush_Flowers', 'Flower_1_Clump',
      'Grass_Large_Extruded', 'Rock_1', 'Rock_3'
    ];
    return Promise.all(keyModels.map(loadAsset));
  }

  function preloadAll() {
    return Promise.all(Object.keys(FLORA_CATALOG).map(loadAsset));
  }

  // Preload all assets in idle time so map editor is instant
  if (typeof window !== 'undefined') {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => preloadAll());
    } else {
      setTimeout(() => preloadAll(), 500);
    }
  }

  global.FloraLoader = {
    catalog: FLORA_CATALOG,
    loadAsset: loadAsset,
    preloadKeyAssets: preloadKeyAssets,
    preloadAll: preloadAll,
    getAsset: (modelName) => global.FloraAssetRegistry ? global.FloraAssetRegistry[modelName] : null
  };
})(typeof window !== 'undefined' ? window : this);
