import { Component, HostListener, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Espells } from "src/espells";
import { EndGameComponent } from './end-game/end-game.component';
import { HelpComponent } from './help/help.component';
import { SettingsComponent } from './settings/settings.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  dict: 'standard' | 'extended' = 'standard';
  length = 5;
  height = 6;
  word?: string;
  words: string[] = [];
  cellSize = '10vw';
  fontSize = '5vw';
  borderSpacing = '1.25vw';

  pause = false;

  matrix: { value: string, color?: string }[][] = [];

  colors: { [k: string]: string } = {};

  keyboard = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  letters = this.keyboard[0].concat(this.keyboard[1]).concat(this.keyboard[2]);
  spellchecker?: Espells;

  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly bottomSheet: MatBottomSheet
  ) { }

  async ngOnInit(): Promise<void> {

    if (!localStorage.getItem('help-closed')) {
      this.openHelp();
    }


    if (!this.spellchecker) {
      Espells.fromURL({
        aff: 'assets/index.aff',
        dic: 'assets/index.dic'
      }).then(spellchecker => this.spellchecker = spellchecker);
    }
    this.colors = {};
    this.pause = false;

    this.words = (await (await fetch(`assets/standard/${this.length}.txt`)).text()).split('\n');

    this.word = this.words[Math.floor(Math.random() * this.words.length)];


    const size = (95 / (this.length * 9 + 1)) * 8;

    this.cellSize = `min(80px, min( 14vmin, ${(size).toFixed(2)}vw))`;
    this.fontSize = `min(40px, min( 7vmin, ${(size / 2).toFixed(2)}vw))`;
    this.borderSpacing = `min(10px, min( 1.75vmin, ${(size / 8).toFixed(2)}vw))`;

    this.matrix = Array.from({ length: this.height }, (x, i) => Array.from({ length: this.length }, (y, j) => ({ value: '' })));
  }

  openHelp(): void {
    this.dialog.open(HelpComponent).afterClosed().subscribe(() => localStorage.setItem('help-closed', 'true'));
  }

  letter(k: string) {
    if (this.pause) {
      return;
    }
    k = k.charAt(0).toLowerCase();
    for (let row of this.matrix) {
      for (let col of row) {
        if (!col.value) {
          col.value = k;

          document.getElementById(
            `m${this.matrix.indexOf(row)}_${row.indexOf(col)}`
          )?.scrollIntoView({ behavior: 'smooth', block: 'center' });

          if (row.indexOf(col) === this.length - 1) {
            this.checkWord(row);
          }
          return;
        }
      }
    }
  }

  private checkWord(row: { value: string, color?: string }[]) {

    const input = row.map(col => col.value).join('');

    if (!this.words.includes(input)) {
      const check = this.spellchecker?.lookup(input);
      if (!check || !check.correct || check.warn) {
        this.snackBar.open(`La parola "${input}" non è valida`);
        row.forEach(col => col.value = '');
        return;
      }
    }

    for (let j = 0; j < row.length; j++) {
      const col = row[j];
      const idx = this.word?.indexOf(col.value);
      if (idx == -1) {
        this.colors[col.value] = 'warn';
        col.color = 'warn';
      } else if (this.word?.charAt(j) !== col.value) {
        this.colors[col.value] = 'accent';
        col.color = 'accent';
      } else {
        this.colors[col.value] = 'primary';
        col.color = 'primary';
      }
    }

    if (input === this.word) {
      this.pause = true;
      this.bottomSheet.open(EndGameComponent, { data: { word: this.word, win: true } }).afterDismissed().subscribe(() => {
        this.ngOnInit()
      });
      return;
    }

    if (this.matrix.indexOf(row) == this.height - 1) {
      this.pause = true;
      this.bottomSheet.open(EndGameComponent, { data: { word: this.word, win: false } }).afterDismissed().subscribe(() => {
        this.ngOnInit()
      });
    }


  }

  backspace() {
    for (let i = this.matrix.length - 1; i >= 0; i--) {
      for (let j = this.matrix[i].length - 1; j >= 0; j--) {
        if (this.matrix[i][j].value) {
          if (j === this.matrix[i].length - 1) {
            return;
          }
          this.matrix[i][j].value = '';
          return;
        }
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  keypress(e: KeyboardEvent) {
    if (this.pause) {
      return;
    }
    if (this.letters.includes(e.key.toLowerCase())) {
      this.letter(e.key);
    }
    if (e.code == 'Backspace') {
      this.backspace();
    }
  }

  openSettings() {
    this.pause = true;
    this.bottomSheet.open(SettingsComponent, {
      data: {
        height: this.height,
        length: this.length,
      },
    }).afterDismissed().subscribe(data => {
      this.pause = false;
      if (data) {
        this.height = data.height;
        this.length = data.length;
        this.ngOnInit();
      }
    });
  }

}
