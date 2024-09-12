import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyPostsPage } from './my-posts.page';

describe('MyPostsPage', () => {
  let component: MyPostsPage;
  let fixture: ComponentFixture<MyPostsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPostsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
