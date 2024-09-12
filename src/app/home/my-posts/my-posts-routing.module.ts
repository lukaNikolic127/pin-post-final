import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyPostsPage } from './my-posts.page';

const routes: Routes = [
  {
    path: '',
    component: MyPostsPage
  },
  {
    path: 'edit-post',
    loadChildren: () => import('./edit-post/edit-post.module').then( m => m.EditPostPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyPostsPageRoutingModule {}
