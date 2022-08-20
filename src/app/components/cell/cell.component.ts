import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { GameService } from 'src/app/services/game.service';
import { CellCodeEnum, GameStatusEnum } from 'src/app/utils/enums';
import { CellStructure } from 'src/app/utils/interfaces';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css'],
})
export class CellComponent implements OnChanges {
  @Input()
  cell!: CellStructure;
  @Input()
  horizontal!: number;
  @Input()
  vertical!: number;

  @Output() openCell = new EventEmitter<number[]>();
  @Output() focusCell = new EventEmitter<number>();

  private _gameStatus$: Subscription | undefined;
  private _modal: any;

  constructor(private _gameService: GameService) {}

  /**
   * If the cell type is a mine, then subscribe to the game status observable
   * @param {SimpleChanges} changes - SimpleChanges - This is an object that contains the changes that
   * have been made to the component.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this._gameStatus$) {
      this._gameStatus$.unsubscribe();
    }
    if (
      changes &&
      changes['cell'] &&
      !changes['cell'].isFirstChange() &&
      this.cell.type === CellCodeEnum.Mine
    ) {
      this._gameStatusSubscription();
    }
  }

  /**
   * The onClick function is called when the user clicks on a cell. If the cell is a mine, the game is
   * over and the modal is shown
   * @param {any} [event] - any - the event that is triggered when the user clicks on the cell.
   */
  onClick(event?: any): void {
    if (event) {
      event.preventDefault();
    }
    this.openCell.emit([this.cell.y, this.cell.x]);
  }

  /**
   * It subscribes to the game status observable and when the game is lost or won, it sets the cell's
   * label to the appropriate value
   */
  private _gameStatusSubscription(): void {
    this._gameStatus$ = this._gameService.gameStatus$
      .pipe(
        filter(
          status =>
            status === GameStatusEnum.Lost || status === GameStatusEnum.Won
        )
      )
      .subscribe((status: GameStatusEnum) => {
        if (status === GameStatusEnum.Lost) {
          this.cell.isOpened = true;
          this.cell.isMine = true;
          this.cell.label = this.cell.type.toString();
        }
        this._gameStatus$?.unsubscribe();
      });
  }
}
