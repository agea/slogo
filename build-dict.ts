const fs = require('fs');


const dictionary = fs.readFileSync('src/data/dictionary.txt', 'utf-8').split('\n');

const buckets = dictionary.reduce((acc: { [len: number]: string[] }, word: string) => {
  if (!acc[word.length]) {
    acc[word.length] = [];
  }
  acc[word.length].push(word);
  return acc;
}, {});

Object.keys(buckets).forEach(len => {
  fs.writeFileSync(`src/assets/${len}.txt`, buckets[len].join('\n'));
});