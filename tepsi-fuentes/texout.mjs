import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'fs';
const [,,inp,dir,mode,out]=process.argv;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc=await io.read(inp);
const re=/ponytail|braid|short|eyebrow|eyelash|bob|long|pigtail/i;
const texs=[];for(const m of doc.getRoot().listMaterials()){if(!re.test(m.getName()))continue;const t=m.getBaseColorTexture();if(t&&!texs.includes(t))texs.push(t);}
if(mode==='out'){fs.mkdirSync(dir,{recursive:true});texs.forEach((t,i)=>fs.writeFileSync(`${dir}/t${i}.png`,t.getImage()));console.log(texs.length,'texturas');}
else{texs.forEach((t,i)=>{t.setImage(fs.readFileSync(`${dir}/t${i}.png`));t.setMimeType('image/png');});await io.write(out,doc);console.log('ok');}
