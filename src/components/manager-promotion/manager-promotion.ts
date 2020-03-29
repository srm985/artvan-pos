import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'manager-promotion',
  templateUrl: 'manager-promotion.html'
})
export class ManagerPromotionComponent {

  approvalLines: any[];         // List of any lines requiring approval.
  promotionCodes: any[];        // List of promotion codes used for approvals.
  inputCodes: any[];            // Array containing codes collected from UI.
  promoErrors: any[];            // Flag list of any input errors.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider
  ) {
    this.approvalLines = [];
    this.promotionCodes = [];
    this.inputCodes = [];
    this.promoErrors = [];
  }

  ngOnInit() {
    new Promise((resolve, reject) => {
      if ('managerapprovallines' in this.viewCtrl.data) {
        resolve(this.viewCtrl.data);
      } else {
        this.api.returnAppliedPromotions().then((response: any) => {
          resolve(response);
        }).catch(() => {
          reject();
        });
      }
    }).then((passedData: any) => {
      // Delete invalid keys.
      delete passedData.managerapprovallines.Sc_errmsg;
      delete passedData.managerapprovallines.retVal;
      delete passedData.financepromo.Sc_errmsg;
      delete passedData.financepromo.retVal;
      delete passedData.managerpromos.Sc_errmsg;
      delete passedData.managerpromos.retVal;
      delete passedData.weeklypromo.Sc_errmsg;
      delete passedData.weeklypromo.retVal;

      // Map objects to arrays.
      this.approvalLines = (<any>Object).values(JSON.parse(JSON.stringify(passedData.managerapprovallines)));
      this.promotionCodes = (<any>Object).values(JSON.parse(JSON.stringify(passedData.managerpromos)));
      /* this.promotionCodes = (<any>Object).values(Object.assign({}, (<any>Object).values(JSON.parse(JSON.stringify(passedData.managerpromos))), (<any>Object).values(JSON.parse(JSON.stringify(passedData.weeklypromo))), (<any>Object).values(JSON.parse(JSON.stringify(passedData.financepromo))))) */

      this.approvalLines.forEach((line: any, index) => {
        //this.inputCodes.push(line.MGPROMO.trim());
        this.approvalLines[index].MGVNDA = line.MGVNDA.trim();
        this.approvalLines[index].MGMDL = line.MGMDL.trim();
        this.approvalLines[index].MGDISC = Number(line.MGDISC);
        this.promoErrors.push(false);
      });
    }).catch((response: any) => {
      this.approvalLines = [];
      this.promotionCodes = [];
    });
  }

  submitPromotions() {
    this.promoErrors = [];

    this.api.submitManagerPromotion(this.approvalLines).then((response: any) => {
      if (response.retVal != '-1') {
        this.dismiss(true);
      } else {
        if ('validate' in response) {
          (<any>Object).values(response.validate).forEach((line: any, index: any) => {
            this.promoErrors[index] = line.retVal == '0' ? false : true;
          });
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
