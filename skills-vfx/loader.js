// Skill VFX Loader
// During normal index.html parsing this loads manifest entries synchronously before game.js.
(() => {
  'use strict';
  const manifest = Array.isArray(window.SKILL_VFX_MANIFEST) ? window.SKILL_VFX_MANIFEST : [];
  const seenIds = new Set();
  const seenFiles = new Set();
  const entries = [];

  for(const item of manifest){
    if(!item?.id || !item?.file) continue;
    if(seenIds.has(item.id)) throw new Error(`[SkillVfxLoader] Duplicate skill id in manifest: ${item.id}`);
    if(seenFiles.has(item.file)) throw new Error(`[SkillVfxLoader] Duplicate skill file in manifest: ${item.file}`);
    seenIds.add(item.id); seenFiles.add(item.file); entries.push(item);
  }

  const base = './skills-vfx/';
  let ready = Promise.resolve();

  if(document.readyState === 'loading'){
    // Safe here because loader.js itself is executed by the HTML parser.
    for(const item of entries){
      const src = base + item.file;
      document.write(`<script src="${src}" data-skill-vfx="${item.id}"></script>`);
    }
  }else{
    // Fallback for hot-reload/debug injection after the page has already loaded.
    ready = entries.reduce((chain,item)=>chain.then(()=>new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=base+item.file;
      script.dataset.skillVfx=item.id;
      script.onload=resolve;
      script.onerror=()=>reject(new Error(`[SkillVfxLoader] Cannot load ${item.file}`));
      document.head.appendChild(script);
    })), Promise.resolve());
  }

  window.SkillVfxLoader = Object.freeze({
    manifest: Object.freeze([...entries]),
    ready,
    ids: () => entries.map(x=>x.id)
  });
})();
