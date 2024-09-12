import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllPostsPage } from './all-posts.page';

describe('AllPostsPage', () => {
  let component: AllPostsPage;
  let fixture: ComponentFixture<AllPostsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AllPostsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
