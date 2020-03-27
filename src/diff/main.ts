import { promises as fs } from 'fs';
import { join } from 'path';

const beforeFile = 'data_3_26.json';
const afterFile = 'data_3_27.json';
const afterDate = '2020/3/27';

type Prefecture = {
    code: number;
    ja: string;
    en: string;
    value: number;
}

async function main(){
    const before:{prefectures: Prefecture[]} = JSON.parse(await fs.readFile(join(__dirname, '../data', beforeFile), 'utf8'));
    const after:{prefectures: Prefecture[]} = JSON.parse(await fs.readFile(join(__dirname, '../data', afterFile), 'utf8'));

    const diff:{[key:string]:number} = {};
    after.prefectures.forEach((item)=>{
        const b = before.prefectures.find((b)=>{
            return b.code == item.code;
        });
        if(!b){
            return;
        }
        const value = item.value - b.value;
        if(value == 0){
            return;
        }
        diff[item.ja] = value;
    });

    const data:{[key:string]:{[key:string]:number}} = JSON.parse(await fs.readFile(join(__dirname, 'diff.json'), 'utf8'));
    data[afterDate] = diff;
    await fs.writeFile(join(__dirname, 'diff.json'), JSON.stringify(data, null, '\t'));
}

(async()=>{
    await main();
})();
