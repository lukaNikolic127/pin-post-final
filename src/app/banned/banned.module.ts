import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BannedPageRoutingModule } from './banned-routing.module';

import { BannedPage } from './banned.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        BannedPageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [BannedPage]
})
export class BannedPageModule {}
