import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {loadImage,ASSET_PATHS} from '../src/core/assets.js';

const images=[];
globalThis.Image=class {constructor(){images.push(this)}};
const first=loadImage('MAP/map3'),second=loadImage('MAP/map3');
assert.equal(first,second);assert.equal(images.length,1);
assert.ok(images[0].src.endsWith('/assets/webp/MAP/map3.webp'));
images[0].onload();assert.equal(await first,images[0]);
const next=loadImage('MAP/map3');assert.equal(images.length,2);
images[1].onerror();await assert.rejects(next,/MAP\/map3.webp/);
const retry=loadImage('MAP/map3');assert.equal(images.length,3);
images[2].onload();await retry;
console.log('PASS: asset URLs, shared in-flight loads, released cache and retry after failure');

for(const [id,asset] of Object.entries(ASSET_PATHS)){
 assert.ok(existsSync(new URL('../assets/webp/'+asset+'.webp',import.meta.url)),id+' asset exists');
 const request=loadImage(id),image=images.at(-1);
 assert.ok(image.src.endsWith('/assets/webp/'+asset+'.webp'),id+' resolves to its organized folder');
 image.onload();await request;
}
console.log('PASS: all organized asset aliases resolve to existing WebP files');
