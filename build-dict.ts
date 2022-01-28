const fs = require('fs');
var SpellChecker = require('simple-spellchecker');

const checker = SpellChecker.getDictionarySync('it-IT');

const dictionary = fs.readFileSync('src/data/input.txt', 'utf-8').split('\n');


let lcount = 0;
let wcount = 0;
const buckets = dictionary.reduce((acc: any, line: string) => {
  lcount++;
  line.split(/\W/).forEach(word => {

    if (word.length < 3) {
      return;
    }

    word = word.toLowerCase()
      .replace('à', 'a')
      .replace('è', 'e')
      .replace('é', 'e')
      .replace('ì', 'i')
      .replace('ò', 'o')
      .replace('ù', 'u');

    if (!acc[word.length]) {
      acc[word.length] = [];
    }

    if (acc[word.length].includes(word)) {
      return;
    }

    if (!checker.spellCheck(word)) {
      return;
    }

    acc[word.length].push(word);
    wcount++;
  });
  if ((lcount % 1000) === 0) {
    console.log(`wcount: ${wcount}  lcount: ${lcount}`);
  }
  return acc;
}, {});

Object.keys(buckets).forEach(len => {
  if (+len > 20) {
    return
  }
  const s = new Set<string>();

  const current: string[] = fs.readFileSync(`src/assets/standard/${len}.txt`, 'utf-8').split('\n');

  current.forEach(word => s.add(word));
  buckets[len].forEach((word: string) => s.add(word));

  fs.writeFileSync(`src/assets/standard/${len}.txt`, Array.from(s).join('\n'));
});

