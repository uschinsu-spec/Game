// Rows are zero-based. Keep sword art separate from generic metal art.
export const SKILL_VFX_ROWS=Object.freeze({Kiếm:0,Hỏa:1,Lôi:2,Kim:3,Thủy:4,Phong:5,Mộc:6,Thổ:7,'Vật Lý':8});
export const SKILL_VFX=Object.freeze({asset:'luyen_khi_9he_7frame',columns:12,rows:9,width:128,height:64});
// The replacement sheet has uneven cells. Exclude the separator lines.
const FRAME_X=Object.freeze([[3,125],[132,267],[275,414],[421,566],[573,720],[727,882],[889,1044],[1051,1210],[1217,1376],[1382,1507],[1514,1641],[1648,1770]]);
const FRAME_Y=Object.freeze([[3,94],[101,187],[195,283],[291,370],[378,466],[476,567],[577,662],[670,761],[770,883]]);
export function skillVfxFrame(row,column){
  const [left,right]=FRAME_X[column];
  const [top,bottom]=FRAME_Y[row];
  return {x:left,y:top,width:right-left,height:bottom-top};
}
export const SKILL_COLORS=Object.freeze({Kiếm:'#fff1b5',Hỏa:'#ff782c',Lôi:'#ad7bff',Kim:'#ffcf58',Thủy:'#64dcff',Phong:'#8df5d1',Mộc:'#76d85d',Thổ:'#dc9854','Vật Lý':'#dce9ff'});
export function skillColor(skill){return SKILL_COLORS[skill.id.startsWith('kiem_')?'Kiếm':skill.elem]||'#dce9ff'}
export function skillVfxRow(skill){
  return SKILL_VFX_ROWS[skill.id.startsWith('kiem_')?'Kiếm':skill.elem];
}
