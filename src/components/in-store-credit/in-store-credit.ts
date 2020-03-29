import { ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'in-store-credit',
  templateUrl: 'in-store-credit.html'
})
export class InStoreCreditComponent {

  creditList: any;              // Object containing all in-store credit data.
  errorList: any;               // Mapped list of any returned errors.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider
  ) {
    this.creditList = {
      completeCareNumber_1: '',
      completeCareNumber_2: '',
      tsgNumber_1: '',
      tsgNumber_2: '',
      giftCard_25: '',
      giftCard_50: ''
    };
    this.errorList = {
      E1: '',
      E2: '',
      T1: '',
      T2: '',
      I1: '',
      I2: ''
    };
  }

  ionViewDidLoad() {
    // Retrieve any previously-saved in-store credits.
    this.api.returnInStoreCredits().then((inStoreCredits: any) => {
      // Map credits.
      if (Object.keys(inStoreCredits).length) {
        this.creditList.completeCareNumber_1 = Number(inStoreCredits.E.store1) > 0 ? `${inStoreCredits.E.store1.trim()}-${inStoreCredits.E.inv1.trim()}-${inStoreCredits.E.line1.trim()}` : '';
        this.creditList.completeCareNumber_2 = Number(inStoreCredits.E.store2) > 0 ? `${inStoreCredits.E.store2.trim()}-${inStoreCredits.E.inv2.trim()}-${inStoreCredits.E.line2.trim()}` : '';
        this.creditList.tsgNumber_1 = Number(inStoreCredits.T.store1) > 0 ? `${inStoreCredits.T.store1.trim()}-${inStoreCredits.T.inv1.trim()}-${inStoreCredits.T.line1.trim()}` : '';
        this.creditList.tsgNumber_2 = Number(inStoreCredits.T.store2) > 0 ? `${inStoreCredits.T.store2.trim()}-${inStoreCredits.T.inv2.trim()}-${inStoreCredits.T.line2.trim()}` : '';
        this.creditList.giftCard_25 = Number(inStoreCredits.I.qty25) > 0 ? inStoreCredits.I.qty25 : '';
        this.creditList.giftCard_50 = Number(inStoreCredits.I.qty50) > 0 ? inStoreCredits.I.qty50 : '';
      }
    }).catch((response: any) => {
      // Handle response.
    });
  }

  submitCredits() {
    const tempList = {
      completeCareNumber_1: this.creditList.completeCareNumber_1.trim().match(/-/g) === null ? '0-0-0' : this.creditList.completeCareNumber_1.trim().match(/-/g).length == 2 ? this.creditList.completeCareNumber_1 : '0-0-0',
      completeCareNumber_2: this.creditList.completeCareNumber_2.trim().match(/-/g) === null ? '0-0-0' : this.creditList.completeCareNumber_2.trim().match(/-/g).length == 2 ? this.creditList.completeCareNumber_2 : '0-0-0',
      tsgNumber_1: this.creditList.tsgNumber_1.trim().match(/-/g) === null ? '0-0-0' : this.creditList.tsgNumber_1.trim().match(/-/g).length == 2 ? this.creditList.tsgNumber_1 : '0-0-0',
      tsgNumber_2: this.creditList.tsgNumber_2.trim().match(/-/g) === null ? '0-0-0' : this.creditList.tsgNumber_2.trim().match(/-/g).length == 2 ? this.creditList.tsgNumber_2 : '0-0-0',
      giftCard_25: this.creditList.giftCard_25.trim().length ? this.creditList.giftCard_25.trim() : '0',
      giftCard_50: this.creditList.giftCard_50.trim().length ? this.creditList.giftCard_50.trim() : '0'
    };

    this.api.editInStoreCredits(tempList).then((response: any) => {
      // Clear our errors before evaluating.
      this.errorList = {
        E1: '',
        E2: '',
        T1: '',
        T2: '',
        I1: '',
        I2: ''
      };

      if (('E' in response ? response.E.retVal != '-1' : true)
        && ('T' in response ? response.T.retVal != '-1' : true)
        && ('I' in response ? response.I.retVal != '-1' : true)) {
        this.dismiss(true);
      } else {
        if ('E' in response) {
          if ('Sc_errmsg' in response.E) {
            this.errorList.E1 = response.E.Sc_errmsg[0];
            this.errorList.E2 = response.E.Sc_errmsg[1];
          }
        }
        if ('T' in response) {
          if ('Sc_errmsg' in response.T) {
            this.errorList.T1 = response.T.Sc_errmsg[0];
            this.errorList.T2 = response.T.Sc_errmsg[1];
          }
        }
        if ('I' in response) {
          if ('Sc_errmsg' in response.I) {
            this.errorList.I1 = response.I.Sc_errmsg[0];
            this.errorList.I2 = response.I.Sc_errmsg[1];
          }
        }
      }
    }).catch((response: any) => {
      // Handle response.
    });
  }

  dismiss(status: boolean = false) {
    this.viewCtrl.dismiss(status);
  }

}
