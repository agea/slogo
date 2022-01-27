import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-end-game',
  templateUrl: './end-game.component.html',
  styleUrls: ['./end-game.component.css']
})
export class EndGameComponent {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { word: string, win: boolean },
    public readonly bottomSheetRef: MatBottomSheetRef<EndGameComponent>
  ) { }



}
