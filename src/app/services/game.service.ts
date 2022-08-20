import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AROUND_CELL_OPERATORS } from '../utils/constants';
import { CellCodeEnum, GameStatusEnum } from '../utils/enums';
import { BoardStructure } from '../utils/interfaces';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  vertical: number = 9;
  horizontal: number = 9;
  minesLenght: number = 10;
  cellMaxSize: number = 10;

  private _board!: number[][] | any[][];
  private _boardData$ = new Subject<BoardStructure>();
  private _minesPositions: number[][] = [];

  private _remainingEmptyCells!: BehaviorSubject<number>;
  private _remainingEmptyMines!: BehaviorSubject<number>;
  private _gameStatus: BehaviorSubject<any> = new BehaviorSubject(
    GameStatusEnum.NotStarted
  );
  private _isFirstCellClicked = new BehaviorSubject(true);
  private _firstCellIsReadyToOpen = new Subject<boolean>();

  constructor() {
    //this.newEmptyBoard(10, 10, 10)
  }
  /**
   * It creates a new empty board with the given parameters
   * @param {number} vertical - number - the number of rows in the board
   * @param {number} horizontal - number - the number of columns in the board
   * @param {number} minesLenght - number - the number of mines on the board
   */
  newEmptyBoard(
    vertical: number,
    horizontal: number,
    minesLenght: number
  ): void {
    this._board = [];
    this.vertical = vertical;
    this.horizontal = horizontal;
    this.minesLenght = minesLenght;

    this._remainingEmptyCells = new BehaviorSubject(
      this.vertical * this.horizontal - this.minesLenght
    );
    this._remainingEmptyMines = new BehaviorSubject(this.minesLenght);
    this._gameStatus = new BehaviorSubject(GameStatusEnum.NotStarted);

    this._generateEmptyBoard();
    this._boardData$.next({ board: [...this._board] });
  }

  /**
   * It generates the mines positions, inserts the mines in the board and updates the board numbers
   * @param {number[]} firstCellOpened - number[] - the position of the first cell opened by the user.
   */
  populateEmptyBoard(firstCellOpened: number[]): void {
    this._generateMinesPositions(this.minesLenght, firstCellOpened);
    this._insertMines();
    this._updateBoardNumbers();
    this._boardData$.next({ board: [...this._board] });
  }

  /**
   * It decreases the number of remaining empty cells by the value passed in
   * @param {number} value - number - the value to be added to the current value of the BehaviorSubject
   */
  decreaseRemainingEmptyCells(value: number): void {
    this._remainingEmptyCells.next(this._remainingEmptyCells.value - value);
  }

  /**
   * The function takes a number as an argument and sets the value of the remainingEmptyCells property
   * to the value of the argument
   * @param {number} value - The value to be set.
   */
  setRemainEmptyCells(value: number) {
    this._remainingEmptyCells.next(value);
  }

  /**
   * It returns an observable of type BoardStructure.
   * @returns Observable<BoardStructure>
   */
  get boardHasChanded$(): Observable<BoardStructure> {
    return this._boardData$.asObservable();
  }

  /**
   * It returns an observable that emits the number of remaining empty cells
   * @returns An observable of the remaining empty cells.
   */
  get remainingEmptyCells$(): Observable<number> {
    return this._remainingEmptyCells.asObservable();
  }

  /**
   * The gameStatus$ function returns an observable of the gameStatus property
   * @returns An observable of the game status.
   */
  get gameStatus$(): Observable<GameStatusEnum> {
    return this._gameStatus.asObservable();
  }

  /**
   * The function returns the value of the gameStatus property
   * @returns The value of the gameStatus property.
   */
  get gameStatusValue(): GameStatusEnum {
    return this._gameStatus.value;
  }

  /**
   * The function returns a boolean value that indicates whether the first cell has been clicked
   * @returns The value of the private variable _isFirstCellClicked.
   */
  get isFirstClickInCell(): boolean {
    return this._isFirstCellClicked.value;
  }

  /**
   * This function returns an observable that emits a boolean value whenever the first cell is ready to
   * open
   * @returns Observable<boolean>
   */
  get firstCellIsReadyToOpen$(): Observable<boolean> {
    return this._firstCellIsReadyToOpen.asObservable();
  }

  /**
   * It takes a parameter of type GameStatusEnum and sets the value of the private variable _gameStatus
   * to the value of the parameter
   * @param {GameStatusEnum} status - GameStatusEnum - This is the status of the game.
   */
  setGameStatus(status: GameStatusEnum) {
    this._gameStatus.next(status);
  }

  /**
   * The function takes a boolean value and sets the value of the BehaviorSubject to the value of the
   * boolean
   * @param {boolean} status - boolean - the status of the first cell click
   */
  set isFirstClickInCell(status: boolean) {
    this._isFirstCellClicked.next(status);
  }

  /**
   * The function takes a boolean value and sets the value of the private variable
   * _firstCellIsReadyToOpen to the value of the boolean
   * @param {boolean} state - boolean - this is the state of the cell. If it's true, the cell is open.
   * If it's false, the cell is closed.
   */
  set firstCellIsReadyToOpen(state: boolean) {
    this._firstCellIsReadyToOpen.next(true);
  }

  /**
   * It generates an array of random positions for the mines
   * @param {number} minesLenght - number - the number of mines to be generated
   * @param {number[]} firstCellOpened - the first cell that the user opened.
   */
  private _generateMinesPositions(
    minesLenght: number,
    firstCellOpened: number[]
  ): void {
    this._minesPositions = [];
    while (this._minesPositions.length < minesLenght) {
      let y = this._getRandomInt(0, this.vertical);
      let x = this._getRandomInt(0, this.horizontal);

      if (
        !this._isAlreadyAMine([y, x]) &&
        this._isDifferentFromFirstCellOpened([y, x], firstCellOpened)
      ) {
        this._minesPositions.push([y, x]);
      }
    }
  }
  /**
   * It loops through the vertical and horizontal properties of the board and pushes an array of zeros
   * into the board array
   */
  private _generateEmptyBoard(): void {
    for (let y = 0; y < this.vertical; y++) {
      this._board.push([]);
      for (let x = 0; x < this.horizontal; x++) {
        this._board[y][x] = 0;
      }
    }
  }

  /**
   * It takes the array of mines positions and inserts them into the board
   */
  private _insertMines(): void {
    for (let i = 0; i < this._minesPositions.length; i++) {
      let y = this._minesPositions[i][0];
      let x = this._minesPositions[i][1];
      this._board[y][x] = CellCodeEnum.Mine;
    }
  }
  /**
   * It iterates over the mines positions, and for each mine position, it iterates over the around cell
   * operators, and for each around cell operator, it checks if the cell is in the board, and if it is,
   * it increments the cell's value
   */
  private _updateBoardNumbers(): void {
    for (let i = 0; i < this._minesPositions.length; i++) {
      for (let j = 0; j < AROUND_CELL_OPERATORS.length; j++) {
        let minePosition = this._minesPositions[i];
        let around = AROUND_CELL_OPERATORS[j];
        let boardY = minePosition[0] + around[0];
        let boardX = minePosition[1] + around[1];

        if (
          boardY >= 0 &&
          boardY < this.vertical &&
          boardX >= 0 &&
          boardX < this.horizontal &&
          typeof this._board[boardY][boardX] === 'number'
        ) {
          this._board[boardY][boardX]++;
        }
      }
    }
  }

  /**
   * It checks if the mine position is already in the mines positions array
   * @param {number[]} minePosition - The position of the mine that we want to check if it's already a
   * mine.
   * @returns A boolean value.
   */
  private _isAlreadyAMine(minePosition: number[]): boolean {
    return this._minesPositions.join(' ').includes(minePosition.toString());
  }

  /**
   * If the random cell is different from the first cell opened, return true.
   * @param {number[]} randomCell - The randomly generated cell that we want to check if it's different
   * from the first cell opened.
   * @param {number[]} firstCellOpened - The first cell that was opened by the user.
   * @returns A boolean value.
   */
  private _isDifferentFromFirstCellOpened(
    randomCell: number[],
    firstCellOpened: number[]
  ): boolean {
    return (
      randomCell[0] !== firstCellOpened[0] ||
      randomCell[1] !== firstCellOpened[1]
    );
  }

  /**
   * It returns a random integer between the min and max values
   * @param {number} min - The minimum number that can be returned.
   * @param {number} max - The maximum number of items to return.
   * @returns A random number between min and max.
   */
  private _getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
