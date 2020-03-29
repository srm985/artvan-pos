import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuspendedTicketsPage } from './suspended-tickets';

@NgModule({
  declarations: [
    SuspendedTicketsPage,
  ],
  imports: [
    IonicPageModule.forChild(SuspendedTicketsPage),
  ],
})
export class SuspendedTicketsPageModule {}
