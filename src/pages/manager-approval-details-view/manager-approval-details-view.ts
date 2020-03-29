import { Component } from '@angular/core';
import { IonicPage, PopoverController, ViewController, AlertController, Events, ModalController } from 'ionic-angular';

import { FunctionsPopoverComponent } from '../../components/functions-popover/functions-popover';
import { ManagerApprovalOrderDetailsComponent } from '../../components/manager-approval-order-details/manager-approval-order-details';

import { StorageProvider } from '../../providers/storage/storage';
import { SpecialCodesProvider } from '../../providers/special-codes/special-codes';
import { ApiProvider } from '../../providers/api/api';

import * as Constants from '../../providers/config';

@IonicPage()
@Component({
  selector: 'page-manager-approval-details-view',
  templateUrl: 'manager-approval-details-view.html',
})
export class ManagerApprovalDetailsViewPage {

  pageData: any;                // All returned content for the page.
  storeTypeHeader: string;      // This is used to display our store type.
  lineItems: any;               // Contains our list of line items.
  transactionTypes: any;        // List of available transaction types.
  floorCodes: any;              // List of available floor codes.
  transactionTypesLookup: any;  // Reverse lookup of transaction types.
  floorCodesLookup: any;        // Reverse lookup of floor codes.
  orderDetails: any[];          // Array of all order details flags.

  constructor(
    private popoverCtrl: PopoverController,
    private viewCtrl: ViewController,
    private storage: StorageProvider,
    private codes: SpecialCodesProvider,
    private alertCtrl: AlertController,
    private api: ApiProvider,
    private events: Events,
    private modalCtrl: ModalController
  ) {
    this.pageData = {};
    this.storeTypeHeader = '';
    this.lineItems = [];
    this.transactionTypes = {};
    this.floorCodes = {};
    this.transactionTypesLookup = {};
    this.floorCodesLookup = {};
    this.orderDetails = [];
  }

  ionViewDidEnter() {
    this.pageData = JSON.parse(JSON.stringify(this.viewCtrl.data));

    this.storage.returnStoreType().then((storeType: string) => {
      this.storeTypeHeader = storeType === 'R' ? 'Retail' : 'Outlet';
    });

    // We search codes to convert content into readable format.
    this.codes.queryCodes().then((codes: any) => {
      this.transactionTypes = codes.transactionTypes;
      this.floorCodes = codes.floorCodes;

      this.transactionTypes.forEach((val) => {
        this.transactionTypesLookup[val.val] = val.desc;
      });
      this.floorCodes.forEach((val) => {
        this.floorCodesLookup[val.val] = val.desc;
      });

      this.updatePage();
    });
  }

  /**
   * Update all our line items and
   * the order details.
   */
  updatePage() {
    this.lineItems = [];

    // Iterate through line items.
    this.pageData.items.forEach((item: any) => {
      let acquisitionDate;

      if (item.MTDLVDATE.trim() != '0') {
        acquisitionDate = `${item.MTDLVDATE.slice(0, 4)}-${item.MTDLVDATE.slice(4, 6)}-${item.MTDLVDATE.slice(6, 8)}`;
      } else {
        acquisitionDate = '';
      }

      this.lineItems.push({
        transType: item.MTTRANTYPE.trim(),
        vendorModel: item.MTVNDRMDL.trim(),
        desc: item.MTITEMDESC.trim(),
        qty: Number(item.MTQTY.trim()),
        availableQty: Number(item.MTQTYONHAND.trim()),
        price: item.MTSLSPRC.trim().length ? Number(item.MTSLSPRC.trim()) : 0,
        totalPrice: item.MTSLSPRCEXT.trim().length ? Number(item.MTSLSPRCEXT.trim()) : 0,
        via: Number(item.MTVIA.trim()) > 0 ? Number(item.MTVIA.trim()) : '',
        savings: item.MTDSCDLR.trim().length ? Number(item.MTDSCDLR.trim()) : 0,
        promo_1: '',
        promo_2: '',
        acquisitionDate: acquisitionDate,
        floorCode: item.MTFLRCODE.trim()
      });
    });

    // Format order information.
    try {
      this.orderDetails = [];

      this.orderDetails.push(this.pageData.guestName.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.markUp.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.rtlCC.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.wAmt.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.slsPromo.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.slsPromoDesc.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.slsAssoc.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.gePromo.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.taxExempt.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.badDebt.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.refReason.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.invTyp.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.ivcNum.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.otd.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.badChk.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.totCst.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.badCrd.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.badHrs.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.badVia.replace(/\s{2,}/g, ' ').trim().toUpperCase());
      this.orderDetails.push(this.pageData.appErr.replace(/\s{2,}/g, ' ').trim().toUpperCase());
    } catch (err) { }
  }

  promptApprovalCode() {
    let approveOrder = false,
      invalidPasswordPrompt = this.alertCtrl.create({
        title: 'Invalid Password',
        message: 'Please enter a valid password.',
        buttons: [
          'Dismiss'
        ]
      }),
      approvalPrompt = this.alertCtrl.create({
        title: 'Enter Approval Code',
        inputs: [
          {
            name: 'password',
            placeholder: 'Approval Code',
            type: 'password'
          }
        ],
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Approve',
            handler: (data) => {
              approveOrder = true;
            }
          }
        ]
      });
    approvalPrompt.present();
    approvalPrompt.onDidDismiss((data: any) => {
      if (approveOrder && 'password' in data) {
        this.api.submitManagerApprovalCode(data.password).then((response: any) => {
          if (response.errCode == '003') {
            invalidPasswordPrompt.present();
          } else {
            this.events.publish(Constants.EVENT_NAV_POP_MANAGER_APPROVAL, true);
          }
        }).catch((response: any) => {
          // Handle response.
        });
      }
    });
  }

  displayOrderDetails() {
    let orderDetailsModal = this.modalCtrl.create(ManagerApprovalOrderDetailsComponent, { orderDetails: this.orderDetails });
    orderDetailsModal.present();
  }

  /**
   * Load our popover when page
   * functions and present.
   */
  presentPopover(event) {
    let functionsPopover,
      functionsList = [
        'logout',
        'special-instructions',
        'add-associates',
        'save-order',
        'manager-promotions',
        'customer-information',
        'tender-methods'
      ];

    functionsPopover = this.popoverCtrl.create(FunctionsPopoverComponent, functionsList);
    functionsPopover.present({
      ev: event
    });
  }

  closeOrder() {
    this.storage.removeTransactionID().then(() => {
      this.storage.removeTransactionType().then(() => {
        this.events.publish(Constants.EVENT_NAV_POP_MANAGER_APPROVAL);
      });
    });
  }
}
