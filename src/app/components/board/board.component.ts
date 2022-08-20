import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, filter } from 'rxjs/operators';
import { GameService } from 'src/app/services/game.service';
import { CellCodeEnum, GameStatusEnum } from 'src/app/utils/enums';
import { BoardStructure, CellStructure } from 'src/app/utils/interfaces';
import { AROUND_CELL_OPERATORS } from 'src/app/utils/constants';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit, OnDestroy {
  horizontalCells: CellStructure[] = [];
  verticalCells: CellStructure[] = [];

  boardParsed: CellStructure[][] = [];
  gameStatus: string | undefined;
  horizontal: number = 10;
  vertical: number = 10;

  private _elementRef: any;
  private _minesLength: number = 10;
  private _modalLost: any;
  private _modalWin: any;
  private _unsubscribeAll: Subject<any>;

  /**
   * The constructor function is called when the component is created. It's used to inject the
   * GameService and the document object. The GameService is used to subscribe to the boardHasChanded$
   * observable. When the observable emits a new value, the _parseBoard function is called
   * @param {GameService} _gameService - GameService - this is the service that we created earlier.
   * @param {Document} document - Document - this is the document object that is injected into the
   * component.
   */
  constructor(
    private _gameService: GameService,
    @Inject(DOCUMENT) document: Document
  ) {
    this._unsubscribeAll = new Subject();
    this._gameService.boardHasChanded$.subscribe(
      (boardData: BoardStructure) => {
        this._parseBoard(boardData.board);
        this._gameService.firstCellIsReadyToOpen = true;
      }
    );
    this._modalLost = document.getElementById('dialog1');
    this._modalWin = document.getElementById('dialog2');
  }

  ngOnInit(): void {
    this.createNewEmptyBoard();
    this._gameService.gameStatus$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((status: GameStatusEnum | undefined) => {
        if (status === GameStatusEnum.Running) {
        } else if (
          status === GameStatusEnum.Lost ||
          status === GameStatusEnum.Won
        ) {
          if (status === GameStatusEnum.Won) {
            console.log('Win!');
            this._modalWin !== null && this._modalWin.showModal();
          }
          if (status == GameStatusEnum.Lost) {
            this._modalLost !== null && this._modalLost.showModal();
          }
        }
        this.gameStatus = status;
      });
    this._gameService.remainingEmptyCells$
      .pipe(
        takeUntil(this._unsubscribeAll),
        distinctUntilChanged(),
        filter(length => length === 0)
      )
      .subscribe(() => this._gameService.setGameStatus(GameStatusEnum.Won));
  }

  /**
   * The ngOnDestroy() function is called when the component is destroyed
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.complete();
  }

  /**
   * The function creates a new empty board with the given vertical and horizontal values and the given
   * mines length
   */
  createNewEmptyBoard(): void {
    this._gameService.newEmptyBoard(
      this.vertical,
      this.horizontal,
      this._minesLength
    );
    this._gameService.isFirstClickInCell = true;
  }

  /**
   * If the cell is already opened, then open all the cells around it. Otherwise, open the cell
   * @param {number[]} clickedCellCoord - number[] - the coordinates of the cell that was clicked.
   */
  onOpenCell(clickedCellCoord: number[]): void {
    if (this._gameService.isFirstClickInCell) {
      this._gameService.isFirstClickInCell = false;
      this._gameService.populateEmptyBoard(clickedCellCoord);
    }
    if (this._isCellOpened(clickedCellCoord)) {
      this._manageCellsAround(clickedCellCoord);
    } else {
      this._openCell(clickedCellCoord);
    }
  }

  /**
   * The function takes an event as an argument, and then uses the event to find the next cell in the
   * table
   * @param {any} event - The event that triggered the focus.
   */
  onFocusCell(event: any) {
    const nextCell = this._elementRef.nativeElement.querySelector(
      `[data-i="${event}"]`
    );
    nextCell.focus();
  }

  /**
   * It generates a random number between 0 and 2
   * @returns A random number between 0 and 2.
   */
  private _generateRandomType(): number {
    return Math.floor(Math.random() * 7);
  }

  /**
   * It generates a 2D array of objects that represent the cells of the board
   */
  private _parseBoard(board: number[][]): void {
    this.boardParsed = [];
    let totalMines = 10;
    for (let y = 0; y < board.length; y++) {
      const row: CellStructure[] = [];
      for (let x = 0; x < board[y].length; x++) {
        let _type: string | number = 0;
        let randomTypeNumber = this._generateRandomType();
        if (totalMines > 0 && randomTypeNumber === 1) {
          _type = 'M';
          totalMines--;
        }
        row.push({
          type: board[y][x],
          y: y,
          x: x,
          id: y * this.horizontal + x,
          label: '',
          isOpened: false,
          isMine: _type === 'M',
          isMineExploded: false,
        });
      }
      this.boardParsed.push(row);
    }
  }

  /**
   * "Returns true if the cell at the given coordinates is opened, false otherwise."
   *
   * The function is private, so it can only be called from within the class
   * @param {number[]} cellCoord - number[] - the coordinates of the cell to check
   * @returns The cell data object for the cell at the given coordinates.
   */
  private _isCellOpened(cellCoord: number[]) {
    return this._getCellDataByCoord(cellCoord).isOpened;
  }

  /**
   * It takes a number and a pair of numbers, and returns a pair of numbers
   * @param {number} index - the index of the cell around the center cell.
   * @param {number[]} centerCellCoord - The coordinate of the cell that we want to get the cell around.
   * @returns The cell around the center cell.
   */
  private _getCellAroundCoordByCenterCellCoord(
    index: number,
    centerCellCoord: number[]
  ): number[] {
    const aroundGetter = AROUND_CELL_OPERATORS[index];
    const cellAroundY = centerCellCoord[0] + aroundGetter[0];
    const cellAroundX = centerCellCoord[1] + aroundGetter[1];

    return [cellAroundY, cellAroundX];
  }

  /**
   * If the cell around coordinates are within the game board, return true, else return false.
   * @param {number[]} cellAroundCoords - number[] - the coordinates of the cell around the current cell
   * @returns a boolean value.
   */
  private _isThereCellAround(cellAroundCoords: number[]): boolean {
    return (
      cellAroundCoords[0] >= 0 &&
      cellAroundCoords[0] < this._gameService.vertical &&
      cellAroundCoords[1] >= 0 &&
      cellAroundCoords[1] < this._gameService.horizontal
    );
  }

  /**
   * It opens all the cells around the clicked cell if the clicked cell is not a mine
   * @param {number[]} clickedCellCoord - number[] - the coordinates of the cell that was clicked.
   */
  private _openCellsAround(clickedCellCoord: number[]) {
    let willLost = false;
    for (let i = 0; i < AROUND_CELL_OPERATORS.length; i++) {
      const cellAroundCoords = this._getCellAroundCoordByCenterCellCoord(
        i,
        clickedCellCoord
      );
      if (this._isThereCellAround(cellAroundCoords)) {
        const cellAroundData = this._getCellDataByCoord(cellAroundCoords);
        if (cellAroundData.isOpened) {
          continue;
        }
        if (cellAroundData.type === CellCodeEnum.Mine && !willLost) {
          willLost = true;
          continue;
        }
        this._openCell(cellAroundCoords);
      }
    }
    if (willLost) {
      this._gameService.setGameStatus(GameStatusEnum.Lost);
    }
  }

  /**
   * If the cell is a number, open all the cells around it
   * @param {number[]} clickedCellCoord - number[] - the coordinates of the cell that was clicked
   */
  private _manageCellsAround(clickedCellCoord: number[]): void {
    const cellData = this._getCellDataByCoord(clickedCellCoord);
    const cellType = cellData.type as number;

    if (!isNaN(cellType) && cellType != 0) {
      this._openCellsAround(clickedCellCoord);
    }
  }

  /**
   * It takes a cell coordinate (an array of two numbers) and returns the cell data (an object) from the
   * boardParsed array
   * @param {number[]} cellCoord - The coordinates of the cell you want to get the data of.
   * @returns The cell data of the cell at the given coordinates.
   */
  private _getCellDataByCoord(cellCoord: number[]): CellStructure {
    return this.boardParsed[cellCoord[0]][cellCoord[1]];
  }

  /**
   * If the cell is a mine, the game is lost. If the cell is empty, open all the cells around it. If the
   * cell is not empty, open the cell and decrease the remaining empty cells by 1
   * @param {number[]} clickedCellCoord - number[] - the coordinates of the cell that was clicked
   * @returns the cellData object.
   */
  private _openCell(clickedCellCoord: number[]): void {
    const cellData = this._getCellDataByCoord(clickedCellCoord);
    cellData.isOpened = true;
    if (cellData.type === CellCodeEnum.Mine) {
      cellData.isMineExploded = true;
      this._gameService.setGameStatus(GameStatusEnum.Lost);
      return;
    }
    this._gameService.setGameStatus(GameStatusEnum.Running);

    if (cellData.type === 0) {
      this._openCellsAroundZero(cellData);
      this._updateRemainingEmptyCells();
    } else {
      cellData.label = cellData.type.toString();
      cellData.openedIdClassName = `opened-${cellData.type}`;
      this._gameService.decreaseRemainingEmptyCells(1);
    }
  }
  private _findCellDataByKeyValue(key: string, value: any): any {
    for (let y = 0; y < this.boardParsed.length; y++) {
      const row = this.boardParsed[y];
      const cellData = row.find((cell: any) => cell[key] === value);
      if (cellData) {
        return cellData;
      }
    }
  }

  /**
   * It opens all the cells around the clicked cell if the clicked cell is zero
   * @param {CellStructure | undefined} clickedCellData - CellStructure | undefined - the cell that was
   * clicked
   */
  private _openCellsAroundZero(clickedCellData: CellStructure): void {
    clickedCellData.isCenterZero = true;
    while (clickedCellData) {
      clickedCellData.openedIdClassName = '';
      for (let i = 0; i < AROUND_CELL_OPERATORS.length; i++) {
        const cellAroundCoords = this._getCellAroundCoordByCenterCellCoord(i, [
          clickedCellData.y,
          clickedCellData.x,
        ]);
        if (this._isThereCellAround(cellAroundCoords)) {
          const cellAroundData = this._getCellDataByCoord(cellAroundCoords);
          if (cellAroundData.type === 0) {
            if (!cellAroundData.isCenterZero) {
              cellAroundData.isOpened = true;
              cellAroundData.openedIdClassName = 'opened-0';
            }
          } else if (!cellAroundData.isOpened) {
            cellAroundData.label = cellAroundData.type.toString();
            cellAroundData.isOpened = true;
            cellAroundData.openedIdClassName = `opened-${cellAroundData.type}`;
          }
        }
      }
      clickedCellData = this._findCellDataByKeyValue(
        'openedIdClassName',
        'opened-0'
      );
      if (clickedCellData) {
        clickedCellData.isCenterZero = true;
      }
    }
  }

  /**
   * It takes a key and a value, and returns an array of all the cells that have that key/value pair
   * @param {string} key - string - the key to search for in the cell data
   * @param {any} value - any - this is the value we're looking for in the board.
   * @returns An array of CellStructure objects.
   */
  private _findAllCellDataByKeyValue(key: string, value: any): CellStructure[] {
    let finalArr = [];
    for (let y = 0; y < this.boardParsed.length; y++) {
      const row = this.boardParsed[y];
      const filteredRow = row.filter((cell: any) => cell[key] === value);

      if (filteredRow.length) {
        for (let i = 0; i < filteredRow.length; i++) {
          finalArr.push(filteredRow[i]);
        }
      }
    }

    return finalArr;
  }

  /**
   * _updateRemainingEmptyCells() function is used to update the remaining empty cells in the game
   */
  private _updateRemainingEmptyCells(): void {
    const gameService = this._gameService;
    const allOpenedCells = this._findAllCellDataByKeyValue('isOpened', true);
    const remainEmptyCells =
      gameService.vertical * gameService.horizontal -
      (gameService.minesLenght + allOpenedCells.length);
    gameService.setRemainEmptyCells(remainEmptyCells);
  }
}
