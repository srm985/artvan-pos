import { Component } from '@angular/core';
import { ApiProvider } from '../../providers/api/api';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'finance-promotions',
  templateUrl: 'finance-promotions.html'
})
export class FinancePromotionsComponent {

  financePromotionsResults: any[];    // Contains a list of the returned zip codes.
  resultSelected: number;             // Tracks the index of the item currently selected.
  proceedStatus: boolean;             // Set true when an item has been selected.

  constructor(
    private api: ApiProvider,
    private viewCtrl: ViewController
  ) {
    this.financePromotionsResults = [];
    this.proceedStatus = false;
  }

  ngOnInit() {
    let startDate,
      endDate;

    this.api.returnFinancePromotions().then((financePromotionsResults: any) => {
      (<any>Object).values(financePromotionsResults).forEach((financePromotions) => {
        startDate = financePromotions.PXFDATE.trim();
        endDate = financePromotions.PXTDATE.trim();

        // Convert dates to ISO for Angular date pipe.
        if (startDate.length == 6) {
          startDate = `20${startDate.slice(4, 6)}-${startDate.slice(0, 2)}-${startDate.slice(2, 4)}`;
        } else {
          startDate = `20${startDate.slice(3, 5)}-0${startDate.slice(0, 1)}-${startDate.slice(1, 3)}`;
        }

        // Convert dates to ISO for Angular date pipe.
        if (endDate.length == 6) {
          endDate = `20${endDate.slice(4, 6)}-${endDate.slice(0, 2)}-${endDate.slice(2, 4)}`;
        } else {
          endDate = `20${endDate.slice(3, 5)}-0${endDate.slice(0, 1)}-${endDate.slice(1, 3)}`;
        }

        // Build our object to display.
        this.financePromotionsResults.push({
          value: financePromotions.PXPROMO.trim(),
          name: financePromotions.PXDESC.trim(),
          description: (financePromotions.PXCMT1.trim() + ' ' + financePromotions.PXCMT2.trim() + ' ' + financePromotions.PXCMT3.trim()).trim(),
          startDate: startDate,
          endDate: endDate,
          payments: Number(financePromotions.PXLENGTH.trim()),
          minimumPrice: Number(financePromotions.PXMINPRC.trim()),
          percentDown: Number(financePromotions.PXPCTDWN.trim()),
          withPay: financePromotions.PXWITHPAY.trim() === 'Y' ? true : false
        });
      });
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * This function handles the actions when a
   * user clicks on a list item. If it was previously
   * selected, it is deselected. If an item is selected,
   * the user can proceed.
   */
  selectFinancePromotion(promotion) {
    this.resultSelected = this.resultSelected != promotion ? promotion : null;
    this.proceedStatus = this.resultSelected !== null ? true : false;
  }

  /**
   * This function should only be called if a zip code
   * has been selected. It then returns the selected
   * value from the list.
   */
  returnFinancePromotion() {
    this.dismiss(this.financePromotionsResults[this.resultSelected].value);
  }

  /**
   * This function dismisses our modal and passes an
   * empty string as the value.
   */
  dismiss(promotion: string = '') {
    this.viewCtrl.dismiss(promotion);
  }
}
