import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  dict: 'small' | 'standard' | 'extended' = 'small';
  length = 5;
  height = 6;
  words: string[] = [];
  word?: string;

  matrix: { value: string }[][] = [];

  keyboard = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  letters = this.keyboard[0].concat(this.keyboard[1]).concat(this.keyboard[2]);

  async ngOnInit(): Promise<void> {
    this.words = (await (await fetch(`assets/${this.dict}/${this.length}.txt`)).text()).split('\n');
    this.word = this.words[Math.floor(Math.random() * this.words.length)];
    this.matrix = Array.from({ length: this.height }, (x, i) => Array.from({ length: this.length }, (y, j) => ({ value: '' })));
  }

  letter(k: string) {
    k = k.charAt(0).toLowerCase();
    for (let row of this.matrix) {
      for (let col of row) {
        if (!col.value) {
          col.value = k;
          return;
        }
      }
    }
  }

  backspace() {
    for (let i = this.matrix.length - 1; i >= 0; i--) {
      for (let j = this.matrix[i].length - 1; j >= 0; j--) {
        if (this.matrix[i][j].value) {
          this.matrix[i][j].value = '';
          return
        }
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  keypress(e: KeyboardEvent) {
    if (this.letters.includes(e.key.toLowerCase())) {
      this.letter(e.key);
    }
    if (e.code == 'Backspace') {
      this.backspace();
    }
  }

}
