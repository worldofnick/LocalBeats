import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSearchResultComponent } from './event-search-result.component';

describe('EventSearchResultComponent', () => {
  let component: EventSearchResultComponent;
  let fixture: ComponentFixture<EventSearchResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventSearchResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
