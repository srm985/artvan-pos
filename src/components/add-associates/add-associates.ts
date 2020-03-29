import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'add-associates',
  templateUrl: 'add-associates.html'
})
export class AddAssociatesComponent {

  associateList: any;           // Contains a list of sales associates on current order.
  errorMap: any[];              // Contains a mapped list of error flags.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider
  ) {
    this.associateList = {
      slsAssNum1: '',
      slsAssNum2: '',
      slsAssNum3: '',
      slsAssNum4: ''
    };
    this.queryAssociates();
    this.errorMap = [];
  }

  /**
   * Make a call to API to return sales associates.
   * Just return an empty array if there's an error.
   */
  queryAssociates(): void {
    this.api.returnSalesAssociates().then((salesAssociates: any[]) => {
      // Update our associate list with returned data.
      this.associateList = JSON.parse(JSON.stringify(salesAssociates));
      this.associateList = {
        slsAssNum1: this.associateList.slsAssNum1 == 0 ? '' : this.associateList.slsAssNum1,
        slsAssNum2: this.associateList.slsAssNum2 == 0 ? '' : this.associateList.slsAssNum2,
        slsAssNum3: this.associateList.slsAssNum3 == 0 ? '' : this.associateList.slsAssNum3,
        slsAssNum4: this.associateList.slsAssNum4 == 0 ? '' : this.associateList.slsAssNum4
      };
    }).catch((response: any) => {
      // Display errors, if required.
      this.associateList = {
        slsAssNum1: '',
        slsAssNum2: '',
        slsAssNum3: '',
        slsAssNum4: ''
      };
    });
  }

  /**
   * This function structures and passes our
   * associate list to the API for updating.
   */
  updateAssociates(): void {
    const ASSOCIATE_LIST = this.sortAssociates(this.associateList);

    this.errorMap = [];

    this.api.setSalesAssociates(ASSOCIATE_LIST).then((response: any) => {
      if ('associates' in response) {
        let errorStatus = response.associates.errSales.reduce((a, b) => Number(a) + Number(b), 0);

        if (!errorStatus) {
          this.dismiss();
        } else {
          this.errorMap = [...response.associates.errSales].map(error => Number(error));
        }
      }
    }).catch((response: any) => {
      // Display errors, if required.
    });
  }

  /**
   * Dismiss our modal.
   */
  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  /**
   * Remove any gaps from our
   * associate data array.
   */
  sortAssociates(associateObject) {
    let sortedArr: any[] = [];
    Object.keys(associateObject).map(i => associateObject[i]).forEach((val) => {
      if (val.length) {
        sortedArr.push(val);
      }
    });
    return sortedArr;
  }

  /**
   * TO IMPLEMENT: Associate Search
   */
}
