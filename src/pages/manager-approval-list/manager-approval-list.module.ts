import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManagerApprovalListPage } from './manager-approval-list';

@NgModule({
  declarations: [
    ManagerApprovalListPage,
  ],
  imports: [
    IonicPageModule.forChild(ManagerApprovalListPage),
  ],
})
export class ManagerApprovalListPageModule {}
