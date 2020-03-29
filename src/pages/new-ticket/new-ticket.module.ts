import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewTicketPage } from './new-ticket';

@NgModule({
  declarations: [
    NewTicketPage,
  ],
  imports: [
    IonicPageModule.forChild(NewTicketPage),
  ]
})
export class NewTicketPageModule {}
