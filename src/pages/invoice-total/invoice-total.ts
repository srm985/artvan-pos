import { Component } from '@angular/core';
import { IonicPage, NavController, PopoverController, ModalController, Events } from 'ionic-angular';

import { CustomerSearchPage } from '../../pages/customer-search/customer-search';
import { CustomerInformationPage } from '../../pages/customer-information/customer-information';

import { FunctionsPopoverComponent } from '../../components/functions-popover/functions-popover'
import { EditLineItemComponent } from '../../components/edit-line-item/edit-line-item';

import { SpecialCodesProvider } from '../../providers/special-codes/special-codes';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

import * as Constants from '../../providers/config';

@IonicPage()
@Component({
  selector: 'page-invoice-total',
  templateUrl: 'invoice-total.html',
})
export class InvoiceTotalPage {

  lineItems: any;               // List of cart items.
  transactionTypes: any;        // List of available transaction types.
  floorCodes: any;              // List of available floor codes.
  specialCodes: any;            // List of available special codes.
  transactionTypesLookup: any;  // Reverse lookup of transaction types.
  floorCodesLookup: any;        // Reverse lookup of floor codes.
  specialCodesLookup: any;      // Reverse lookup of special codes.
  invoiceSubtotal: any;         // Invoice subtotal prior to tax and previusly paid.
  invoicePreviouslyPaid: any;   // Any previously paid value.
  invoiceTax: any;              // Tax rate for transaction location.
  invoiceTotal: any             // Total invoice balance, including applicable taxes.
  invoiceBalance: any;          // Remaining balanace after taxes and previously paid.
  invoiceSavings: any;          // Displayed savings if applicable.
  editLinesMode: boolean;       // Set true when editing line items.
  deliveryDates: Date[];        // Array containing available delivery dates.
  pickupDates: Date[];          // Array containing available pickup dates.
  pickupVia: any;               // Value of the pickup location previously set.
  storeTypeHeader: string;      // Displays the type of store location.

  constructor(
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private codes: SpecialCodesProvider,
    private modalCtrl: ModalController,
    private events: Events,
    private api: ApiProvider,
    private storage: StorageProvider
  ) {
    this.transactionTypesLookup = {};
    this.floorCodesLookup = {};
    this.specialCodesLookup = {};
    this.editLinesMode = false;

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
    });

    this.events.subscribe(Constants.EVENT_UPDATE_INVOICE_TOTAL, () => {
      this.updatePage(false);
    });

    this.updatePage(true);
  }

  ionViewDidEnter() {
    this.storage.returnStoreType().then((storeType: string) => {
      this.storeTypeHeader = storeType === 'R' ? 'Retail' : 'Outlet';
    });
  }

  /**
   * Update all our line items and
   * the order details.
   */
  updatePage(explodeOrder: boolean) {
    this.lineItems = [];
    this.api.returnInvoiceTotalWholePageInfo(explodeOrder).then((pageInfo: any) => {

      pageInfo.items.forEach((item: any) => {
        let acquisitionDate,
          acquisitionDateSetItem,
          setItems;

        if ('set' in item) {
          acquisitionDate = item.set.DXDATE6.split('/').length === 3 ? `20${item.set.DXDATE6.split('/')[2]}-${('0' + item.set.DXDATE6.split('/')[0]).slice(-2)}-${('0' + item.set.DXDATE6.split('/')[1]).slice(-2)}` : '';

          setItems = [];
          item.set.cpnts.forEach((component: any) => {
            acquisitionDateSetItem = component.DXDATE6.split('/').length === 3 ? `20${component.DXDATE6.split('/')[2]}-${('0' + component.DXDATE6.split('/')[0]).slice(-2)}-${('0' + component.DXDATE6.split('/')[1]).slice(-2)}` : '';

            setItems.push({
              transType: component.DXTYPE.trim(),
              originalTransType: component.DXTYPE.trim(),
              vendor: component.DXVNDA.trim(),
              model: component.DXMDL.trim(),
              desc: component.DXDESC.trim(),
              qty: Number(component.DXQTY.trim()),
              price: component.DXPRC.trim().length ? Number(component.DXPRC.trim()) : 0,
              totalPrice: component.DXXPRC.trim().length ? Number(component.DXXPRC.trim()) : 0,
              via: Number(component.DXVIAX.trim()) > 0 ? Number(component.DXVIAX.trim()) : '',
              savings: Number(component.DXSAVE.trim()),
              line: component.DXLINE.trim(),
              promo_1: component.DXSLSPRM1.trim() == '0' ? '' : component.DXSLSPRM1.trim(),
              promo_2: component.DXSLSPRM2.trim() == '0' ? '' : component.DXSLSPRM2.trim(),
              acquisitionDate: acquisitionDateSetItem,
              floorCode: component.DXFLR.trim()
            });
          });

          this.lineItems.push({
            transType: item.set.DXTYPE.trim(),
            originalTransType: item.set.DXTYPE.trim(),
            vendor: item.set.DXVNDA.trim(),
            model: item.set.DXMDL.trim(),
            setItems: [...setItems],
            desc: item.set.DXDESC.trim(),
            qty: Number(item.set.DXQTY.trim()),
            price: item.set.DXPRC.trim().length ? Number(item.set.DXPRC.trim()) : 0,
            totalPrice: item.set.DXXPRC.trim().length ? Number(item.set.DXXPRC.trim()) : 0,
            via: Number(item.set.DXVIAX.trim()) > 0 ? Number(item.set.DXVIAX.trim()) : '',
            savings: Number(item.set.DXSAVE.trim()),
            line: item.set.DXLINE.trim(),
            promo_1: item.set.DXSLSPRM1.trim() == '0' ? '' : item.set.DXSLSPRM1.trim(),
            promo_2: item.set.DXSLSPRM2.trim() == '0' ? '' : item.set.DXSLSPRM2.trim(),
            acquisitionDate: acquisitionDate,
            floorCode: item.set.DXFLR.trim()
          });
        } else {
          acquisitionDate = item.DXDATE6.split('/').length === 3 ? `20${item.DXDATE6.split('/')[2]}-${('0' + item.DXDATE6.split('/')[0]).slice(-2)}-${('0' + item.DXDATE6.split('/')[1]).slice(-2)}` : '';

          this.lineItems.push({
            transType: item.DXTYPE.trim(),
            originalTransType: item.DXTYPE.trim(),
            vendor: item.DXVNDA.trim(),
            model: item.DXMDL.trim(),
            setItems: [],
            desc: item.DXDESC.trim(),
            qty: Number(item.DXQTY.trim()),
            price: item.DXPRC.trim().length ? Number(item.DXPRC.trim()) : 0,
            totalPrice: item.DXXPRC.trim().length ? Number(item.DXXPRC.trim()) : 0,
            via: Number(item.DXVIAX.trim()) > 0 ? Number(item.DXVIAX.trim()) : '',
            savings: Number(item.DXSAVE.trim()),
            line: item.DXLINE.trim(),
            promo_1: item.DXSLSPRM1.trim() == '0' ? '' : item.DXSLSPRM1.trim(),
            promo_2: item.DXSLSPRM2.trim() == '0' ? '' : item.DXSLSPRM2.trim(),
            acquisitionDate: acquisitionDate,
            floorCode: item.DXFLR.trim()
          });
        }
      });
      this.invoiceSubtotal = Number(pageInfo.totals.subTotal);
      this.invoiceTax = Number(pageInfo.totals.taxAmount);
      this.invoiceTotal = Number(pageInfo.totals.totInvoice);
      this.invoicePreviouslyPaid = Number(pageInfo.totals.prePaid);
      this.invoiceBalance = Number(pageInfo.totals.invBalance);
      this.invoiceSavings = Number(pageInfo.totalSavings);

      console.log(this.lineItems)
    }).catch(() => {
      // Handle response.
    });
  }

  /**
   * Perform available edits to a line item.
   */
  editLineItem(item) {
    let editItemModal = this.modalCtrl.create(EditLineItemComponent, {
      lineItem: JSON.parse(JSON.stringify(this.lineItems[item])),
      transactionTypesLookup: JSON.parse(JSON.stringify(this.transactionTypesLookup)),
      floorCodes: JSON.parse(JSON.stringify(this.floorCodes)),
      floorCodesLookup: JSON.parse(JSON.stringify(this.floorCodesLookup))
    });

    editItemModal.present();
    editItemModal.onDidDismiss((updated) => {
      if (updated) {
        this.updatePage(false);
      }
    });
  }

  /**
   * Load our popover when page
   * functions and present.
   */
  presentPopover(event) {
    let functionsPopover = this.popoverCtrl.create(FunctionsPopoverComponent, [
      'logout',
      'special-instructions',
      'add-associates',
      'tax-exempt',
      'in-store-credits',
      'save-order',
      'delete-order',
      /* 'otd-pricing' */
    ]);
    functionsPopover.present({
      ev: event
    });
  }

  /**
   * Check if we already have a
   * saved customer and progress
   * to next page.
   */
  nextPage() {
    this.api.returnCustomerInfoDeliveryDetails().then((orderDetails: any) => {
      if (orderDetails.MASTERPOSRECORD.XMHPHN.length > 1) {
        this.navCtrl.push(CustomerInformationPage);
      } else {
        this.navCtrl.push(CustomerSearchPage);
      }
    }).catch(() => { });
  }
}
