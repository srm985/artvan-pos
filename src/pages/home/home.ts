import { Component } from '@angular/core';
import { IonicPage, Events, NavController, PopoverController } from 'ionic-angular';

import { NewTicketPage } from '../new-ticket/new-ticket';

import { FunctionsPopoverComponent } from '../../components/functions-popover/functions-popover';

import { StorageProvider } from '../../providers/storage/storage';
import { ApiProvider } from '../../providers/api/api';
import { UserDataProvider } from '../../providers/user-data/user-data';

import * as Constants from '../../providers/config';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  hasOutletStore: boolean;

  constructor(
    private events: Events,
    private storage: StorageProvider,
    private api: ApiProvider,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private userData: UserDataProvider
  ) {
    this.hasOutletStore = false;
  }

  ionViewDidLoad() {
    // Listen for events requesting home page.
    this.events.subscribe(Constants.EVENT_NAV_POP_HOME, () => {
      this.navCtrl.popToRoot();
    });

    // Determine if we should show the outlet button.
    this.userData.recallUserData().then((data: any) => {
      if ('clearanceStore' in data) {
        this.hasOutletStore = Number(data.clearanceStore) > 0 ? true : false;
      }
    }).catch((response: any) => {
      this.hasOutletStore = false;
    });
  }

  ionViewDidEnter() {
    /**
     * Check to see if we accidentally left an order open
     * before closing the browser or after a device crash.
     * If one is open we enter it, unless it's manager approval.
     */
    this.storage.returnTransactionType().then((transactionType: string) => {
      if (transactionType !== 'managerApproval') {
        this.storage.returnStoreType().then((storeType: string) => {
          this.storage.returnTransactionID().then((transactionID: string) => {
            if (storeType.length && transactionID.length) {
              this.events.publish(Constants.EVENT_NAV_POP_MANAGER_APPROVAL);
              this.navCtrl.push(NewTicketPage);
            }
          });
        });
      } else {
        this.storage.removeStoreType();
        this.storage.removeTransactionID();
        this.storage.removeTransactionType();
      }
    });
  }

  ionViewWillUnload() {
    this.events.unsubscribe(Constants.EVENT_NAV_POP_HOME);
  }

  // Save our store type in storage and navigate to tabs page.
  establishStoreType(storeType: string) {
    this.storage.setStoreType(storeType).then(() => {
      this.storage.removePreviouslySuspendedOrderFlag().then((response: any) => {
        this.api.createNewTicket().then(() => {
          this.navCtrl.push(NewTicketPage);
        }).catch((response: any) => {
          // MOCKED!!!
          this.navCtrl.push(NewTicketPage);
        });
      }).catch((response: any) => {
        // Handle response.
      });
    }).catch((response: any) => {
      // Handle response.
    });
  }

  logout(): void {
    this.events.publish(Constants.EVENT_USER_LOGOUT);
  }

  /**
   * Load our popover when page
   * functions and present.
   */
  presentPopover(event) {
    let functionsPopover,
      functionsList = [
        'logout'
      ];


    functionsPopover = this.popoverCtrl.create(FunctionsPopoverComponent, functionsList);
    functionsPopover.present({
      ev: event
    });
  }
}
