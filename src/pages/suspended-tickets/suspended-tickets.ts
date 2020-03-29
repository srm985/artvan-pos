import { Component } from '@angular/core';
import { IonicPage, Refresher, AlertController, PopoverController, NavController, Tabs, Events } from 'ionic-angular';

import { FunctionsPopoverComponent } from '../../components/functions-popover/functions-popover';

import { UserDataProvider } from '../../providers/user-data/user-data';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { SystemWarningsProvider } from '../../providers/system-warnings/system-warnings';

import * as Constants from '../../providers/config';

@IonicPage()
@Component({
  selector: 'page-suspended-tickets',
  templateUrl: 'suspended-tickets.html',
})
export class SuspendedTicketsPage {

  employeeNumber: string;       // Tracks the entered employee number. If blank, calculated in middleware.
  ticketList: any[];            // List of all tickets with suspended status.
  userPrivilege: boolean;       // Set true if manager. Not currently used.
  resultSelected: number;       // Tracks the array index of the result highlighted.
  ticketOpenable: boolean;      // Set true if the ticket is not in tender status.

  constructor(
    private api: ApiProvider,
    private userData: UserDataProvider,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private storage: StorageProvider,
    private navCtrl: NavController,
    private events: Events,
    private systemWarnings: SystemWarningsProvider
  ) {
    this.employeeNumber = '';
    this.ticketList = [];
    this.resultSelected = null;
    this.ticketOpenable = true;

    this.userData.recallUserData().then((data: any) => {

      // Validate data just in case, to prevent errors.
      data.role = data.role === undefined ? '' : data.role.toLowerCase();

      if (data.role == 'administrator') {
        this.userPrivilege = true;
      } else {
        this.userPrivilege = false;
      }
    });

    this.recallTickets();
  }

  ionViewDidEnter() {
    this.recallTickets();
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
   * Query list of tickets from API.
   */
  recallTickets() {
    let splitDate,
      splitTime,
      isoDate;

    return new Promise((resolve) => {
      this.resultSelected = null;
      this.api.returnSuspendedOrders(this.employeeNumber).then((orderList: any[]) => {
        if (orderList[0] !== undefined) {
          this.ticketList = (<any>Object).values(JSON.parse(JSON.stringify(orderList)));

          for (let i in this.ticketList) {
            splitDate = this.ticketList[i].DXDATE.split('/');
            splitTime = this.ticketList[i].DXTIME.split(':');
            isoDate = `20${splitDate[2]}-${('0' + splitDate[0]).slice(-2)}-${('0' + splitDate[1]).slice(-2)}T${('0' + splitTime[0]).slice(-2)}:${splitTime[1]}:${splitTime[2]}`;

            this.ticketList[i] = {
              id: this.ticketList[i].DXTRAN.trim().toUpperCase(),
              suspensionDate: isoDate,
              vendor: this.ticketList[i].DXVNDA.trim().toUpperCase(),
              model: this.ticketList[i].DXMDL.trim().toUpperCase(),
              invoiceLocation: this.ticketList[i].DXRC.trim().toUpperCase(),
              storeType: this.ticketList[i].DXRC.trim().toUpperCase(),
              orderStatus: this.ticketList[i].DXSTS.trim().toUpperCase(),
              webID: this.ticketList[i].DXWEBID.trim().toUpperCase()
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
   * Reflect which ticket has been selected.
   */
  selectTicket(ticket) {
    this.resultSelected = this.resultSelected != ticket ? ticket : null;
    try {
      this.ticketOpenable = true;
      if (this.ticketList[this.resultSelected].orderStatus === 'T' || this.ticketList[this.resultSelected].orderStatus === 'M') {
        this.ticketOpenable = false;
      }
    } catch (err) {
      this.ticketOpenable = false;
    }
  }

  /**
   * This function first checks to see if we have an
   * open order. If so, we suspend it. We then attempt
   * to open the suspended order and switch tabs back
   * to the ticket page.
   */
  openTicket() {
    this.api.openSuspendedOrder(this.ticketList[this.resultSelected]).then((response: any) => {
      // If we are permitted to open the order.
      if (response.openOrder === true) {
        // First try to suspend any open order.
        new Promise((resolve) => {
          this.storage.returnTransactionType().then((transactionType: string) => {
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
              this.storage.removeTransactionID();
              this.storage.removeTransactionType();
              this.storage.removeStoreType();
              resolve();
            }
          });
        }).then(() => {
          this.storage.setTransactionID(this.ticketList[this.resultSelected].id).then(() => {
            this.storage.setStoreType(response.rtlcc).then(() => {
              this.storage.setPreviouslySuspendedOrderFlag().then((response: any) => {
                (this.navCtrl.parent as Tabs).select(0);
                this.events.publish(Constants.EVENT_NAV_POP_HOME);
              }).catch((response: any) => {
                // Handle response.
              });
            }).catch((response: any) => {
              // Handle response.
            });
          });
        });

      } else {
        if ('Sc_errmsg' in response) {
          this.systemWarnings.returnedError(response.Sc_errmsg);
        } else if ('message' in response) {
          this.systemWarnings.returnedError(response.message);
        }
      }
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * Delete a previously-suspended ticket.
   */
  deleteTicket(ticket) {
    event.stopPropagation();

    let alert = this.alertCtrl.create({
      title: 'Delete Ticket',
      message: `Please enter a manager's password to continue.`,
      inputs: [
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Delete',
          handler: (collectedInput: any) => {
            this.api.deleteSuspendedOrder({
              'transactionID': ticket,
              'password': collectedInput.password.toUpperCase()
            }).then((response: any) => {
              try {
                if (response.Sc_errmsg.Sc_errmsg_0.length) {
                  let errorAlert = this.alertCtrl.create({
                    title: response.Sc_errmsg.Sc_errmsg_0.trim(),
                    buttons: [
                      {
                        text: 'Dismiss'
                      }
                    ]
                  });
                  errorAlert.present();
                } else {
                  this.recallTickets();
                }
              } catch (err) { }
            }).catch((response: any) => {
              // Handle response.
            });
          }
        }
      ]
    });
    alert.present();
  }

  searchEmployee() {
    console.log('Searching employee...');
  }

  /**
   * Load our popover when page
   * functions and present.
   */
  presentPopover(event) {
    let functionsPopover = this.popoverCtrl.create(FunctionsPopoverComponent, [
      'logout'
    ]);
    functionsPopover.present({
      ev: event
    });
  }
}
