import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvoiceTotalPage } from './invoice-total';

@NgModule({
  declarations: [
    InvoiceTotalPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoiceTotalPage),
  ],
})
export class InvoiceTotalPageModule {}
