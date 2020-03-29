import { AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class SystemWarningsProvider {

  private warningPending: boolean;      // Set true to prevent multiple warnings.

  constructor(
    private alertCtrl: AlertController
  ) {
    this.warningPending = false;
  }

  systemError(error: number = 0) {
    let alert;

    if (!this.warningPending) {
      this.warningPending = true;

      alert = this.alertCtrl.create({
        title: 'System Error',
        subTitle: `The application experienced a system error. Please try the operation again. Error: ${error}`,
        buttons: ['Dismiss']
      });
      alert.present();
      alert.onDidDismiss(() => {
        this.warningPending = false;
      });
    }
  }

  networkError(error: number = 0) {
    let alert;

    if (!this.warningPending) {
      this.warningPending = true;

      alert = this.alertCtrl.create({
        title: 'Network Error',
        subTitle: `The application experienced a network connection error. Please try the operation again. Error: ${error}`,
        buttons: ['Dismiss']
      });
      alert.present();
      alert.onDidDismiss(() => {
        this.warningPending = false;
      });
    }
  }

  computationalError(error: number = 0) {
    let alert;

    if (!this.warningPending) {
      this.warningPending = true;

      alert = this.alertCtrl.create({
        title: 'Computational Error',
        subTitle: `The application experienced a computational error. Please try the operation again. Error: ${error}`,
        buttons: ['Dismiss']
      });
      alert.present();
      alert.onDidDismiss(() => {
        this.warningPending = false;
      });
    }
  }

  insufficientQuantity() {
    let alert = this.alertCtrl.create({
      title: 'Insufficient Quantity',
      subTitle: `The attempted quantity is more than what is currently stocked.`,
      buttons: ['Dismiss']
    });
    alert.present();
  }

  returnedError(errorText: string = '') {
    errorText = errorText.replace(/\s{2,}/g, ' ').trim();

    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: errorText,
      buttons: ['Dismiss']
    });
    alert.present();
  }
}
