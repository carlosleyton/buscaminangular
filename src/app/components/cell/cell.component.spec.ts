import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CellComponent } from './cell.component';
import { By } from '@angular/platform-browser';
import { GameService } from 'src/app/services/game.service';

describe('CellComponent', () => {
  let component: CellComponent;
  let fixture: ComponentFixture<CellComponent>;
  let mockGameService;
  const cellMock = {
    id: 0,
    isMine: false,
    isMineExploded: false,
    isOpened: true,
    label: '1',
    type: 1,
    x: 0,
    y: 0,
    openedIdClassName: 'opened-1',
  };

  beforeEach(async () => {
    mockGameService = jasmine.createSpyObj(['']);

    await TestBed.configureTestingModule({
      declarations: [CellComponent],
      providers: [{ provide: GameService, useValue: mockGameService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CellComponent);
    component = fixture.componentInstance;
    component.cell = cellMock;
    fixture.detectChanges();
  });

  it('Se puede crear', () => {
    expect(component).toBeTruthy();
  });

  it('No deberia ser una mina', () => {
    expect(component.cell.isMine).not.toBeTruthy();
  });
  it('Deberia estar clickeado', () => {
    expect(component.cell.isOpened).toBeTruthy();
  });
  it('Deberia tener una mina cercana debido a su numero', () => {
    expect(component.cell.type).toBe(1);
  });

  it('Deberia renderizarse con className correcto', () => {
    expect(
      fixture.debugElement.query(By.css('button')).nativeElement.className
    ).toContain('nes-btn');
    expect(
      fixture.debugElement.query(By.css('button')).nativeElement.className
    ).toContain('opened-1');
    expect(
      fixture.debugElement.query(By.css('button')).nativeElement.className
    ).toContain('opened');
  });
});
