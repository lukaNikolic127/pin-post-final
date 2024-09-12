import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannedPage } from './banned.page';

describe('BannedPage', () => {
  let component: BannedPage;
  let fixture: ComponentFixture<BannedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BannedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
