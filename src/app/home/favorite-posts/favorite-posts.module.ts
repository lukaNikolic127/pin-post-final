import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FavoritePostsPageRoutingModule } from './favorite-posts-routing.module';

import { FavoritePostsPage } from './favorite-posts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavoritePostsPageRoutingModule
  ],
  declarations: [FavoritePostsPage]
})
export class FavoritePostsPageModule {}
