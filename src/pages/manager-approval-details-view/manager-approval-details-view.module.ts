import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManagerApprovalDetailsViewPage } from './manager-approval-details-view';

@NgModule({
  declarations: [
    ManagerApprovalDetailsViewPage,
  ],
  imports: [
    IonicPageModule.forChild(ManagerApprovalDetailsViewPage),
  ],
})
export class ManagerApprovalDetailsViewPageModule {}
