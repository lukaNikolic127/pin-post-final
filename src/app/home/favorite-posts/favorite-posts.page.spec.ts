import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritePostsPage } from './favorite-posts.page';

describe('FavoritePostsPage', () => {
  let component: FavoritePostsPage;
  let fixture: ComponentFixture<FavoritePostsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoritePostsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
