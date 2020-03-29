import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular'

import { ApiProvider } from '../../providers/api/api';
import { NumberManipulatorProvider } from '../../providers/number-manipulator/number-manipulator';
import { SpecialCodesProvider } from '../../providers/special-codes/special-codes';
import { SystemWarningsProvider } from '../../providers/system-warnings/system-warnings';

@Component({
  selector: 'edit-line-item',
  templateUrl: 'edit-line-item.html'
})
export class EditLineItemComponent {

  lineItem: any;                  // Object containing attributes for current line item.
  totalPrice: number;             // A formatted total price calculated from price and quantity.
  transactionTypes: any;          // Table of transaction types.
  transactionTypesLookup: any;    // Reverse lookup for transaction types from codes.
  floorCodesLookup: any;          // Reverse lookup for floor codes from codes.
  floorCodes: any;                // Table of floor codes.
  acquisitionDates: any[];        // Array containing acquisition dates for each item.
  acquisitionType: any[];         // Array containing acquisition type for each item.
  editLine: boolean[];            // Array which hold the edit availability of each line.
  editPrice: boolean[];           // Array which holds the edit price availability of each line.
  editAvailableFlag: boolean;     // Flag set true to indicate something may be editted on the page.
  editReturnedErrors: any[];      // Mapped errors for each item being edited.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider,
    private numberManipulator: NumberManipulatorProvider,
    private specialCodes: SpecialCodesProvider,
    private systemWarnings: SystemWarningsProvider
  ) {
    this.lineItem = {};
    this.acquisitionDates = [];
    this.acquisitionType = [];
    this.editLine = [];
    this.editPrice = [];
    this.editAvailableFlag = false;
    this.editReturnedErrors = [];

    this.specialCodes.queryCodes().then((codes: any) => {
      this.transactionTypes = JSON.parse(JSON.stringify(codes.transactionTypes));
      this.floorCodes = JSON.parse(JSON.stringify(codes.floorCodes));
    });
  }

  ngOnInit() {
    let linesToCheckEdit = [],
      itemCount = 0;


    if (this.viewCtrl.data) {
      const passedData = JSON.parse(JSON.stringify(this.viewCtrl.data));
      this.lineItem = passedData.lineItem;
      this.transactionTypesLookup = passedData.transactionTypesLookup;
      this.floorCodesLookup = passedData.floorCodesLookup;

      console.log(passedData);

      this.lineItem.price = this.numberManipulator.returnCurrency(this.lineItem.price, true) != '' ? this.numberManipulator.returnCurrency(this.lineItem.price, true) : '$0.00';
      this.totalPrice = Number(this.lineItem.qty) * Number(this.numberManipulator.returnDecimalNumber(this.lineItem.price));

      // Compile our list of lines we need to check.
      linesToCheckEdit.push(this.lineItem.line);
      this.lineItem.setItems.forEach((item: any) => {
        linesToCheckEdit.push(item.line);
      });

      this.api.checkLineItemEditAvailable([...linesToCheckEdit]).then((availableEdits: any) => {

        itemCount = linesToCheckEdit.length;
        this.editAvailableFlag = false;

        // Create arrays with the length of the line item + the set items and set default to false.
        this.editLine = new Array(itemCount);
        this.editPrice = new Array(itemCount);
        this.editLine.fill(false);
        this.editPrice.fill(false);

        // Create and define our arrays for acquisition dates and types.
        this.acquisitionDates = new Array(itemCount);
        this.acquisitionType = new Array(itemCount);
        this.acquisitionDates.fill([]);
        this.acquisitionType.fill('');

        // Iterate through lines to see which we can edit. We assume they'll be in order.
        (<any>Object).values(JSON.parse(JSON.stringify(availableEdits.lines))).forEach((lineItem: any, index: number) => {

          // If there's no warning, we assume we can edit the line.
          if (!lineItem.Sc_errmsg.Sc_errmsg_0.trim().length) {

            // We match up the line numbers to be sure it's the right item.
            if (this.lineItem.line == lineItem.line) {
              this.editAvailableFlag = true;

              // Set our flag, indicating line can be edited.
              this.editLine[0] = true;
              this.lineItem['editLine'] = true;

              // Check if it will be a delivery or pickup item.
              if (lineItem.cpucalendar !== 'none') {
                /* this.acquisitionType[0] = 'pickup';
                this.acquisitionDates[0] = [...lineItem.cpucalendar]; */
                this.lineItem['acquisitionType'] = 'pickup';
                this.lineItem['acquisitionDates'] = [...lineItem.cpucalendar];
              } else if (lineItem.deliverycalendar !== 'none') {
                /* this.acquisitionType[0] = 'delivery';
                this.acquisitionDates[0] = [...lineItem.deliverycalendar]; */
                this.lineItem['acquisitionType'] = 'delivery';
                this.lineItem['acquisitionDates'] = [...lineItem.deliverycalendar];
              }

              // Check if we are allowed to edit transaction type or floor code.
              this.lineItem['editFloorCode'] = lineItem.flrAlw == '1' ? true : false;
              this.lineItem['editTransactionType'] = lineItem.typAlw == '1' ? true : false;

            } else {
              this.lineItem.setItems.forEach((setItem: any, setItemIndex: number) => {
                if (setItem.line == lineItem.line) {
                  this.editAvailableFlag = true;

                  // Set our flag, indicating line can be edited.
                  this.editLine[setItemIndex + 1] = true;
                  this.lineItem.setItems[setItemIndex]['editLine'] = true;

                  // Check if it will be a delivery or pickup item.
                  if (lineItem.cpucalendar !== 'none') {
                    /* this.acquisitionType[setItemIndex + 1] = 'pickup';
                    this.acquisitionDates[setItemIndex + 1] = [...lineItem.cpucalendar]; */
                    this.lineItem.setItems[setItemIndex]['acquisitionType'] = 'pickup';
                    this.lineItem.setItems[setItemIndex]['acquisitionDates'] = [...lineItem.cpucalendar];
                  } else if (lineItem.deliverycalendar !== 'none') {
                    /* this.acquisitionType[setItemIndex + 1] = 'delivery';
                    this.acquisitionDates[setItemIndex + 1] = [...lineItem.deliverycalendar]; */
                    this.lineItem.setItems[setItemIndex]['acquisitionType'] = 'delivery';
                    this.lineItem.setItems[setItemIndex]['acquisitionDates'] = [...lineItem.deliverycalendar];
                  }

                  // Check if we are allowed to edit transaction type or floor code.
                  this.lineItem.setItems[setItemIndex]['editFloorCode'] = lineItem.flrAlw == '1' ? true : false;
                  this.lineItem.setItems[setItemIndex]['editTransactionType'] = lineItem.typAlw == '1' ? true : false;
                }
              });
            }
          }
        });

        console.log(this.lineItem);

        // Compare returned price override lines to order and determine which we can edit.
        (<any>Object).values(JSON.parse(JSON.stringify(availableEdits.priceoverrides))).forEach((lineItem: any, index: number) => {
          // We match up the line numbers to be sure it's the right item.
          if (this.lineItem.line == lineItem.POLINE) {
            this.editAvailableFlag = true;

            // We capture the SKU from here and add it to the object because we need it for price overrides.
            this.lineItem['SKU'] = lineItem.POSKU;
            /* this.editPrice[0] = true; */
            this.lineItem['editPrice'] = true;
          } else {
            this.lineItem.setItems.forEach((setItem: any, setItemIndex: number) => {
              if (setItem.line == lineItem.POLINE) {
                this.editAvailableFlag = true;

                // We capture the SKU from here and add it to the object because we need it for price overrides.
                this.lineItem.setItem[setItemIndex]['SKU'] = lineItem.POSKU;
                this.lineItem.editPrice[setItemIndex]['editPrice'] = true;
                /* this.editPrice[setItemIndex + 1] = true; */
              }
            });
          }
        });
      }).catch((response: any) => {
        // Handle response.
      });
    }
  }

  checkQueryDates(transactionType: string, via: string, itemNumber: number) {
    new Promise((resolve, reject) => {
      if (transactionType.toUpperCase() === 'CP') {
        this.api.returnPickupDates(via).then((dates: any) => {
          if (dates.errCode === '003') {
            this.systemWarnings.returnedError('Invalid pickup location.');
            reject();
          } else {
            resolve(dates);
          }
        }).catch((response: any) => {
          reject();
        });
      } else if (transactionType.toUpperCase() === 'DL') {
        this.api.returnDeliveryDates().then((dates: any) => {
          if (dates.errCode === '003') {
            this.systemWarnings.returnedError('No zip code set for order.');
            reject();
          } else {
            let dateISO = [];

            delete dates.ZIP;
            delete dates.CITY;

            (<any>Object).values(dates).forEach((dateItem: any) => {
              dateISO.push(dateItem.ISO);
            });
            resolve(dateISO);
          }
        }).catch((response: any) => {
          reject();
        });
      }
    }).then((dateList: any) => {
      dateList = (<any>Object).values(dateList);

      if (itemNumber == 0) {
        this.lineItem.acquisitionDates = [...dateList];
      } else {
        this.lineItem.setItems[itemNumber - 1].acquisitionDates = [...dateList];
      }
    }).catch(() => {
      if (itemNumber == 0) {
        this.lineItem.acquisitionDates = [];
      } else {
        this.lineItem.setItems[itemNumber - 1].acquisitionDates = [];
      }
    })
  }

  submitEdit() {
    // TODO: Implement error handling.
    let tempItem = JSON.parse(JSON.stringify(this.lineItem)),
      submitPayload = [],
      proceedFlag = true;

    tempItem.setItems.forEach((item: any, index: any) => {
      if (item.editLine || item.editPrice) {
        submitPayload.push(JSON.parse(JSON.stringify(item)));
      }
    });

    if (tempItem.editLine || tempItem.editPrice) {
      delete tempItem.setItems;
      tempItem.price = Number(this.numberManipulator.returnDecimalNumber(tempItem.price)) > 0 ? Number(this.numberManipulator.returnDecimalNumber(tempItem.price)) : 0;
      submitPayload.push(tempItem);
    }

    this.editReturnedErrors = [];

    this.api.submitLineItemEdit(submitPayload).then((response: any) => {
      (<any>Object).values(response).forEach((line: any, lineNumber: any) => {

        // See if we received any line item editing errors. Key may not exist.
        try {
          if (line.editdelivery.retVal == '-1') {
            proceedFlag = false;
            this.editReturnedErrors[lineNumber] = [...line.editdelivery.Sc_errmsg];
          } else {
            this.editReturnedErrors[lineNumber] = [];
          }
        } catch (err) {
          this.editReturnedErrors[lineNumber] = [];
        }

        // See if we received any price override errors. Key may not exist.
        try {
          if (line.editprice.retVal == '-1') {
            proceedFlag = false;
            this.editReturnedErrors[lineNumber].push(line.editprice.Sc_errmsg);
          }
        } catch (err) { }
      });

      if (proceedFlag) {
        this.dismiss(true);
      }
    }).catch((response: any) => {
      // Handle response.
    });
  }

  dismiss(status: boolean = false) {
    this.viewCtrl.dismiss(status);
  }

  formatCurrency() {
    this.lineItem.price = this.numberManipulator.returnCurrency(this.lineItem.price, true);
    this.totalPrice = Number(this.lineItem.qty) * Number(this.numberManipulator.returnDecimalNumber(this.lineItem.price));
  }
}
