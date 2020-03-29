import { ViewController, AlertController } from 'ionic-angular';
import { Component } from '@angular/core';

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'promotions',
  templateUrl: 'promotions.html'
})
export class PromotionsComponent {

  financeCombined: string;              // Contains our financing promo code, if used.
  invalidPromotion: boolean;            // Flag set to true when an invalid promo code is used.
  promoCodes: any[];                    // List of available promo code offers.
  financePromoCodes: any[];             // List of available finance codes.
  promotionType: string;                // Tracks which promotion radio button is selected.
  financePromotionSelected: string;     // Stores the selected promo code for finance promotion.
  specialPromotionSelected: string;     // Stores the selected promo code for special promotion.
  previousPromo: string;                // Tracks which promotion was previously selected.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider,
    private alertCtrl: AlertController
  ) {
    this.financeCombined = '';
    this.invalidPromotion = false;
    this.promotionType = '1';
    this.previousPromo = '1';
    this.financePromotionSelected = '';
    this.specialPromotionSelected = '';
  }

  ionViewDidLoad() {
    // Grab any promo codes.
    this.api.editPromotions('T').then((promoCodeList: any) => {
      this.promoCodes = [];
      (<any>Object).values(JSON.parse(JSON.stringify(promoCodeList))).forEach((promoData: any) => {
        this.promoCodes.push({
          type: 'radio',
          label: promoData.PXDESC.trim(),
          value: promoData.PXPROM
        });
      });
    }).catch((response: any) => {
      this.promoCodes = [];
    });

    // Grab any financing offer promo codes.
    this.api.editPromotions('F').then((promoCodeList: any) => {
      this.financePromoCodes = [];
      (<any>Object).values(JSON.parse(JSON.stringify(promoCodeList))).forEach((promoData: any) => {
        this.financePromoCodes.push({
          type: 'radio',
          label: promoData.PXDESC2.trim(),
          value: promoData.PXPROM
        });
      });
    }).catch((response: any) => {
      this.financePromoCodes = [];
    });
  }

  /**
   * This function controls various prompts for
   * the user when switching between promotion
   * types.
   */
  promotionSelect() {
    let promoAlert;

    switch (this.promotionType) {
      case '1':
        this.financePromotionSelected = '';
        this.specialPromotionSelected = '';
        this.previousPromo = '1';
        break;
      case '2':
        promoAlert = this.alertCtrl.create({
          title: 'Select Promotion Code',
          inputs: this.financePromoCodes,
          buttons: [
            {
              text: 'Cancel'
            },
            {
              text: 'Select',
              handler: (promoCode: string = '') => {
                if (promoCode) {
                  this.specialPromotionSelected = '';
                  this.financePromotionSelected = promoCode;
                }
              }
            }
          ]
        });
        promoAlert.present();
        promoAlert.onDidDismiss((codeSet: string = '') => {
          if (codeSet) {
            this.previousPromo = this.promotionType;
          } else {
            this.promotionType = this.previousPromo;
          }
        })
        break;
      case '3':
        promoAlert = this.alertCtrl.create({
          title: 'Select Promotion Code',
          inputs: this.promoCodes,
          buttons: [
            {
              text: 'Cancel'
            },
            {
              text: 'Select',
              handler: (promoCode: string = '') => {
                if (promoCode) {
                  this.financePromotionSelected = '';
                  this.specialPromotionSelected = promoCode;
                }
              }
            }
          ]
        });
        promoAlert.present();
        promoAlert.onDidDismiss((codeSet: string = '') => {
          if (codeSet) {
            this.previousPromo = this.promotionType;
          } else {
            this.promotionType = this.previousPromo;
          }
        })
        break;
    }
  }

  /**
   * This functions determines if the user is
   * attempting to update or remove promotions.
   * If they are updating, it will systematically
   * determine which API call to make,
   *
   * @param retainPromotions This is set false if we're removing the promotions.
   */
  updatePromotions(retainPromotions: boolean = true) {
    if (!retainPromotions) {
      this.api.removePromotions().then((response: any) => {
        if (response.retVal == '0') {
          this.viewCtrl.dismiss(true);
        }
      }).catch(() => {
        // Handle response.
      });
    } else {
      this.api.submitSelectedPromotion(this.specialPromotionSelected, this.financePromotionSelected).then((response: any) => {
        this.dismiss(true);
      }).catch((response: any) => {
        // Handle response.
      });
    }
  }

  dismiss(status: boolean = false) {
    this.viewCtrl.dismiss(status);
  }
}
