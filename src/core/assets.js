const pending=new Map();

/** Share in-flight requests; completed map images remain owned by the bounded LRU. */
export function loadImage(name){
  if(pending.has(name))return pending.get(name);
  const request=new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error(`Không tải được asset: ${name}.webp`));
    img.src=new URL(`../../assets/webp/${name}.webp`,import.meta.url).href;
  }).finally(()=>pending.delete(name));
  pending.set(name,request);
  return request;
}
