import { TestBed } from '@angular/core/testing';

import { GameService } from './game.service';

describe('Game.Service', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('Deberia crearse', () => {
    expect(service).toBeTruthy();
  });
});
