import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconMessageDeliveryStatusComponent } from './icon-message-delivery-status.component';

describe('IconMessageDeliveryStatusComponent', () => {
  let component: IconMessageDeliveryStatusComponent;
  let fixture: ComponentFixture<IconMessageDeliveryStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconMessageDeliveryStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconMessageDeliveryStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
