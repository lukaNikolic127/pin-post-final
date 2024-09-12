import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FavoritePostsPage } from './favorite-posts.page';

const routes: Routes = [
  {
    path: '',
    component: FavoritePostsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavoritePostsPageRoutingModule {}
