import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CustomerInformationPage } from './customer-information';

@NgModule({
  declarations: [
    CustomerInformationPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomerInformationPage),
  ],
})
export class CustomerInformationPageModule {}
