import { promises as fs } from 'fs';
import { join } from 'path';

async function main(){
    // 日付ごと
    const data:{[key:string]:{[key:string]:number}} = {};

    const csv = await fs.readFile(join(__dirname, 'individuals.csv'), 'utf8');
    csv.split(/\r\n|\n/).forEach((line, index)=>{
        if(index == 0){
            return;
        }
        if(!line){
            return;
        }
        const items = line.split(',');

        const prefecture = items[7];
        // 国内のみ
        if(prefecture.includes('中国') || prefecture.includes('不明')){
            return;
        }

        const year = items[2];
        const month = items[3];
        const date = items[4];
        const d = `${year}/${month}/${date}`;

        if(!data[d]){
            data[d] = {};
        }
        if(!data[d][prefecture]){
            data[d][prefecture] = 0;
        }
        data[d][prefecture] += 1;
    });
    await fs.writeFile(join(__dirname, 'parsed_3_24.json'), JSON.stringify(data, null, '\t'));
}

(async()=>{
    await main();
})();
