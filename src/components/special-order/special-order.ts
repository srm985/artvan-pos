import { ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

import { ApiProvider } from '../../providers/api/api';
import { ErrorMapperProvider } from '../../providers/error-mapper/error-mapper';

@Component({
  selector: 'special-order',
  templateUrl: 'special-order.html'
})
export class SpecialOrderComponent {

  passedParameters: any;        // Object containing passed parameters from calling function.
  orderInfo: any;               // Mapped list of all special order parameters to be collected.
  validations: any;             // Object containing validation status of each input field.
  mappedErrors: any[];          // Mapped error text to fields.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider,
    private errorMap: ErrorMapperProvider
  ) {
    this.orderInfo = {
      vendor: '',
      vendorDescription: '',
      model: '',
      specialCode: '',
      categoryDescription: '',
      alternateDescription: '',
      website: '',
      price: '',
      protection: '',
      quantity: '',
      category: '',
      expectedDelivery: '',
      comments: '',
      fplpNumber: '',
      lines: []
    };
    this.validations = {
      model: true,
      fplpNumber: true
    };
    this.mappedErrors = [];
  }

  ngOnInit() {
    this.orderInfo = JSON.parse(JSON.stringify(this.viewCtrl.data));
  }

  submitSpecialOrder() {
    const tempOrderInfo = JSON.parse(JSON.stringify(this.orderInfo));

    this.api.submitSpecialOrder(tempOrderInfo).then((response: any) => {
      if (response.retVal == '0') {
        this.dismiss(true);
      } else {
        this.mappedErrors = this.errorMap.mapErrors(response.Sc_errind, response.Sc_errmsg);
      }
    }).catch((response: any) => {
      // Handle response.
    });
  }

  dismiss(status: boolean = false) {
    this.viewCtrl.dismiss(status);
  }
}
