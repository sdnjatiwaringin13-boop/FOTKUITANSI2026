import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const source=resolve('public'), out=resolve('dist');
if(!existsSync(source)) throw new Error('Folder public tidak ditemukan.');
mkdirSync(out,{recursive:true});
cpSync(source,out,{recursive:true,force:true});
console.log('Build selesai: public/ -> dist/');
