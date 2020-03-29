import { Component } from '@angular/core';
import { IonicPage, NavController, PopoverController, Refresher, Events } from 'ionic-angular';

import { ManagerApprovalDetailsViewPage } from '../manager-approval-details-view/manager-approval-details-view';

import { FunctionsPopoverComponent } from '../../components/functions-popover/functions-popover';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import * as Constants from '../../providers/config';

@IonicPage()
@Component({
  selector: 'page-manager-approval-list',
  templateUrl: 'manager-approval-list.html',
})
export class ManagerApprovalListPage {

  ticketList: any;              // List of all tickets requiring manager approval.
  resultSelected: number;       // Stores the currently-selected ticket.

  constructor(
    private popoverCtrl: PopoverController,
    private api: ApiProvider,
    private navCtrl: NavController,
    private storage: StorageProvider,
    private events: Events
  ) {
    this.ticketList = [];
  }

  ionViewDidLoad() {
    this.events.subscribe(Constants.EVENT_NAV_POP_MANAGER_APPROVAL, (refresh: boolean = false) => {
      this.navCtrl.popToRoot();
      if (refresh) {
        this.recallTickets();
      }
    });
  }

  ionViewDidEnter() {
    this.recallTickets();
  }

  /**
  * Query list of tickets from API.
  */
  recallTickets() {
    let constructedDate,
      constructedTime,
      isoDate;

    return new Promise((resolve) => {
      this.resultSelected = null;
      this.api.returnManagerApprovalOrders().then((orderList: any) => {
        delete orderList.retVal;
        delete orderList.Sc_errmsg;
        if (orderList[0] !== undefined) {
          this.ticketList = (<any>Object).values(JSON.parse(JSON.stringify(orderList)));

          for (let i in this.ticketList) {
            constructedDate = this.ticketList[i].WODATE;
            constructedTime = this.ticketList[i].WOTIME;

            if (constructedDate.length == 5) {
              constructedDate = `20${constructedDate.slice(3)}-0${constructedDate.slice(0, 1)}-${constructedDate.slice(1, 3)}`;
            } else {
              constructedDate = `20${constructedDate.slice(4)}-${constructedDate.slice(0, 2)}-${constructedDate.slice(2, 4)}`;
            }

            if (constructedTime.length == 5) {
              constructedTime = `0${constructedTime.slice(0, 1)}:${constructedTime.slice(1, 3)}:${constructedTime.slice(3)}`;
            } else {
              constructedTime = `${constructedTime.slice(0, 2)}:${constructedTime.slice(2, 4)}:${constructedTime.slice(4)}`;
            }
            isoDate = `${constructedDate}T${constructedTime}`;

            this.ticketList[i] = {
              id: this.ticketList[i].WOTRAN,
              associateName: this.ticketList[i].WOASSCNAME.trim().toUpperCase(),
              associateNumber: this.ticketList[i].WOASSCNUM.trim(),
              storeType: this.ticketList[i].WORC.trim() === 'R' ? 'Retail' : 'Outlet',
              storeLocation: this.ticketList[i].WORTLLOC.trim(),
              suspensionDate: isoDate,
              vendor: this.ticketList[i].WOVNDA,
              model: this.ticketList[i].WOMDL
            };
          }
          resolve();
        } else {
          this.ticketList = [];
          resolve();
        }
      }).catch(() => {
        this.ticketList = [];
        resolve();
      });
    });
  }

  /**
   * When a pulldown event occurs,
   * update ticket list.
   */
  updateResults(refresher: Refresher) {
    this.recallTickets().then(() => {
      refresher.complete();
    });
  }

  /**
  * Reflect which ticket has been selected.
  */
  selectTicket(ticket) {
    this.resultSelected = this.resultSelected != ticket ? ticket : null;
  }

  /**
   * This function opens the manager approval order and
   * navigates to the details page.
   */
  openTicket() {
    new Promise((resolve) => {
      this.storage.removeTransactionType().then((transactionType: string) => {
        if (transactionType !== 'managerApproval') {
          this.storage.returnTransactionID().then((transactionID: string) => {
            if (transactionID.length) {
              this.api.suspendOrder().then((response: any) => {
                resolve();
              }).catch((response: any) => {
                resolve();
              });
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    }).then(() => {
      this.storage.removeTransactionID();
      this.storage.removeStoreType();
      this.events.publish(Constants.EVENT_NAV_POP_HOME);
      this.storage.setTransactionID(this.ticketList[this.resultSelected].id).then(() => {
        this.storage.setStoreType(this.ticketList[this.resultSelected].storeType.toLowerCase() === 'retail' ? 'R' : 'C').then(() => {
          this.api.openManagerApprovalOrder().then((response: any) => {
            this.storage.setTransactionType('managerApproval');
            this.navCtrl.push(ManagerApprovalDetailsViewPage, response);
          }).catch((response: any) => {
            // Handle response.
          });
        });
      });
    });

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
