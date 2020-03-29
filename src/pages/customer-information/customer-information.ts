import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ModalController, ViewController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CustomerSearchPage } from '../customer-search/customer-search';
import { TenderMethodsPage } from '../../pages/tender-methods/tender-methods';

import { FunctionsPopoverComponent } from '../../components/functions-popover/functions-popover';
import { ManagerPromotionComponent } from '../../components/manager-promotion/manager-promotion';

import { ApiProvider } from '../../providers/api/api';
import { NumberManipulatorProvider } from '../../providers/number-manipulator/number-manipulator';
import { StateListProvider } from '../../providers/state-list/state-list';
import { StorageProvider } from '../../providers/storage/storage';
import { ErrorMapperProvider } from '../../providers/error-mapper/error-mapper';
import { SystemWarningsProvider } from '../../providers/system-warnings/system-warnings';

import { EmailValidator } from '../../validators/email';
import { PhoneValidator } from '../../validators/phone';

@IonicPage()
@Component({
  selector: 'page-customer-information',
  templateUrl: 'customer-information.html',
})
export class CustomerInformationPage {

  displayedInModal: boolean;          // Set true if this is being loaded as a modal view.
  customer: any;                      // Object containing billing and shipping info.
  matchInformation: boolean;          // If true, billing and shipping are the same.
  stateListUS: any[];                 // Lookup table of US states.
  provinceListCanada: any[];          // Lookup table of Canadian provinces.
  billingForm: FormGroup;             // Billing info form object.
  shippingForm: FormGroup;            // Shipping info form object.
  submitAttempt: boolean;             // Returns true if an attempt to submit forms is made.
  shippingInfoRequired: boolean;      // Tracks if shipping info is to be collected.
  sequenceNumber: string;             // Contains a unique identifier string for selected customer.
  creatingNewCustomer: boolean;       // Set true if we're creating a new customer.
  originalPrimaryPhone: string;       // Contains original primary phone number.
  submitFlag: boolean;                // Set true when we're submitting an order.
  storeTypeHeader: string;            // Displays the type of store location.
  invalidAreaCode: boolean;           // Set true if an invalid area code is submitted.
  mappedCustomerErrors: any[];        // Array containing any customer info form errors.
  mappedDeliveryErrors: any[];        // Array containing any delivery form errors.
  incomingSelectedCustomer: boolean;  // Set true if we have selected a customer from our search.

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private formBuilder: FormBuilder,
    private popoverCtrl: PopoverController,
    private api: ApiProvider,
    private numberManipulator: NumberManipulatorProvider,
    private stateList: StateListProvider,
    private modalCtrl: ModalController,
    private storage: StorageProvider,
    private viewCtrl: ViewController,
    private errorMap: ErrorMapperProvider,
    private systemWarnings: SystemWarningsProvider,
    private alertCtrl: AlertController
  ) {
    this.customer = {
      billing: {},
      shipping: {}
    };
    this.matchInformation = false;
    this.stateListUS = this.stateList.stateListUS;
    this.provinceListCanada = this.stateList.provinceListCanada;
    this.submitAttempt = false;
    this.shippingInfoRequired = false;
    this.sequenceNumber = '';
    this.creatingNewCustomer = false;
    this.submitFlag = false;
    this.displayedInModal = false;
    this.invalidAreaCode = false;
    this.mappedCustomerErrors = [];
    this.mappedDeliveryErrors = [];
    this.incomingSelectedCustomer = false;

    // This is our unique customer ID.
    this.sequenceNumber = '';

    // Create our customer info form and apply validators.
    this.billingForm = this.formBuilder.group({
      'phone': ['', [PhoneValidator.isValid, Validators.required]],
      'first_name': ['', Validators.required],
      'last_name': ['', Validators.required],
      'street': ['', Validators.required],
      'secondary_street': [''],
      'city': [''],
      'state': [''],
      'zip': ['', Validators.required],
      'work_phone': ['', PhoneValidator.isValid],
      'work_ext': [''],
      'cell_phone': ['', PhoneValidator.isValid],
      'tax_exempt_id': [''],
      'guest_email': ['', EmailValidator.isValid],
    });

    // Create our delivery form and apply validators.
    this.shippingForm = this.formBuilder.group({
      'home_phone': ['', [PhoneValidator.isValid, Validators.required]],
      'first_name': ['', Validators.required],
      'last_name': ['', Validators.required],
      'street': ['', Validators.required],
      'secondary_street': [''],
      'city': [''],
      'state': [''],
      'zip': ['', Validators.required],
      'work_phone': ['', PhoneValidator.isValid],
      'work_ext': [''],
      'cell_phone': ['', PhoneValidator.isValid],
      'contact_method': ['', Validators.required],
      'cross_streets': ['', Validators.required],
    });
  }

  ionViewWillEnter() {
    try {
      if (this.viewCtrl.data.modalView) {
        this.displayedInModal = this.viewCtrl.data.modalView;
      } else {
        this.displayedInModal = false;
      }
    } catch (err) {
      this.displayedInModal = false;
    }
    this.loadPage();
  }

  ionViewDidEnter() {
    this.storage.returnStoreType().then((storeType: string) => {
      this.storeTypeHeader = storeType === 'R' ? 'Retail' : 'Outlet';
    });

    if (!this.incomingSelectedCustomer) {
      this.queryAppendedCustomerInfo().then(() => {
        this.updateBillingInfo();
        this.updateShippingInfo();
        this.checkInfoMatch();
      });
    }
  }

  ionViewWillLeave() {
    if (!this.submitFlag && !this.displayedInModal) {
      this.api.linkCustomerInformation(this.customer.billing).then((response: any) => {
        // Handle response.
      }).catch((response: any) => {
        // Handle response.
      });
    }
  }

  loadPage() {
    return new Promise((resolve) => {
      console.log(this.navParams.data);

      if (this.submitFlag) {
        this.submitFlag = false;
      } else {
        this.incomingSelectedCustomer = false;

        if (Object.keys(this.navParams.data).length && ('customer' in this.navParams.data)) {
          // Set a flag so we don't query blank customer info.
          this.incomingSelectedCustomer = true;

          this.customer.billing = JSON.parse(JSON.stringify(this.navParams.data.customer));
          // This is our unique customer ID.
          this.sequenceNumber = this.customer.billing.GSSEQNUMBER;

          // Save our original primary phone number.
          this.originalPrimaryPhone = this.customer.billing.GSHOMEPHONE.trim();

          // Update billing info from selected customer.
          this.billingForm.patchValue({
            'phone': this.numberManipulator.returnPhone(this.customer.billing.GSHOMEPHONE),
            'first_name': this.customer.billing.GSFIRSTNAME,
            'last_name': this.customer.billing.GSLASTNAME,
            'street': this.customer.billing.GSADR + ' ' + this.customer.billing.GSADDRESS,
            'secondary_street': this.customer.billing.GSAPT,
            'city': this.customer.billing.GSCITY,
            'state': this.customer.billing.GSSTATE,
            'zip': this.customer.billing.GSZIPCODE,
            'work_phone': this.numberManipulator.returnPhone(this.customer.billing.WORKPHONE == '0' ? '' : this.customer.billing.WORKPHONE),
            'work_ext': this.customer.billing.GSWORKEXT == '0' ? '' : this.customer.billing.GSWORKEXT,
            'cell_phone': this.numberManipulator.returnPhone(this.customer.billing.GSCELLPHONE == '0' ? '' : this.customer.billing.GSCELLPHONE),
            'tax_exempt_id': this.customer.billing.GSTAXEXEMPT == '0' ? '' : this.customer.billing.GSTAXEXEMPT,
            'guest_email': this.customer.billing.GSEMAIL === 'no@artvan.com' ? '' : this.customer.billing.GSEMAIL.toLowerCase()
          });
          // Format everything.
          this.updateBillingInfo();
          this.updateShippingInfo();
          this.checkInfoMatch();
        } else if (!Object.keys(this.navParams.data).length || 'modalView' in this.navParams.data) {
          this.queryAppendedCustomerInfo().then(() => {
            // Format everything.
            this.updateBillingInfo();
            this.updateShippingInfo();
            this.checkInfoMatch();
          });
        } else {
          try {
            const newCustomer = this.navParams.data;

            if (newCustomer.newCustomer) {
              this.incomingSelectedCustomer = true;
              if (newCustomer.primaryPhone.length == 10) {
                this.billingForm.patchValue({
                  "phone": this.numberManipulator.returnPhone(newCustomer.primaryPhone)
                });
              }
            }
          } catch (err) { }
        }

        // Check if we'll be collecting delivery details.
        this.api.checkDetailsRequired().then((orderDetails: any) => {
          if (orderDetails.cpuFlag === 'Y' || orderDetails.dlvFlag === 'Y') {
            this.shippingInfoRequired = true;
          }
          resolve();
        }).catch((response: any) => {
          resolve();
        });
      }
    });
  }

  queryAppendedCustomerInfo() {
    return new Promise((resolve) => {
      this.api.returnCustomerInfoDeliveryDetails().then((details: any) => {
        console.log(details)
        // Map previously-saved billing information.
        this.billingForm.patchValue({
          "phone": Number(details.MASTERPOSRECORD.XMHPHN.trim()) > 0 ? details.MASTERPOSRECORD.XMHPHN.trim().toUpperCase() : '',
          "first_name": details.MASTERPOSRECORD.XMFNAM.trim().toUpperCase(),
          "last_name": details.MASTERPOSRECORD.XMLNAM.trim().toUpperCase(),
          "street": details.MASTERPOSRECORD.XMADR.trim() + ' ' + details.MASTERPOSRECORD.XMADDR.trim().toUpperCase(),
          "secondary_street": '',
          "city": details.MASTERPOSRECORD.XMCITY.trim().toUpperCase(),
          "state": details.MASTERPOSRECORD.XMST.trim().toUpperCase(),
          "zip": details.MASTERPOSRECORD.XMZIP.trim().toUpperCase(),
          "work_phone": Number(details.MASTERPOSRECORD.XMWPHN.trim()) > 0 ? details.MASTERPOSRECORD.XMWPHN.trim().toUpperCase() : '',
          "work_ext": Number(details.MASTERPOSRECORD.XMEXT.trim()) > 0 ? details.MASTERPOSRECORD.XMEXT.trim().toUpperCase() : '',
          "cell_phone": Number(details.MASTERPOSRECORD.XMCPHN.trim()) > 0 ? details.MASTERPOSRECORD.XMCPHN.trim().toUpperCase() : '',
          "tax_exempt_id": details.MASTERPOSRECORD.XMTXID.trim() == '0' ? '' : details.MASTERPOSRECORD.XMTXID.trim().toUpperCase(),
          "guest_email": details.MASTERPOSRECORD.XMMAIL.trim().toUpperCase()
        });
        // Map previously-saved delivery information.
        this.shippingForm.patchValue({
          "home_phone": Number(details.DELIVERYINST.homPhn.trim()) > 0 ? details.DELIVERYINST.homPhn.trim().toUpperCase() : '',
          "first_name": details.DELIVERYINST.fstName.trim().toUpperCase(),
          "last_name": details.DELIVERYINST.lstName.trim().toUpperCase(),
          "street": details.DELIVERYINST.addrNum + ' ' + details.DELIVERYINST.addr.trim().toUpperCase(),
          "secondary_street": '',
          "city": details.DELIVERYINST.city.trim().toUpperCase(),
          "state": details.DELIVERYINST.state.trim().toUpperCase(),
          "zip": details.DELIVERYINST.zipCode.trim().toUpperCase(),
          "work_phone": Number(details.DELIVERYINST.wrkPhn.trim()) > 0 ? details.DELIVERYINST.wrkPhn.trim().toUpperCase() : '',
          "work_ext": Number(details.DELIVERYINST.wrkExt.trim()) > 0 ? details.DELIVERYINST.wrkExt.trim().toUpperCase() : '',
          "cell_phone": Number(details.DELIVERYINST.celPhn.trim()) > 0 ? details.DELIVERYINST.celPhn.trim().toUpperCase() : '',
          "contact_method": details.DELIVERYINST.bestCont.trim().toUpperCase(),
          "cross_streets": details.DELIVERYINST.crossStreets.toUpperCase()
        });

        console.log(this.billingForm.value)

        resolve();
      }).catch((response: any) => {
        // Handle response.
        resolve();
      });
    });
  }

  updateBillingInfo() {
    this.billingForm.patchValue({
      'phone': this.numberManipulator.returnPhone(this.billingForm.value.phone),
      'first_name': this.billingForm.value.first_name,
      'last_name': this.billingForm.value.last_name,
      'street': this.billingForm.value.street,
      'secondary_street': this.billingForm.value.secondary_street,
      'city': this.billingForm.value.city,
      'state': this.billingForm.value.state,
      'zip': this.billingForm.value.zip,
      'work_phone': this.numberManipulator.returnPhone(this.billingForm.value.work_phone),
      'work_ext': this.numberManipulator.returnWholeNumber(this.billingForm.value.work_ext),
      'cell_phone': this.numberManipulator.returnPhone(this.billingForm.value.cell_phone),
      'tax_exempt_id': this.billingForm.value.tax_exempt_id,
      'guest_email': this.billingForm.value.guest_email
    });
    if (this.matchInformation) {
      this.shippingInfoMatch();
    }
  }

  updateShippingInfo() {
    this.shippingForm.patchValue({
      'home_phone': this.numberManipulator.returnPhone(this.shippingForm.value.home_phone),
      'first_name': this.shippingForm.value.first_name,
      'last_name': this.shippingForm.value.last_name,
      'street': this.shippingForm.value.street,
      'secondary_street': this.shippingForm.value.secondary_street,
      'city': this.shippingForm.value.city,
      'state': this.shippingForm.value.state,
      'zip': this.shippingForm.value.zip,
      'work_phone': this.numberManipulator.returnPhone(this.shippingForm.value.work_phone),
      'work_ext': this.numberManipulator.returnWholeNumber(this.shippingForm.value.work_ext),
      'cell_phone': this.numberManipulator.returnPhone(this.shippingForm.value.cell_phone),
      "contact_method": this.shippingForm.value.contact_method,
      "cross_streets": this.shippingForm.value.cross_streets
    });
  }

  /**
   * Check if we have matching billing/shipping.
  */
  checkInfoMatch() {
    const tempBillingForm = JSON.parse(JSON.stringify(this.billingForm.value)),
      tempShippingForm = JSON.parse(JSON.stringify(this.shippingForm.value));

    if ((tempBillingForm.cell_phone === tempShippingForm.cell_phone)
      && (tempBillingForm.city === tempShippingForm.city)
      && (tempBillingForm.first_name === tempShippingForm.first_name)
      && (tempBillingForm.last_name === tempShippingForm.last_name)
      && (tempBillingForm.phone === tempShippingForm.home_phone)
      && (tempBillingForm.secondary_street === tempShippingForm.secondary_street)
      && (tempBillingForm.state === tempShippingForm.state)
      && (tempBillingForm.street === tempShippingForm.street)
      && (tempBillingForm.work_ext === tempShippingForm.work_ext)
      && (tempBillingForm.work_phone === tempShippingForm.work_phone)
      && (tempBillingForm.zip === tempShippingForm.zip)) {
      this.matchInformation = true;
    }
  }

  /**
 * If a customer wants to use their account information
 * for their delivery information, we simply copy it over
 * and submit it all in the end. It will remain linked
 * unless they modify delivery information.
 */
  shippingInfoMatch() {
    if (this.matchInformation) {
      this.shippingForm.patchValue({
        'first_name': this.billingForm.value.first_name,
        'last_name': this.billingForm.value.last_name,
        'street': this.billingForm.value.street,
        'secondary_street': this.billingForm.value.secondary_street,
        'city': this.billingForm.value.city,
        'state': this.billingForm.value.state,
        'zip': this.billingForm.value.zip,
        'home_phone': this.billingForm.value.phone,
        'work_phone': this.billingForm.value.work_phone,
        'work_ext': this.billingForm.value.work_ext,
        'cell_phone': this.billingForm.value.cell_phone,
      });
    }
  }

  /**
   * If the user edits the delivery information,
   * it will unlink from the customer account
   * information.
   */
  unmatchInformation() {
    this.matchInformation = false;
  }

  /**
   * Display our function options
   * for this page.
   */
  presentPopover(event) {
    let functionsPopover = this.popoverCtrl.create(FunctionsPopoverComponent, [
      'logout',
      'special-instructions',
      'add-associates',
      'save-order',
      'delete-order',
      'search-customer'
    ]);
    functionsPopover.present({
      ev: event
    });
    functionsPopover.onDidDismiss((data) => {
      if (data == 'search-customer') {
        this.navCtrl.push(CustomerSearchPage).then(() => {
          this.navCtrl.remove(this.navCtrl.getActive().index - 1);
        });
      }
    })
  }

  /**
   * If permitted, proceed to
   * next page.
   */
  nextPage() {
    let billingInfo: any = {},
      shippingInfo: any = {};

    this.submitAttempt = true;
    this.invalidAreaCode = false;
    this.mappedCustomerErrors = [];
    this.mappedDeliveryErrors = [];

    if (this.billingForm.valid && (this.shippingForm.valid || !this.shippingInfoRequired)) {

      // Convert all key values to uppercase.
      for (let i in this.billingForm.value) {
        billingInfo[i] = this.billingForm.value[i] !== null ? this.billingForm.value[i].toUpperCase().trim() : '';
      }

      // Format specific key values as numbers.
      billingInfo.phone = this.numberManipulator.returnWholeNumber(billingInfo.phone);
      billingInfo.work_phone = this.numberManipulator.returnWholeNumber(billingInfo.work_phone);
      billingInfo.work_ext = this.numberManipulator.returnWholeNumber(billingInfo.work_ext);
      billingInfo.cell_phone = this.numberManipulator.returnWholeNumber(billingInfo.cell_phone);

      // Pass 'none' to AS/400 if email is left blank.
      billingInfo.guest_email = billingInfo.guest_email == '' ? 'NONE' : billingInfo.guest_email;

      // Add in our sequence number.
      billingInfo['sequence'] = this.sequenceNumber;

      // Flag if primary phone has changed because we have to update it on its own.
      billingInfo['updatePrimaryPhone'] = this.originalPrimaryPhone != billingInfo.phone;

      // Convert all key values to uppercase.
      for (let i in this.shippingForm.value) {
        shippingInfo[i] = this.shippingForm.value[i] !== null ? this.shippingForm.value[i].toUpperCase().trim() : '';
      }

      // Format specific key values as numbers.
      shippingInfo.home_phone = this.numberManipulator.returnWholeNumber(shippingInfo.home_phone);
      shippingInfo.work_phone = this.numberManipulator.returnWholeNumber(shippingInfo.work_phone);
      shippingInfo.work_ext = this.numberManipulator.returnWholeNumber(shippingInfo.work_ext);
      shippingInfo.cell_phone = this.numberManipulator.returnWholeNumber(shippingInfo.cell_phone);

      this.api.submitCustomerInfoDeliveryDetails({
        customer: billingInfo,
        delivery: shippingInfo
      }).then((response: any) => {
        if (response.errCode !== undefined ? response.errCode.trim() == '500' : false) {
          this.invalidAreaCode = true;
          this.systemWarnings.returnedError('Please review the page for errors.')
        } else if (response.errCode !== undefined ? response.errCode.trim() == '501' : false) {
          this.mappedCustomerErrors = this.errorMap.mapErrors(response.errind, response.message);
          this.systemWarnings.returnedError('Please review the page for errors.');
        } else if ('delivery' in response) {
          // Check if there are any delivery info errors.
          if (response.delivery.Sc_errmsg[0].length) {
            let correctedErrorIndex = [];

            // For some reson we're getting an object instead of an array.
            (<any>Object).values(response.delivery.Sc_errind).forEach((errorFlag: any) => {
              correctedErrorIndex.push(errorFlag.Sc_errind_0);
            });
            this.mappedDeliveryErrors = this.errorMap.mapErrors(correctedErrorIndex, response.delivery.Sc_errmsg);
            this.systemWarnings.returnedError('Please review the page for errors.');
          } else {
            this.checkManagerApprovalRequired(response);
          }
        } else if ('multipleCities' in response) {
          new Promise((resolve, reject) => {
            if ('customer' in response.multipleCities) {
              this.promptResolveCity(response.multipleCities.customer).then((info: any) => {
                this.billingForm.patchValue({ city: info.city.toUpperCase() });
                this.billingForm.patchValue({ state: info.state.toUpperCase() });

                // If billing and shipping info are the same, just update it here to prevent double prompts.
                if (this.matchInformation) {
                  this.shippingForm.patchValue({ city: info.city.toUpperCase() });
                  this.shippingForm.patchValue({ state: info.state.toUpperCase() });
                  reject();
                }
                resolve();
              }).catch(() => {
                resolve();
              });
            } else {
              resolve();
            }
          }).then(() => {
            if ('delivery' in response.multipleCities) {
              this.promptResolveCity(response.multipleCities.delivery).then((info: any) => {
                this.shippingForm.patchValue({ city: info.city.toUpperCase() });
                this.shippingForm.patchValue({ state: info.state.toUpperCase() });
              }).catch(() => { });
            }
          }).catch(() => { });
        } else if (response.error) {
          if ('customer' in response.error) {
            this.mappedCustomerErrors[3] = response.error.customer.message.trim();
          }
          if ('delivery' in response.error) {
            this.mappedDeliveryErrors[3] = response.error.delivery.message.trim();
          }
        } else if ('managerapprovallines' in response) {
          this.checkManagerApprovalRequired(response);
        } else {
          this.proceed();
        }
      }).catch((response: any) => {
        // Handle response.
      });
    } else {
      this.systemWarnings.returnedError('Please review the page for errors.');
    }
  }

  checkManagerApprovalRequired(response: any) {
    if ('managerapprovallines' in response) {
      delete response.managerapprovallines.Sc_errmsg;
      delete response.managerapprovallines.retVal;
      if (Object.keys(response.managerapprovallines).length) {
        let managerPromotionModal = this.modalCtrl.create(ManagerPromotionComponent, {
          approvalLines: response.managerapprovallines,
          promotionCodes: response.managerpromolines
        });

        managerPromotionModal.present();
        managerPromotionModal.onDidDismiss((success: boolean) => {
          if (success) {
            this.proceed();
          }
        });
      } else {
        this.proceed();
      }
    }
  }

  /**
  * A zip code has mapped to two or
  * more cities, so the user needs
  * to resolve it.
  */
  promptResolveCity(cityList: any) {
    let cityPrompt,
      mappedInputs = [];

    cityList.forEach((info) => {
      mappedInputs.push({
        type: 'radio',
        label: `${info.CZCITY.trim()}, ${info.CZSTATE.trim()}`,
        value: { city: info.CZCITY.trim(), state: info.CZSTATE.trim() }
      });
    });

    return new Promise((resolve, reject) => {
      cityPrompt = this.alertCtrl.create({
        title: 'Select City',
        message: 'More than one city was returned for the zip code.',
        inputs: mappedInputs,
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              reject();
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

  private proceed() {
    if (this.displayedInModal) {
      this.viewCtrl.dismiss();
    } else {
      this.queryAppendedCustomerInfo().then(() => {
        // Format everything.
        this.updateBillingInfo();
        this.updateShippingInfo();
        this.checkInfoMatch();
        this.submitFlag = true;
        this.navCtrl.push(TenderMethodsPage);
      });
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
