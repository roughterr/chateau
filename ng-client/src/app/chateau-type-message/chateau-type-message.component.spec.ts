import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChateauTypeMessageComponent } from './chateau-type-message.component';

describe('ChateauTypeMessageComponent', () => {
  let component: ChateauTypeMessageComponent;
  let fixture: ComponentFixture<ChateauTypeMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChateauTypeMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChateauTypeMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
