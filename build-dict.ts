const fs = require('fs');

const dictionary = fs.readFileSync('src/data/dictionary_small.txt', 'utf-8').split('\n');

const buckets = dictionary.reduce((acc: { [len: number]: string[] }, word: string) => {
  word = word.replace(/\W/, '');
  if (!acc[word.length]) {
    acc[word.length] = [];
  }
  if (!acc[word.length].includes(word)) {
    acc[word.length].push(word);
  }
  return acc;
}, {});

Object.keys(buckets).forEach(len => {
  fs.writeFileSync(`src/assets/small/${len}.txt`, buckets[len].join('\n'));
});