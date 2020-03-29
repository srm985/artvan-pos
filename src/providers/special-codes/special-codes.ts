import { Injectable } from '@angular/core';

import { ApiProvider } from '../api/api';
import { SystemWarningsProvider } from '../system-warnings/system-warnings';

@Injectable()
export class SpecialCodesProvider {

  private codesPopulated: boolean;      // Boolean status of codes updated.
  private transactionTypes: any[];      // List containing transaction type codes.
  private floorCodes: any[];            // List containing floor codes.

  constructor(
    private api: ApiProvider,
    private systemWarnings: SystemWarningsProvider
  ) {
    this.codesPopulated = false;
  }

  queryCodes() {
    return new Promise((resolve) => {
      new Promise((resolve) => {
        if (!this.codesPopulated) {
          Promise.all([
            this.queryTransactionTypes(),
            this.queryFloorCodes(),
          ]).then(() => {
            this.codesPopulated = true;
            resolve();
          }).catch(() => {
            // this.systemWarnings.networkError(638591);
            resolve();
          });
        } else {
          resolve();
        }
      }).then(() => {
        try {
          resolve({
            transactionTypes: JSON.parse(JSON.stringify(this.transactionTypes)),
            floorCodes: JSON.parse(JSON.stringify(this.floorCodes)),
          });
        } catch (err) {
          this.systemWarnings.computationalError(642445);
        }
      });
    });
  }

  /**
   * Query our available transaction types.
   * These codes probably could be hard-coded
   * because they rarely change. We query once
   * during the application lifecycle and then
   * cache so it's no big deal.
   */
  private queryTransactionTypes() {
    return new Promise((resolve, reject) => {
      this.api.returnTransactionTypes().then((transactionTypes: any[]) => {
        this.transactionTypes = [
          {
            "val": "CP",
            "desc": "Customer Pickup"
          },
          {
            "val": "DL",
            "desc": "Delivery"
          },
          {
            "val": "DX",
            "desc": "Express Delivery"
          },
          {
            "val": "LY",
            "desc": "Layaway"
          },
          {
            "val": "PR",
            "desc": "Protect"
          },
          {
            "val": "SO",
            "desc": "Special Order"
          },
          {
            "val": "TK",
            "desc": "Taken"
          },
          {
            "val": "WI",
            "desc": "When In"
          }
        ];
        (<any>Object).values(JSON.parse(JSON.stringify(transactionTypes))).forEach((code: any) => {
          this.transactionTypes.push({
            'val': code.struct_name.tytype.trim(),
            'desc': this.formatDescription(code.struct_name.tydesc)
          });
        });
        resolve();
      }).catch((response: any) => {
        // Handle response.
        reject();
      });
    });
  }

  /**
   * Query our floor codes.
   *
   * Currently floor codes are hard-coded
   * because they have never changed. This
   * function is set up to return a promise
   * though in case we ever start querying.
   */
  private queryFloorCodes() {
    return new Promise((resolve, reject) => {
      this.floorCodes = [
        {
          'val': 'B',
          'desc': 'Backroom'
        },
        {
          'val': 'D',
          'desc': 'Display'
        },
        {
          'val': 'F',
          'desc': 'Floor Sample'
        }
      ];
      resolve();
    });
  }

  private formatDescription(desc) {
    desc = desc.trim().toLowerCase().split(' ');
    desc.forEach((element, index) => {
      desc[index] = element.slice(0, 1).toUpperCase() + element.slice(1);
    });
    return desc.join(' ');
  }
}
