import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'comfort-protection-program',
  templateUrl: 'comfort-protection-program.html'
})
export class ComfortProtectionProgramComponent {

  comfortMessage_1: string;     // Stores the first half of message, prior to price.
  comfortMessage_2: string;     // Stores the second half of message, after price.
  price: number;                // Stores our price for the plan.
  tsgType: string;              // Store a TSG type, which is sent to back end.
  prompt_1: string;             // Stores our first customer prompt.
  prompt_2: string;             // Stores our second customer prompt.
  acceptPrompt_1: boolean;      // Stores the acceptance status of first prompt.
  acceptPrompt_2: boolean;      // Stores the acceptance status of second prompt.
  padPurchased: boolean;        // Returns true if the customer already is purchasing mattress pad.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider
  ) {
    this.acceptPrompt_1 = true;
    this.acceptPrompt_2 = true;
  }

  ngOnInit() {
    const protectionDetails = JSON.parse(JSON.stringify(this.viewCtrl.data)),
      messagePrompt_1 = 'Would you like to purchase the 30/60 Comfort Protection Program?',
      messagePrompt_2 = 'You agree to buy and use a new mattress pad on your new mattress?';

    let message;

    if (protectionDetails) {
      // Fix the nonsense double spaces and split at price so we can highlight it in HTML.
      message = protectionDetails.verbiage.replace(/\s{2,}/g, ' ').replace(messagePrompt_1, '').replace(messagePrompt_2, '').trim().split(' $' + [protectionDetails.price]);
      this.comfortMessage_1 = message[0];
      this.comfortMessage_2 = message[1];
      this.price = protectionDetails.price;
      this.tsgType = protectionDetails.TsgType;
      this.prompt_1 = messagePrompt_1;
      this.prompt_2 = messagePrompt_2;
      this.padPurchased = protectionDetails.MatProt === 'Y' ? true : false;
    }
  }

  /**
   * Evaluate if we should call procedure
   * to add plan to transaction.
   */
  submit() {
    let planAccepted = false;

    if (this.acceptPrompt_1 && (this.acceptPrompt_2 || this.padPurchased)) {
      planAccepted = true;
    }

    this.api.addMattressProtection({
      accepted: planAccepted,
      price: this.price,
      tsgType: this.tsgType
    }).then((response: any) => {
      this.dismiss(true);
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * Close our modal without allowing
   * the user to progress.
   */
  dismiss(status: boolean = false) {
    this.viewCtrl.dismiss(status);
  }
}
