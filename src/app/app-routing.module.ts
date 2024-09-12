import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from "@angular/fire/auth-guard";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'register',
    loadChildren: () => import('./auth/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'create-post',
    loadChildren: () => import('./home/create-post/create-post.module').then(m => m.CreatePostPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'my-posts',
    loadChildren: () => import('./home/my-posts/my-posts.module').then(m => m.MyPostsPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'all-posts',
    loadChildren: () => import('./home/all-posts/all-posts.module').then(m => m.AllPostsPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: '',
    redirectTo: 'home/tabs',
    pathMatch: 'full'
  },
  {
    path: 'banned',
    loadChildren: () => import('./banned/banned.module').then( m => m.BannedPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
