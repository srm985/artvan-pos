import { NavParams, ViewController, ModalController, AlertController, Events } from 'ionic-angular'
import { Component } from '@angular/core';

import { CustomerInformationPage } from '../../pages/customer-information/customer-information';
import { TenderMethodsPage } from '../../pages/tender-methods/tender-methods';

import { AddAssociatesComponent } from '../add-associates/add-associates';
import { SpecialInstructionsComponent } from '../special-instructions/special-instructions';
import { InStoreCreditComponent } from '../in-store-credit/in-store-credit';
import { PromotionsComponent } from '../promotions/promotions';
import { ManagerPromotionComponent } from '../manager-promotion/manager-promotion';

import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import * as Constants from '../../providers/config';

@Component({
  selector: 'functions-popover',
  templateUrl: 'functions-popover.html'
})
export class FunctionsPopoverComponent {

  functionList: any;
  taxExemptStatus: boolean;
  deleteOrderPermitted: boolean;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private events: Events,
    private api: ApiProvider,
    private storage: StorageProvider
  ) {
    // Current available functions.
    this.functionList = {
      'search-customer': false,
      'add-associates': false,
      'special-instructions': false,
      'group-pricing': false,
      'apply-promotions': false,
      /* 'otd-pricing': false, */
      'in-store-credits': false,
      'tax-exempt': false,
      'manager-promotions': false,
      'customer-information': false,
      'tender-methods': false,
      'home': false,
      'save-order': false,
      'delete-order': false,
      'logout': false
    };
    this.taxExemptStatus = false;
    this.deleteOrderPermitted = false;
  }

  ngOnInit() {
    if (this.navParams.data) {
      this.navParams.data.forEach((val) => {
        this.functionList[val] = true;
      });
    }

    // Check if our order is tax exempt.
    if (this.functionList['tax-exempt']) {
      this.api.returnTaxExemptStatus().then((taxExemptStatus: any) => {
        if (taxExemptStatus.STATUS === 'TAXABLE') {
          this.taxExemptStatus = false;
        } else {
          this.taxExemptStatus = true;
        }
      }).catch(() => {
        this.taxExemptStatus = false;
      });
    }

    // Check if we can show delete order option.
    if (this.functionList['delete-order']) {
      this.storage.returnPreviouslySuspendedOrderFlag().then((suspendedStatus: boolean) => {
        this.deleteOrderPermitted = !suspendedStatus;
      });
    }
  }

  addAssociates() {
    this.viewCtrl.dismiss();
    let modal = this.modalCtrl.create(AddAssociatesComponent);
    modal.present();
  }

  specialInstructions() {
    this.viewCtrl.dismiss();
    let modal = this.modalCtrl.create(SpecialInstructionsComponent);
    modal.present();
  }

  groupPricing() {
    this.viewCtrl.dismiss('group-pricing');
  }

  applyPromotions() {
    let promotionsModal;

    // Dismiss our popover.
    this.viewCtrl.dismiss();

    promotionsModal = this.modalCtrl.create(PromotionsComponent);
    promotionsModal.present();
    promotionsModal.onDidDismiss((success: boolean) => {
      if (success) {
        this.events.publish(Constants.EVENT_CART_UPDATE);
      }
    });
  }


  // Removed 5 June 2018 - No Longer On Terminal
  /**
   * This popover function provides the user with the
   * option to enter and set an Out The Door price or
   * the ability to clear it.
   */
  /* otdPricing() {
    let otdPrice;

    // Dismiss our popover.
    this.viewCtrl.dismiss('otd-pricing');

    otdPrice = '';

    let alert = this.alertCtrl.create({
      title: 'OTD Pricing',
      message: 'Set an out-the-door price.',
      inputs: [
        {
          name: 'price',
          type: 'tel',
          id: 'otd-pricing',
          value: otdPrice,
        },
      ],
      buttons: [
        {
          text: 'Remove',
          handler: () => {
            otdPrice = '';
            this.submitOTDPricing(otdPrice);
          }
        },
        {
          text: 'Set',
          handler: (data) => {
            otdPrice = data.price;
            this.submitOTDPricing(otdPrice);
          }
        }
      ]
    });

    alert.present().then(() => {
      this.formatPricingCurrency();
    });
  } */

  /**
     * This sub-function is called to attach an event
     * listener to the input field to format currency
     * correctly.
     */
  /* private formatPricingCurrency(): void {
    let inputField = <HTMLInputElement>document.getElementById('otd-pricing');

    inputField.addEventListener('keyup', () => {
      inputField.value = this.numberManipulator.returnCurrency(inputField.value);
    });
  } */

  // Removed 5 June 2018 - No Longer On Terminal
  /**
     * This sub-function attempts to submit our group
     * price or clear it by passing a blank string.
     */
  /* private submitOTDPricing(otdPrice: string): void {
    const OTD_PRICE = Number(this.numberManipulator.returnDecimalPretty(otdPrice)) <= 0 ? '' : Number(this.numberManipulator.returnDecimalPretty(otdPrice));

    let invalidPricePrompt = this.alertCtrl.create({
      title: 'Invalid Price',
      message: 'Please enter a valid OTD price.',
      buttons: [
        'Dismiss'
      ]
    });

    this.api.editOTDPrice(OTD_PRICE).then((response: any) => {
      // Handle response.
      if (response.retVal == '-1') {
        invalidPricePrompt.present();
      } else {
        this.events.publish(Constants.EVENT_UPDATE_INVOICE_TOTAL);
      }
    }).catch((response: any) => {
      // Handle response.
    });
  } */

  /**
   * This function presents users with options
   * to enter various in-store credits to apply
   * discounts to the invoice total.
   */
  inStoreCredits() {
    this.viewCtrl.dismiss();

    let inStoreCreditModal = this.modalCtrl.create(InStoreCreditComponent);

    inStoreCreditModal.present();
    inStoreCreditModal.onDidDismiss((success: boolean) => {
      if (success) {
        this.events.publish(Constants.EVENT_UPDATE_INVOICE_TOTAL);
      }
    });
  }

  /**
   * This function toggles the tax exempt status
   * of an order on or off.
   */
  toggleTaxExempt() {
    this.api.toggleTaxExemptStatus().then((response: any) => {
      if (response.retVal == '0') {
        this.taxExemptStatus = !this.taxExemptStatus;
        this.viewCtrl.dismiss();
        this.events.publish(Constants.EVENT_UPDATE_INVOICE_TOTAL);
      }
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * This function is used to return the user
   * to the customer search page from the
   * customer information page. It simply
   * returns a string to the calling page
   * indicating the navigation goal.
   */
  searchCustomer() {
    this.viewCtrl.dismiss('search-customer');
  }

  /**
   * This function suspends the order and returns
   * the user to the store type selection page. This
   * is currently identical to navigateHome().
  */
  saveOrder() {
    this.viewCtrl.dismiss();
    this.api.suspendOrder().then((response: any) => {
      this.events.publish(Constants.EVENT_NAV_POP_HOME);
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * This function deletes the current ticket and
   * returns the user to the store type selection
   * page.
   */
  deleteOrder() {
    let deleteConfirm;
    this.viewCtrl.dismiss();

    deleteConfirm = this.alertCtrl.create({
      title: 'Delete Order?',
      message: `Are you certain that you'd like to delete this order?`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.api.deleteTicket().then((response: any) => {
              this.events.publish(Constants.EVENT_NAV_POP_HOME);
            }).catch((response: any) => {
              // Handle response.
            });
          }
        }
      ]
    });
    deleteConfirm.present();
  }

  /**
   * While in the middle of a ticket, the user
   * can drop the ticket and navigate to the store
   * selection page. Users aren't permitted to
   * discard a ticket, so we have to suspended.
   */
  navigateHome() {
    this.viewCtrl.dismiss();
    this.api.suspendOrder().then((response: any) => {
      this.events.publish(Constants.EVENT_NAV_POP_HOME);
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * This function simply logs the user out.
  */
  logout() {
    this.viewCtrl.dismiss();
    this.events.publish(Constants.EVENT_USER_LOGOUT);
  }

  displayManagerPromotions() {
    this.viewCtrl.dismiss();
    let managerPromotionModal = this.modalCtrl.create(ManagerPromotionComponent);
    managerPromotionModal.present();
  }

  displayCustomerInformation() {
    this.viewCtrl.dismiss();
    let customerDetailsModal = this.modalCtrl.create(CustomerInformationPage, { modalView: true });
    customerDetailsModal.present();
  }

  displayTenderMethods() {
    this.viewCtrl.dismiss();
    let tenderMethodsModal = this.modalCtrl.create(TenderMethodsPage, { modalView: true });
    tenderMethodsModal.present();
  }
}
