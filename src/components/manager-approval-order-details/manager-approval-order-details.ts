import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'manager-approval-order-details',
  templateUrl: 'manager-approval-order-details.html'
})
export class ManagerApprovalOrderDetailsComponent {

  orderDetails: any[];          // Contains any order detail flags set for the current order.

  constructor(
    private viewCtrl: ViewController
  ) {
    this.orderDetails = [];
  }

  ionViewDidLoad() {
    this.orderDetails = [...this.viewCtrl.data.orderDetails];
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
