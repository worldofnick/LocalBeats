import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickEventComponent } from './pick-event.component';

describe('PickEventComponent', () => {
  let component: PickEventComponent;
  let fixture: ComponentFixture<PickEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
