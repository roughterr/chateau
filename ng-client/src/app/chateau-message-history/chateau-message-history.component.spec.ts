import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChateauMessageHistoryComponent } from './chateau-message-history.component';

describe('ChateauMessageHistoryComponent', () => {
  let component: ChateauMessageHistoryComponent;
  let fixture: ComponentFixture<ChateauMessageHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChateauMessageHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChateauMessageHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
