import { promises as fs } from 'fs';
import { join } from 'path';
import axios from 'axios';
import cheerio from 'cheerio';

const beforeFile = 'https://www.mhlw.go.jp/stf/newpage_10465.html';
const afterFile = 'https://www.mhlw.go.jp/stf/newpage_10521.html';
const afterDate = '2020/3/27';

async function count(){

    const parse = async(url:string)=>{
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const tables = $('table');
        let index = -1;
        tables.each((i, el)=>{
            if(!$(el).find('td').eq(0).text().startsWith('都道府県')){
                return;
            }
            index = i;
        });
        if(index == -1){
            return;
        }

        const ret:{[key:string]:number} = {};
        const table = tables.eq(index);
        table.find('tr').each((i, el)=>{
            if(i == 0){
                return;
            }
            const items = $(el).find('td');
            const prefecture = items.eq(0).text();
            const count = Number(items.eq(1).text());
            ret[prefecture] = count;
        });
    
        return ret;
    }
    const before = await parse(beforeFile);
    if(!before){
        return;
    }
    const after = await parse(afterFile);
    if(!after){
        return;
    }

    const diff:{[key:string]:number} = {};
    for(const key in after){
        if(!before[key]){
            continue;
        }
        const value = after[key] - before[key];
        if(value == 0){
            continue;
        }
        diff[key] = value;
    }

    const data:{[key:string]:{[key:string]:number}} = JSON.parse(await fs.readFile(join(__dirname, 'diff.json'), 'utf8'));
    data[afterDate] = diff;
    await fs.writeFile(join(__dirname, 'diff.json'), JSON.stringify(data, null, '\t'));
}

async function write(){
    await fs.copyFile(join(__dirname, '../pages/index.html'), join(__dirname, '../../index.html'));

    const html = await fs.readFile(join(__dirname, '../../index.html'), 'utf8');
    const data = await fs.readFile(join(__dirname, 'diff.json'), 'utf8');

    await fs.writeFile(join(__dirname,  '../../index.html'), html.replace('__template__', data));
}

async function total(){

    const data:{[key:string]:{[key:string]:number}} = JSON.parse(await fs.readFile(join(__dirname, 'diff.json'), 'utf8'));
    for(const key in data){
        if(data[key]['総計'] != null){
            continue;
        }
        let total = 0;
        for(const prefecture in data[key]){
            total += data[key][prefecture];
        }
        data[key]['総計'] = total;
    }
    await fs.writeFile(join(__dirname, 'diff.json'), JSON.stringify(data, null, '\t'));
}

(async()=>{
    await count();
    // await total();
    await write();
})();
