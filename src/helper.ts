export const CATEGORIES = {
  "Smileys & Emotion": '🧐',
  "People & Body": '✌',
  "Animals & Nature": '🌼',
  "Food & Drink": '🍔',
  "Travel & Places": '✈',
  "Activities": '⚽',
  "Objects": '⛏',
  "Symbols": '™',
  "Flags": '🚩',
};

export let fetchEmoji = async () => {
  const resp = await fetch("https://unpkg.com/@1-kb/emoji-picker/dist/assets/emoji.bin");
  const buf = await resp.arrayBuffer();

  return [...new Uint32Array(new Uint8Array(buf).buffer)]
    .map((item) => {
        const group = (item & 0b1111_00000000_0000000000000000000) >> 31 - 4;
        const count = (item & 0b0000_11111111_0000000000000000000) >> 31 - 4 - 8;
        const  code = (item & 0b0000_00000000_1111111111111111111);
        return Array.from({ length: count + 1 }).map((_, index) => {
            return {
                group: Object.keys(CATEGORIES)[group],
                 code: code + index,
                 char: String.fromCodePoint(code + index),
            }
        });
    })
    .flat()
    .reduce((groups, { group, char }) => {
        groups[group] = groups[group] || [];
        groups[group].push(char);
        return groups;
    }, {});
};

export const createSheet = (css: string) => {
    const el = new CSSStyleSheet();
    el.replaceSync(css);
    return el;
}