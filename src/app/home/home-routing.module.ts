import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: HomePage,
    children: [
      {
        path: 'my-posts',
        loadChildren: () => import('./my-posts/my-posts.module').then(m => m.MyPostsPageModule)
      },
      {
        path: 'all-posts',
        loadChildren: () => import('./all-posts/all-posts.module').then(m => m.AllPostsPageModule)
      },
      {
        path: 'create-post',
        loadChildren: () => import('./create-post/create-post.module').then(m => m.CreatePostPageModule)
      },
      {
        path: 'favorite-posts',
        loadChildren: () => import('./favorite-posts/favorite-posts.module').then(m => m.FavoritePostsPageModule)
      },
      {
        path: '',
        redirectTo: '/home/tabs/all-posts',
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then( m => m.UsersPageModule)
      },
      {
        path: 'categories',
        loadChildren: () => import('./categories/categories.module').then( m => m.CategoriesPageModule)
      },
      {
        path: 'create-category',
        loadChildren: () => import('./categories/create-category/create-category.module').then(m => m.CreateCategoryPageModule)
      },
      {
        path: 'subscriptions',
        loadChildren: () => import('./subscriptions/subscriptions.module').then(m => m.SubscriptionsPageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home/tabs/all-posts',
    pathMatch: 'full'
  },
  {
    path: 'favorite-posts',
    loadChildren: () => import('./favorite-posts/favorite-posts.module').then( m => m.FavoritePostsPageModule)
  },
  {
    path: 'subscriptions',
    loadChildren: () => import('./subscriptions/subscriptions.module').then( m => m.SubscriptionsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
