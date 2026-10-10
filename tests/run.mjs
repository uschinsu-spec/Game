import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
function run(command,args){
  const result=spawnSync(command,args,{cwd:root,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
function files(dir){
  return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const path=join(dir,entry.name);
    return entry.isDirectory()?files(path):[path];
  });
}
for(const file of files(join(root,'src')).filter(path=>path.endsWith('.js'))){
  run(process.execPath,['--check',file]);
}
run(process.execPath,['--check','cultivation_engine.js']);
const suites=[...files(join(root,'tools')),...files(join(root,'tests'))]
  .filter(path=>/\b(test_[^/\\]+|verify_cultivation)\.mjs$/.test(path)).sort();
for(const suite of suites)run(process.execPath,[suite]);
const pythonIndex=process.argv.indexOf('--python');
if(pythonIndex!==-1){
  if(!process.argv[pythonIndex+1])throw new Error('Thiếu đường dẫn Python sau --python');
  run(process.argv[pythonIndex+1],['tools/verify_assets.py']);
}
console.log(`PASS: source syntax and ${suites.length} test suites`);
