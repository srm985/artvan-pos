import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'protection-plan-prompt',
  templateUrl: 'protection-plan-prompt.html'
})
export class ProtectionPlanPromptComponent {

  protectionPlanOptions: any;   // Contains a list of available protection plans.
  planPricing: any;             // Lookup table for plan pricing.
  planSelected: string;         // Contains the selected plan option.
  kitSelected: string;          // Contains the selected kit option.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider
  ) {
    this.protectionPlanOptions = {};
    this.planPricing = {};
    this.planSelected = '';
    this.kitSelected = '';
  }

  ngOnInit() {
    this.api.returnProtectionPlans().then((protectionPlans: any) => {
      this.protectionPlanOptions = JSON.parse(JSON.stringify(protectionPlans));

      // Clean up text. For some reason it is served all-caps.
      this.protectionPlanOptions.goldDesc = this.cleanText(this.protectionPlanOptions.goldDesc);
      this.protectionPlanOptions.silverDesc = this.cleanText(this.protectionPlanOptions.silverDesc);
      this.protectionPlanOptions.bronzeDesc = this.cleanText(this.protectionPlanOptions.bronzeDesc);
      this.protectionPlanOptions.prmDsc = this.cleanText(this.protectionPlanOptions.prmDsc);
      this.protectionPlanOptions.freeDsc = this.cleanText(this.protectionPlanOptions.freeDsc);

      this.planSelected = protectionPlans.plnSelect;
      if (protectionPlans.premKit == 'Y') {
        this.kitSelected = 'P';
      } else if (protectionPlans.freeKit == 'Y') {
        this.kitSelected = 'F';
      }

      this.planPricing = {
        'G': Number(protectionPlans.Gold),
        'S': Number(protectionPlans.Silver),
        'B': Number(protectionPlans.Bronze),
        'D': 0
      };
    }).catch((response: any) => {
      this.protectionPlanOptions = {};
    })
  }

  /**
   * This function makes a call to our API
   * to submit our selected protection plan
   * or to reject the service.
   */
  submitWarrantyOptions(planAccepted: boolean = false) {
    let planSelected,
      kitSelected;

    if (!planAccepted) {
      planSelected = 'D';
      kitSelected = '';
    } else {
      planSelected = this.planSelected;
      kitSelected = this.kitSelected;
    }

    this.api.submitProtectionPlanWarrantKit({
      plan: planSelected,
      kit: kitSelected,
      price: this.planPricing[planSelected]
    }).then((response: any) => {
      this.dismiss(true);
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * This function dismisses our modal and passes a
   * status.
   */
  dismiss(status: any) {
    this.viewCtrl.dismiss(status);
  }

  /**
   * Correct poorly formatted text returned from the
   * AS/400.
   */
  private cleanText(text: string) {
    let splitText,
      formattedText;

    splitText = text.toLowerCase().trim().split(' ');
    formattedText = [];
    for (let chunk in splitText) {
      formattedText.push(splitText[chunk].slice(0, 1).toUpperCase() + splitText[chunk].slice(1));
    }

    return formattedText.join(' ');
  }
}
