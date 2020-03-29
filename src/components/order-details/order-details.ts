import { Component } from '@angular/core';
import { ViewController, ModalController, AlertController } from 'ionic-angular'

import { ZipLookupComponent } from '../zip-lookup/zip-lookup';

import { ApiProvider } from '../../providers/api/api';
import { NumberManipulatorProvider } from '../../providers/number-manipulator/number-manipulator';
import { SystemWarningsProvider } from '../../providers/system-warnings/system-warnings';

@Component({
  selector: 'order-details',
  templateUrl: 'order-details.html'
})
export class OrderDetailsComponent {

  orderDetails: any;                  // Object containing all form details.
  deliveryDates: any[];               // List of delivery dates for given zip code.
  pickupDates: any[];                 // List of customer pickup dates for given zip code.
  searchedZip: string;                // Save an instance of the zip we used to search in case field is cleared.
  returnedZipCode: string;            // Save the zip code that was already on the order, if there was one.
  cityPrompted: boolean;              // Set true if we were prompted to pick a city during submission.
  displayZipCode: boolean;            // Determine if the user could enter a zip code for the order.
  setZipCode: boolean;                // Determine if we need to set a zip code.
  displayDeliveryDate: boolean;       // Determine if we need to display the delivery date selector.
  setDeliveryDate: boolean;           // Determine if we need to set a delivery date.
  setPickupDate: boolean;             // Determine if we need to set a pickup date.
  setBeddingPickup: boolean;          // Determine if we need to collect bedding pickup details.
  submitAttempt: boolean;             // Returns true if a submit attempt has been made.
  inputErrors: any;                   // Contains a list of any returned error messages.
  allowSameDayPickup: boolean;        // Flag set true if we allow today's date for pickup.
  modalOpen: boolean;                 // Set true after the modal has opened for the first time.

  constructor(
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private numberManipulator: NumberManipulatorProvider,
    private api: ApiProvider,
    private alertCtrl: AlertController,
    private systemWarnings: SystemWarningsProvider
  ) {
    this.orderDetails = {
      zipCode: '',
      city: '',
      deliveryDate: '',
      cpuDate: '',
      via: '',
      deliveryCharge: true,
      expressDelivery: false,
      premiumCharge: false,
      beddingPickup: '',
      recycleQty: ''
    };
    this.submitAttempt = false;
    this.inputErrors = {
      invalidDelivery: false,
      invalidZip: false,
      invalidPickup: false,
      invalidBeddingPickup: false,
      invalidRecycleQty: false
    }
    this.displayZipCode = false;
    this.setZipCode = false;
    this.displayDeliveryDate = false;
    this.setDeliveryDate = false;
    this.setPickupDate = false;
    this.allowSameDayPickup = false;
    this.modalOpen = false;
    this.returnedZipCode = '';
    this.cityPrompted = false;
  }

  ionViewDidEnter() {
    if (!this.modalOpen) {
      this.initModal();
    }
  }

  /**
   * Initialize our modal from passed data and API
   * calls.
   */
  initModal() {
    const orderDetails = JSON.parse(JSON.stringify(this.viewCtrl.data));

    this.modalOpen = true;

    if (orderDetails) {
      this.api.returnOrderDetails().then((previousDetails: any) => {
        this.displayZipCode = orderDetails.dlvFlag === 'Y' ? true : false;
        this.setDeliveryDate = orderDetails.deliveryDateRequired;
        this.setPickupDate = orderDetails.cpuFlag === 'Y' ? true : false;
        this.setBeddingPickup = orderDetails.bedPickup === 'Y' ? true : false;
        this.allowSameDayPickup = orderDetails.allowSameDayPickup;

        this.orderDetails = {
          zipCode: previousDetails.orderDetails.zipCode,
          city: previousDetails.orderDetails.city,
          deliveryDate: previousDetails.orderDetails.delDate === '0' ? '' : previousDetails.orderDetails.delDate,
          cpuDate: previousDetails.orderDetails.cpuDate === '0' ? '' : previousDetails.orderDetails.cpuDate,
          via: previousDetails.orderDetails.viaLoc === '0' ? '' : previousDetails.orderDetails.viaLoc,
          deliveryCharge: orderDetails.dlvFlag === 'Y' ? true : false,
          expressDelivery: orderDetails.dxFlag === 'Y' ? true : false,
          premiumCharge: orderDetails.premFlag === 'Y' ? true : false,
          beddingPickup: previousDetails.orderDetails.bedPck,
          recycleQty: previousDetails.orderDetails.bedQty === '0' ? '' : previousDetails.orderDetails.bedQty
        };

        // Save our returned zip code to compare later.
        this.returnedZipCode = this.orderDetails.zipCode;

        // Save or returned zip for comparison when searching.
        this.searchedZip = this.orderDetails.zipCode;

        this.deliveryDates = [];
        this.pickupDates = [];

        previousDetails.deliveryDates.forEach((date) => {
          this.deliveryDates.push({
            ISO: date,
            DVDATE6: Number(date.split('-')[1]).toString() + date.split('-')[2] + date.split('-')[0].slice(-2)
          });
        });

        previousDetails.pickUpDates.forEach((date) => {
          this.pickupDates.push({
            ISO: date,
            DVDATE6: Number(date.split('-')[1]).toString() + date.split('-')[2] + date.split('-')[0].slice(-2)
          });
        });
      }).catch(() => {
        // Handle response.
      });
    }
  }

  /**
   * Check if the user has properly entered a
   * zip code. If so, make a call to return
   * delivery dates and update local object.
  */
  fetchDates() {
    if (this.orderDetails.zipCode && (this.orderDetails.zipCode.length == 5 || this.orderDetails.zipCode.length == 6)) {
      this.inputErrors.invalidZip = false;
      this.orderDetails.city = '';
      this.searchedZip = this.orderDetails.zipCode;

      this.api.returnDeliveryDates(this.orderDetails).then((deliveryDates: any) => {
        if (deliveryDates.MULTICITY) {
          this.promptResolveCity(deliveryDates.cities).then((citySelected: string) => {
            this.cityPrompted = true;
            this.orderDetails.city = citySelected;
            this.api.returnDeliveryDates(this.orderDetails).then((deliveryDates: any) => {
              if (!deliveryDates.MULTICITY) {
                delete deliveryDates.CITY;
                delete deliveryDates.ZIP;
                this.deliveryDates = (<any>Object).values(JSON.parse(JSON.stringify(deliveryDates)));
              } else {
                this.deliveryDates = [];
              }
            }).catch(() => {
              this.deliveryDates = [];
            })
          }).catch(() => { })
        } else {
          this.orderDetails.city = deliveryDates.CITY.trim();
          delete deliveryDates.CITY;
          delete deliveryDates.ZIP;
          this.deliveryDates = (<any>Object).values(JSON.parse(JSON.stringify(deliveryDates)));
        }
      }).catch((response: any) => {
        this.deliveryDates = [];
      });
    } else {
      this.inputErrors.invalidZip = 'Invalid Zip Code';
    }
  }

  /**
   * Query pickup dates after passing in
   * a new via location.
   */
  fetchPickupDates() {
    const via = this.orderDetails.via;

    this.pickupDates = [];

    this.api.returnPickupDates(via).then((pickupDates: any) => {
      for (let date of (<any>Object).values(pickupDates)) {
        this.pickupDates.push({
          ISO: date,
          DVDATE6: Number(date.split('-')[1]).toString() + date.split('-')[2] + date.split('-')[0].slice(-2)
        });
      }
    }).catch(() => {
      this.pickupDates = [];
    });
  }

  /**
   * A zip code has mapped to two or
   * more cities, so the user needs
   * to resolve it.
   */
  promptResolveCity(cityList: any) {
    let cityPrompt,
      mappedInputs = [];

    cityList.forEach((city) => {
      mappedInputs.push({
        type: 'radio',
        label: `${city.CZCITY.trim()}, ${city.CZSTATE.trim()}`,
        value: city.CZCITY.trim()
      });
    });

    return new Promise((resolve) => {
      cityPrompt = this.alertCtrl.create({
        title: 'Select City',
        message: 'More than one city was returned for the zip code.',
        inputs: mappedInputs,
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              resolve('');
            }
          },
          {
            text: 'Select',
            handler: (value: string) => {
              resolve(value);
            }
          }
        ]
      });
      cityPrompt.present();
    });
  }

  /**
   * Present a modal which allows users to search
   * zip codes based on city.
   */
  searchZip() {
    let zipSearch = this.modalCtrl.create(ZipLookupComponent);

    zipSearch.present();
    zipSearch.onDidDismiss((data: any) => {
      if (data) {
        this.orderDetails.zipCode = data.zip;
        this.orderDetails.city = data.city;
        // Only query dates if we need to set one.
        setTimeout(() => {
          if (this.setDeliveryDate) {
            this.fetchDates();
          }
        }, 0);
      }
    });
  }

  /**
   * This function attempts to submit the order details page
   * if all is valid. If not, it displays applicable warnings.
   */
  addOrderDetails() {
    // Clear input errors in preparation for submit attempt.
    for (let key in this.inputErrors) {
      this.inputErrors[key] = false;
    }

    /**
     * We save the zip code search for later in case the user
     * modifies the zip code after searching for delivery
     * dates. For express delivery though, they can't search
     * so we just use what's in the field.
     */
    /* if (this.setDeliveryDate) {
      this.orderDetails.zipCode = this.searchedZip;
    } else if (!this.displayZipCode) {
      this.orderDetails.zipCode = '';
    } */

    this.orderDetails.zipCode = this.displayZipCode ? this.orderDetails.zipCode : '';

    if (this.displayZipCode && (this.orderDetails.deliveryCharge || this.orderDetails.premiumCharge)) {
      this.setZipCode = true;
    } else {
      this.setZipCode = false;
    }

    /**
     * If the zip code has changed, we clear the city
     * so that middleware can set a new city.
     */
    if (this.returnedZipCode.trim() != this.orderDetails.zipCode && !this.cityPrompted) {
      this.orderDetails.city = '';
    }

    // If we don't have a bedding option on order, clear these values.
    if (!this.setBeddingPickup) {
      this.orderDetails.beddingPickup = '0';
      this.orderDetails.recycleQty = '0';
    }

    // If everything is valid, submit.
    if (this.infoValid()) {
      this.api.submitOrderDetails(this.orderDetails).then((response: any) => {
        if ('errCode' in response) {
          if (response.message[0] == 'Express Delivery Is Not Available For This Zip Code') {
            this.systemWarnings.returnedError(response.message[0]);
          } else {
            this.inputErrors.invalidDelivery = response.errInd[2] === '1' ? true : false;
          }
          this.inputErrors.invalidPickup = response.errInd[3] === '1' ? true : false;

        } else if (!('retVal' in response)) {
          this.promptResolveCity((<any>Object).values(JSON.parse(JSON.stringify(response)))).then((citySelected: string) => {
            this.cityPrompted = true;
            this.orderDetails.city = citySelected;
            this.addOrderDetails();
          });
        } else {
          this.viewCtrl.dismiss(true);
        }
      }).catch((response: any) => {
        // Handle response.
      });
    }

    // If we can enter a zip code, but it's not formatted correctly, warn.
    if ((this.displayZipCode && this.orderDetails.zipCode.length && this.orderDetails.zipCode.length != 5 && this.orderDetails.zipCode.length != 6)
      || (this.setZipCode && this.orderDetails.zipCode.length != 5 && this.orderDetails.zipCode.length != 6)) {
      this.inputErrors.invalidZip = true;
    }

    // If we're supposed to submit a delivery date, but left it blank, warn.
    if (this.setDeliveryDate && !this.orderDetails.deliveryDate.length) {
      this.inputErrors.invalidDelivery = true;
    }

    // If we're supposed to submit a pickup date, but left it blank, warn.
    if (this.setPickupDate && !this.orderDetails.cpuDate.length) {
      this.inputErrors.invalidPickup = true;
    }

    // If we're supposed to submit a bedding pickup option, but left it blank, warn.
    if (this.setBeddingPickup && !this.orderDetails.beddingPickup.length) {
      this.inputErrors.invalidBeddingPickup = true;
    }

    // If we're supposed to enter a quantity for bedding haul away, but left it blank, warn.
    if (this.orderDetails.beddingPickup == 3 && !this.orderDetails.recycleQty.length) {
      this.inputErrors.invalidRecycleQty = true;
    }
  }

  private infoValid(): boolean {
    const zipLength = this.orderDetails.zipCode.length;

    if (
      ((this.setDeliveryDate && this.orderDetails.deliveryDate.length) || !this.setDeliveryDate)
      && ((this.setZipCode && (zipLength == 5 || zipLength == 6)) || !this.setZipCode && (!zipLength || zipLength == 5 || zipLength == 6))
      && ((this.setPickupDate && this.orderDetails.cpuDate.length) || !this.setPickupDate)
      && ((this.setBeddingPickup && this.orderDetails.beddingPickup.length) || !this.setBeddingPickup)
      && ((this.orderDetails.beddingPickup == 3 && this.orderDetails.recycleQty.length) || this.orderDetails.beddingPickup != 3)
    ) {
      return true;
    } else {
      return false;
    }
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  formatNumber() {
    this.orderDetails.via = this.numberManipulator.returnWholeNumber(this.orderDetails.via);
    this.orderDetails.recycleQty = this.numberManipulator.returnWholeNumberComma(this.orderDetails.recycleQty);
  }
}
