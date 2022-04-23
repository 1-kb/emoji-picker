import emojiJSON from 'https://unpkg.com/emoji.json@13.1.0/emoji.json' assert { type: "json" };

interface EmojiJSON {
    codes: string;
    char: string;
    name: string;
    category: string;
    group: string;
    subgroup: string;
}

const groupBy = (key: keyof EmojiJSON) => (map: Record<string, number>[][] = [], item: Record<string, number>) => {
    map[item[key]] = (map[item[key]] || []);
    map[item[key]].push(item);
    return map;
}

const rangeFinder = (key: string) => (map: any[][] = [], item: Record<string, number>, index: number) => {
    if (map[item[key] - index]) {
        map[item[key] - index][1] = (map[item[key] - index][1] || 0) + 1;
    } else {
        map[item[key] - index] = [item];
    }
    return map;
}

const collectTokenFactory = (tokens: Map<any, any>) => (token: string) => tokens.has(token) ? tokens.get(token) : (tokens.set(token, tokens.size), tokens.size - 1)

const collectToken = (key: string) => {
    const tokens = new Map();
    const collect = collectTokenFactory(tokens);
    return Object.assign(function ({ group, ...rest }: any) {
        return {
            ...rest,
            group: collect(group),
        };
    }, {
        tokens,
    })
}

const collectSplitedToken = (key: string) => {
    const tokens = new Map();
    const collect = collectTokenFactory(tokens);
    return Object.assign(function ({ name, ...rest }: any) {
        return {
            ...rest,
            name: name.split(' ').map(collect),
        };
    }, {
        tokens,
    })
}

const collectA = collectToken('group');
const collectB = collectSplitedToken('name');

const rawBuffer = (emojiJSON as EmojiJSON[])
    .filter(({ codes }) => codes.split(' ').length === 1)
    .filter(({ group }) => !/component/i.test(group))
    .map(({ codes, category, subgroup, char, ...rest }) => ({ code: parseInt(codes, 16), ...rest }))
    .map(collectA).map(collectB).sort(({ code: prev }, { code: next }) => prev - next)
    .map(({ group, code, ...rest }) => ({ index: (group << 31 - 10) ^ code, group, code, ...rest }))
    .reduce(rangeFinder('index') as any, []).filter((e: any) => !!e)
    .map(([{ code, group }, count]: any) => {
        return { group, count: count || 0, code }; // [...new Uint8Array([count, ...new Uint8Array(new Uint32Array([code]).buffer)])];
    });

const summary = (arr: number[]) => {
    const max = Math.max(...arr);
    return {
        max,
        bin: max.toString(2),
        size: max.toString(2).length,
    }
}

const result: Record<string, Record<string, number>> = Object.keys(rawBuffer[0]).reduce((result: any, key: any) => {
    result[key] = summary(rawBuffer.map((i: any) => i[key]))
    return result;
}, { length: rawBuffer.length });

console.table(result)
if (Object.values(result).map((i) => i.size).reduce((sum: number, i: number) => sum + i, 0) > 32) {
    throw new Error();
}

const buffer = rawBuffer.map(({ code, group, count }: Record<string, number>) => {
    return [...new Uint8Array(new Uint32Array([(group << 31 - 4) ^ (count << 31 - 4 - 8) ^ code]).buffer)]; // 600 517
    // return [group, count, ...new Uint8Array(new Uint32Array([code]).buffer)] // 900 515
});

console.log(JSON.stringify(rawBuffer, undefined, 4), buffer, [...collectA.tokens.keys()], [...collectB.tokens.keys()]);

await Deno.writeFile("./public/assets/emoji.bin", new Uint8Array(buffer.flat()));
