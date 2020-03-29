import { Component } from '@angular/core';
import { IonicPage, PopoverController, Events, ViewController, AlertController, ModalController } from 'ionic-angular';

import { FunctionsPopoverComponent } from '../../components/functions-popover/functions-popover';
import { FinancePromotionsComponent } from '../../components/finance-promotions/finance-promotions';

import { NumberManipulatorProvider } from '../../providers/number-manipulator/number-manipulator';
import { ApiProvider } from '../../providers/api/api';
import { SystemWarningsProvider } from '../../providers/system-warnings/system-warnings';
import { StorageProvider } from '../../providers/storage/storage';

import * as Constants from '../../providers/config';

@IonicPage()
@Component({
  selector: 'page-tender-methods',
  templateUrl: 'tender-methods.html',
})
export class TenderMethodsPage {

  displayedInModal: boolean;        // Set true if this is being loaded as a modal view.
  paymentMethods: any;              // Onject containing list of payment methods and values.
  invoiceSubtotal: any;             // Invoice subtotal prior to tax and previusly paid.
  invoiceTax: any;                  // Tax rate for transaction location.
  invoiceTotal: any;                // Total invoice balance, including applicable taxes.
  invoicePreviouslyPaid: any;       // Any previously paid value.
  invoiceBalance: any;              // Remaining balanace after taxes and previously paid.
  invoiceDeposit: any;              // Any required deposit.
  invoiceDeposit_calc: any;         // Calculated remainder of deposit.
  invoiceCODAmount: any;            // Any required COD Amount.
  invoiceCODAmount_calc: any;       // Calculated COD Amount.
  invoiceTotalPaid: any;            // Summation of all currently-paid funds.
  invoiceTotalPaid_calc: any;       // Current tender methods entered.
  invoiceBalanceDue: any;           // Remaining balance to be paid.
  invoiceBalanceDue_calc: any;      // Remaining balance to be paid, minus tender methods.
  submitOrderFlag: boolean;         // Set true if we're submitting the order.
  storeTypeHeader: string;          // Displays the type of store location.
  addingMethod: boolean;            // Set true if we're adding payment information. Used to hide footer.


  constructor(
    private popoverCtrl: PopoverController,
    private numberManipulator: NumberManipulatorProvider,
    private api: ApiProvider,
    private events: Events,
    private systemWarnings: SystemWarningsProvider,
    private storage: StorageProvider,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    this.paymentMethods = {
      cash: '',
      check: '',
      credit_1: '',
      credit_2: '',
      credit_3: '',
      credit_4: '',
      financeAmount: '',
      financeCompany: '',
      syncbAmount: '',
      syncbPromo: '',
      tidewaterAmount: '',
      tidewaterPromo: '',
      giftCard: '',
      salesPromo: ''
    };
    this.submitOrderFlag = false;
    this.displayedInModal = false;

    //this.recallTotals();
    this.api.returnPreTenderWholePageInfo().then((pageInfo: any) => {
      /**
       * The AS/400 doesn't give us all of the information we
       * need to calculate remaining balances on the fly. To
       * handle this, we have to send null values to the AS/400
       * to retrieve original values and then update with actual
       * values.
       */
      new Promise((resolve, reject) => {
        const nullPayments = {
          cash: '',
          check: '',
          credit_1: '',
          credit_2: '',
          credit_3: '',
          credit_4: '',
          financeAmount: '',
          financeCompany: '',
          syncbAmount: '',
          syncbPromo: '',
          tidewaterAmount: '',
          tidewaterPromo: '',
          giftCard: '',
          salesPromo: '',
          invoiceDeposit: '',
          invoiceTotal: ''
        };

        // Save our real payments that came from the AS/400.
        this.paymentMethods = {
          cash: pageInfo.cashAmt === '0' ? '' : pageInfo.cashAmt,
          check: pageInfo.checkAmt === '0' ? '' : pageInfo.checkAmt,
          credit_1: pageInfo.card1Amt === '0' ? '' : pageInfo.card1Amt,
          credit_2: pageInfo.card2Amt === '0' ? '' : pageInfo.card2Amt,
          credit_3: pageInfo.card3Amt === '0' ? '' : pageInfo.card3Amt,
          credit_4: pageInfo.card4Amt === '0' ? '' : pageInfo.card4Amt,
          financeAmount: pageInfo.altFinAmt === '0' ? '' : pageInfo.altFinAmt,
          financeCompany: pageInfo.finCmp === '0' ? '' : pageInfo.finCmp,
          syncbAmount: pageInfo.SyncBAmt === '0' ? '' : pageInfo.SyncBAmt,
          syncbPromo: pageInfo.geccPromo === '0' ? '' : pageInfo.geccPromo,
          tidewaterAmount: pageInfo.tideWaterAmt === '0' ? '' : pageInfo.tideWaterAmt,
          tidewaterPromo: pageInfo.tideWaterPromo === '0' ? '' : pageInfo.tideWaterPromo,
          giftCard: pageInfo.giftAmt === '0' ? '' : pageInfo.giftAmt,
          salesPromo: pageInfo.slsPromo === '0' ? '' : pageInfo.slsPromo
        };

        // Send zero values for payments.
        this.api.savePaymentMethods(nullPayments).then((response: any) => {

          // Retrieve the balances when the payments have been zeroed.
          this.api.returnPreTenderWholePageInfo().then((response: any) => {
            let resetPayments = JSON.parse(JSON.stringify(this.paymentMethods));

            resetPayments['invoiceDeposit'] = '';
            resetPayments['invoiceTotal'] = '';

            // Resave the payment methods.
            this.api.savePaymentMethods(resetPayments).then(() => {
              resolve(response);
            }).catch((response: any) => {
              reject();
            });
          }).catch((response: any) => {
            reject();
          });
        }).catch((response: any) => {
          reject();
        });
      }).then((pageInfo: any) => {
        this.invoiceSubtotal = pageInfo.subTot.length ? pageInfo.subTot : 0;
        this.invoiceTax = pageInfo.taxAmt.length ? pageInfo.taxAmt : 0;
        this.invoiceTotal = pageInfo.invTot.length ? pageInfo.invTot : 0;
        this.invoicePreviouslyPaid = pageInfo.paidPrev.length ? pageInfo.paidPrev : 0;
        this.invoiceBalance = pageInfo.invBal.length ? pageInfo.invBal : 0;
        this.invoiceDeposit = pageInfo.reqDep.length ? pageInfo.reqDep : 0;
        this.invoiceDeposit_calc = pageInfo.reqDep.length ? pageInfo.reqDep : 0;
        this.invoiceCODAmount = pageInfo.codAmt.length ? pageInfo.codAmt : 0;
        this.invoiceCODAmount_calc = pageInfo.codAmt.length ? pageInfo.codAmt : 0;
        this.invoiceTotalPaid = pageInfo.totPaid.length ? pageInfo.totPaid : 0;
        this.invoiceTotalPaid_calc = pageInfo.totPaid.length ? pageInfo.totPaid : 0;
        this.invoiceBalanceDue = pageInfo.invBal.length ? pageInfo.invBal : 0;
        this.invoiceBalanceDue_calc = pageInfo.invBal.length ? pageInfo.invBal : 0;

        this.prettifyMethods();
        this.calculateTotal();
      }).catch((response: any) => {
        // Handle response.
      });
    }).catch((response: any) => {
      this.invoiceSubtotal = 0;
      this.invoiceTax = 0;
      this.invoiceTotal = 0;
      this.invoicePreviouslyPaid = 0;
      this.invoiceBalance = 0;
      this.invoiceDeposit = 0;
      this.invoiceDeposit_calc = 0;
      this.invoiceCODAmount = 0;
      this.invoiceCODAmount_calc = 0;
      this.invoiceTotalPaid = 0;
      this.invoiceTotalPaid_calc = 0;
      this.invoiceBalanceDue = 0;
      this.invoiceBalanceDue_calc = 0;
    });
  }

  ionViewDidEnter() {
    this.storage.returnStoreType().then((storeType: string) => {
      this.storeTypeHeader = storeType === 'R' ? 'Retail' : 'Outlet';
    });
  }

  ngOnInit() {
    try {
      if (this.viewCtrl.data.modalView) {
        this.displayedInModal = this.viewCtrl.data.modalView;
      } else {
        this.displayedInModal = false;
      }
    } catch (err) {
      this.displayedInModal = false;
    }
  }

  ionViewWillLeave() {
    if (!this.submitOrderFlag && !this.displayedInModal) {
      this.prettifyMethods();
      let payments = {
        cash: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.cash)),
        check: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.check)),
        credit_1: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_1)),
        credit_2: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_2)),
        credit_3: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_3)),
        credit_4: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_4)),
        financeAmount: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.financeAmount)),
        financeCompany: Number(this.numberManipulator.returnWholeNumber(this.paymentMethods.financeCompany)),
        syncbAmount: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.syncbAmount)),
        syncbPromo: this.paymentMethods.syncbPromo.toUpperCase(),
        tidewaterAmount: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.tidewaterAmount)),
        tidewaterPromo: this.numberManipulator.returnWholeNumber(this.paymentMethods.tidewaterPromo),
        giftCard: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.giftCard)),
        salesPromo: this.numberManipulator.returnWholeNumber(this.paymentMethods.salesPromo)
      }

      // Append a couple extra required inputs.
      payments['invoiceDeposit'] = this.invoiceDeposit;
      payments['invoiceTotal'] = this.invoiceTotal;

      this.api.savePaymentMethods(payments).then((response: any) => {

      }).catch((response: any) => {
        // Handle response.
      });
    }
  }

  /**
   * On keyup, make sure all of our
   * values are formatted to currency
   * and calculated remaining balance.
   */
  methodChange() {
    this.paymentMethods = {
      cash: this.numberManipulator.returnCurrency(this.paymentMethods.cash),
      check: this.numberManipulator.returnCurrency(this.paymentMethods.check),
      credit_1: this.numberManipulator.returnCurrency(this.paymentMethods.credit_1),
      credit_2: this.numberManipulator.returnCurrency(this.paymentMethods.credit_2),
      credit_3: this.numberManipulator.returnCurrency(this.paymentMethods.credit_3),
      credit_4: this.numberManipulator.returnCurrency(this.paymentMethods.credit_4),
      financeAmount: this.numberManipulator.returnCurrency(this.paymentMethods.financeAmount),
      financeCompany: this.numberManipulator.returnWholeNumber(this.paymentMethods.financeCompany),
      syncbAmount: this.numberManipulator.returnCurrency(this.paymentMethods.syncbAmount),
      syncbPromo: this.paymentMethods.syncbPromo.toUpperCase(),
      tidewaterAmount: this.numberManipulator.returnCurrency(this.paymentMethods.tidewaterAmount),
      tidewaterPromo: this.numberManipulator.returnWholeNumber(this.paymentMethods.tidewaterPromo),
      giftCard: this.numberManipulator.returnCurrency(this.paymentMethods.giftCard),
      salesPromo: this.numberManipulator.returnWholeNumber(this.paymentMethods.salesPromo)
    };

    this.calculateTotal();
  }

  /**
   * Calculate our remaining invoice
   * balance based on payment methods.
   */
  calculateTotal() {
    const currentlyEntered = Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.cash)) + Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.check)) + Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_1)) + Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_2)) + Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_3)) + Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_4)) + Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.financeAmount)) + Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.syncbAmount)) + Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.tidewaterAmount)) + Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.giftCard));

    let depositCODDiff;

    this.invoiceDeposit_calc = this.invoiceDeposit - currentlyEntered > 0 ? this.invoiceDeposit - currentlyEntered : 0;

    depositCODDiff = this.invoiceDeposit_calc > 0 ? 0 : currentlyEntered - this.invoiceDeposit;

    this.invoiceCODAmount_calc = this.invoiceCODAmount - depositCODDiff > 0 ? this.invoiceCODAmount - depositCODDiff : 0;
    this.invoiceTotalPaid_calc = currentlyEntered;
    this.invoiceBalanceDue_calc = this.invoiceBalanceDue - currentlyEntered;
  }

  /**
   * Submit our order for tendering
   * or manager review as required.
   */
  submitOrder() {
    this.prettifyMethods();
    let payments = {
      cash: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.cash.trim())),
      check: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.check.trim())),
      credit_1: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_1.trim())),
      credit_2: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_2.trim())),
      credit_3: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_3.trim())),
      credit_4: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.credit_4.trim())),
      financeAmount: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.financeAmount.trim())),
      financeCompany: Number(this.numberManipulator.returnWholeNumber(this.paymentMethods.financeCompany.trim())),
      syncbAmount: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.syncbAmount.trim())),
      syncbPromo: this.paymentMethods.syncbPromo.trim().toUpperCase(),
      tidewaterAmount: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.tidewaterAmount.trim())),
      tidewaterPromo: this.numberManipulator.returnWholeNumber(this.paymentMethods.tidewaterPromo.trim()),
      giftCard: Number(this.numberManipulator.returnDecimalNumber(this.paymentMethods.giftCard.trim())),
      salesPromo: this.numberManipulator.returnWholeNumber(this.paymentMethods.salesPromo.trim())
    }

    // Append a couple extra required inputs.
    payments['invoiceDeposit'] = this.invoiceDeposit;
    payments['invoiceTotal'] = this.invoiceTotal;

    // Check if we can submit.
    if ((Math.round(this.invoiceDeposit_calc * 100) / 100) == 0) {
      this.api.submitPaymentMethods(payments).then((response: any) => {
        if (response.byPass == '1' || response.retVal == '0') {
          this.submitOrderFlag = true;
          this.storage.removeTransactionID().then(() => {
            this.storage.removeStoreType().then(() => {
              this.events.publish(Constants.EVENT_NAV_POP_HOME);
            }).catch(() => { });
          }).catch(() => { });
        } else if (response.retVal == '-1' && 'Sc_errmsg' in response) {
          this.systemWarnings.returnedError(response.Sc_errmsg[0]);
        }
      }).catch((response: any) => {
        // Handle response.
      });
    } else {
      this.systemWarnings.returnedError('Please verify payment totals.');
    }
  }

  /**
 * Prettify our recalled payment
 * methods prior to displaying.
 */
  prettifyMethods() {
    this.paymentMethods = {
      cash: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.cash),
      check: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.check),
      credit_1: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.credit_1),
      credit_2: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.credit_2),
      credit_3: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.credit_3),
      credit_4: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.credit_4),
      financeAmount: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.financeAmount),
      financeCompany: this.numberManipulator.returnWholeNumber(this.paymentMethods.financeCompany),
      syncbAmount: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.syncbAmount),
      syncbPromo: this.paymentMethods.syncbPromo.toUpperCase(),
      tidewaterAmount: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.tidewaterAmount),
      tidewaterPromo: this.numberManipulator.returnWholeNumber(this.paymentMethods.tidewaterPromo),
      giftCard: this.numberManipulator.returnCurrencyPretty(this.paymentMethods.giftCard),
      salesPromo: this.numberManipulator.returnWholeNumber(this.paymentMethods.salesPromo)
    };
  }

  /**
   * Search for and present a list of possible
   * finance companies.
   */
  searchFinanceCompanies() {
    let financeCompanyPrompt,
      mappedInputs = [];

    new Promise((resolve, reject) => {
      this.api.returnFinanceCompanies().then((financeCompanyList: any) => {
        delete financeCompanyList.retVal;
        delete financeCompanyList.Sc_errmsg;

        (<any>Object).values(financeCompanyList).forEach((company: any) => {
          mappedInputs.push({
            type: 'radio',
            label: company.FNDESC.trim(),
            value: company.FNCMPY.trim()
          });
        });
        resolve(mappedInputs);
      }).catch((response: any) => {
        reject(response);
      });
    }).then((financeCompanyList: any = []) => {
      financeCompanyPrompt = this.alertCtrl.create({
        title: 'Finance Companies',
        inputs: financeCompanyList,
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Select',
            handler: (financeCompany: string) => {
              this.paymentMethods.financeCompany = financeCompany;
            }
          }
        ]
      });
      financeCompanyPrompt.present();
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * Search for and present a list of possible
   * SYNCB promos.
   */
  searchPromos() {
    let financePromoModal = this.modalCtrl.create(FinancePromotionsComponent);

    financePromoModal.present();
    financePromoModal.onDidDismiss((returnedPromotion: string) => {
      if (returnedPromotion.length) {
        this.paymentMethods.syncbPromo = returnedPromotion;
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
      'save-order',
      'delete-order'
    ]);
    functionsPopover.present({
      ev: event
    });
  }

  hideFooterDuringInput() {
    this.addingMethod = true;
  }

  displayFooter() {
    this.addingMethod = false;
  }

  /**
   * If we are displaying a modal, we'll close
   * it.
   */
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
