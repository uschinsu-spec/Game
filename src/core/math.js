export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const rand=(a,b)=>a+Math.random()*(b-a);
export const easing=t=>1-Math.pow(1-t,3);

