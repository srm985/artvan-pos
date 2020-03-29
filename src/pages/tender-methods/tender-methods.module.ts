import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TenderMethodsPage } from './tender-methods';

@NgModule({
  declarations: [
    TenderMethodsPage,
  ],
  imports: [
    IonicPageModule.forChild(TenderMethodsPage),
  ],
})
export class TenderMethodsPageModule {}
