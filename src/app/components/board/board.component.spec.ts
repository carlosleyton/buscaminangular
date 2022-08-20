import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { of } from 'rxjs';
import { PipeTransform, Pipe } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { GameStatusEnum } from 'src/app/utils/enums';
import { BoardStructure } from 'src/app/utils/interfaces';

@Pipe({
  name: 'stopwatch',
})
export class MockStopWatch implements PipeTransform {
  transform(value: number): number {
    return value;
  }
}

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let mochGameService: any;

  beforeEach(waitForAsync(() => {
    mochGameService = {
      boardHasChanded$: of(<BoardStructure>{
        board: [
          [1, 1, 2, 'M', 1, 0, 0, 0, 0],
          [2, 'M', 4, 2, 1, 0, 1, 1, 1],
          [2, 'M', 'M', 2, 1, 1, 1, 'M', 1],
          [1, 3, 3, 3, 'M', 2, 2, 3, 2],
          [0, 1, 'M', 3, 2, 2, 'M', 2, 'M'],
          [0, 1, 2, 'M', 1, 1, 1, 2, 1],
          [0, 0, 1, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        isBoardReseted: false,
      }),
      gameStatus$: of(GameStatusEnum.Running),
      remainingEmptyCells$: of(80),
      newEmptyBoard: () => {},
      setEmojiFace: () => {},
    };

    TestBed.configureTestingModule({
      declarations: [BoardComponent, MockStopWatch],
      providers: [{ provide: GameService, useValue: mochGameService }],
    }).compileComponents();
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
