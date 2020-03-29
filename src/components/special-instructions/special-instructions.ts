import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular'

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'special-instructions',
  templateUrl: 'special-instructions.html'
})
export class SpecialInstructionsComponent {

  specialInstructions: string;  // String containing special instructions (max length: 225).
  maxLength: number;            // Maximum permitted string length of special instructions.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider
  ) {
    this.specialInstructions = '';
    this.maxLength = 225;

    this.api.returnSpecialInstructions().then((specialInstructions: any) => {
      this.specialInstructions = specialInstructions[0].XMINS1.trim() + specialInstructions[0].XMINS2.trim() + specialInstructions[0].XMINS3.trim();
    }).catch((response: any) => {
      // Handle response.
      this.specialInstructions = '';
    });
  }

  /**
   * This function passes our special instructions
   * to the API. A max length of 255 characters is
   * permitted. This restruction comes from the AS/400.
   */
  submitInstructions(): void {
    const specialInstructions = this.specialInstructions.toUpperCase();

    this.api.editSpecialInstructions(specialInstructions).then((response: any) => {
      // If we were successfully able to submit instructions, close our modal.
      this.dismiss();
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * This function simply closes our modal.
  */
  dismiss(): void {
    this.viewCtrl.dismiss();
  }
}
