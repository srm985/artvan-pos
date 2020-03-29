import { Component } from '@angular/core';

import { SuspendedTicketsPage } from '../suspended-tickets/suspended-tickets';
import { HomePage } from '../home/home';
import { ManagerApprovalListPage } from '../manager-approval-list/manager-approval-list';

import { UserDataProvider } from '../../providers/user-data/user-data';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root;
  tab2Root;
  tab3Root;
  isNotManager: boolean;

  constructor(
    private userData: UserDataProvider
  ) {
    this.tab1Root = HomePage;
    this.tab2Root = SuspendedTicketsPage;
    this.tab3Root = ManagerApprovalListPage;

    this.isNotManager = true;
  }

  ionViewDidLoad() {
    // Check if the user is a manager.
    this.userData.recallUserData().then((userData: any) => {
      if ('isNotManager' in userData) {
        this.isNotManager = userData.isNotManager;
      }
    }).catch((response: any) => {
      this.isNotManager = true;
    });
  }
}
