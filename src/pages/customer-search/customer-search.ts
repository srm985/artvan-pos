import { Component } from '@angular/core';
import { IonicPage, NavController, PopoverController, AlertController } from 'ionic-angular';

import { CustomerInformationPage } from '../customer-information/customer-information';

import { FunctionsPopoverComponent } from '../../components/functions-popover/functions-popover';

import { NumberManipulatorProvider } from '../../providers/number-manipulator/number-manipulator';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage()
@Component({
  selector: 'page-customer-search',
  templateUrl: 'customer-search.html',
})
export class CustomerSearchPage {

  search: any;                  // Object containing search form data.
  customerSearchList: any[];    // Array of customer objects returned from search.
  customerSelected: any;        // Object storing the selected customer information.
  proceedStatus: boolean;       // Set true when acceptable to proceed to next page.
  widgetCollapsed: boolean;     // Set true when our search form is collapsed.
  storeTypeHeader: string;      // Displays the type of store location.

  constructor(
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private numberManipulator: NumberManipulatorProvider,
    private alertCtrl: AlertController,
    private api: ApiProvider,
    private storage: StorageProvider
  ) {
    this.search = {
      phone: '',
      firstName: '',
      lastName: ''
    };
    this.proceedStatus = false;
  }

  ionViewDidEnter() {
    this.storage.returnStoreType().then((storeType: string) => {
      this.storeTypeHeader = storeType === 'R' ? 'Retail' : 'Outlet';
    });
  }

  /**
   * Pass our customer search info to the
   * API and return a list of matching customers
   * or prompt to create a new account.
   */
  customerSearch() {
    let customerInfo = {
      phone: this.search.phone.trim() === '' ? null : this.numberManipulator.returnWholeNumber(this.search.phone.trim()),
      firstName: this.search.firstName.trim() === '' ? null : this.search.firstName.trim().toLowerCase(),
      lastName: this.search.lastName.trim() === '' ? null : this.search.lastName.trim().toLowerCase()
    };

    this.api.searchCustomer(customerInfo).then((customerList: any) => {
      if (Object.keys(customerList).length) {
        this.customerSearchList = (<any>Object).values(JSON.parse(JSON.stringify(customerList)));
        this.customerSearchList.forEach((customer, index) => {
          try {
            this.customerSearchList[index].name = customer.GSFIRSTNAME.trim().toUpperCase() + ' ' + customer.GSLASTNAME.trim().toUpperCase();
            this.customerSearchList[index].address = customer['GSADR#'].trim() + ' ' + customer.GSADDRESS.trim().toUpperCase();
            this.customerSearchList[index].apartment = customer.GSAPT.trim().toUpperCase();
            this.customerSearchList[index].city = customer.GSCITY.trim().toUpperCase();
            this.customerSearchList[index].state = customer.GSSTATE.trim().toUpperCase();
            this.customerSearchList[index].zip = customer.GSZIPCODE.trim();
            this.customerSearchList[index].primaryPhone = this.numberManipulator.returnPhone(customer.GSHOMEPHONE);

          } catch (err) { }
        });

        console.log(this.customerSearchList)
      } else {
        this.customerSearchList = [];
        this.createNewCustomerPrompt();
      }
    }).catch((response: any) => {
      // Handle response.
      this.customerSearchList = [];
    });
  }

  /**
   * If no matching customers have been found,
   * prompt user to create new account.
   */
  createNewCustomerPrompt() {
    let alert = this.alertCtrl.create({
      title: 'No Customer Found',
      message: 'Would you like to create a new customer entry?',
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Create',
          handler: () => {
            this.nextPage(true);
          }
        }
      ]
    });
    alert.present();
  }

  /**
   * This function handles the selection of a customer
   * from the list. If a selected customer is clicked
   * again, they are unselected. It then enables the user
   * to proceed to the next page.
   *
   * @param customer Index location of the selected customer.
   */
  selectCustomer(customer) {
    this.customerSelected = this.customerSelected != customer ? customer : null;
    this.proceedStatus = this.customerSelected !== null ? true : false;
  }

  /**
    * Control the action of our search widget.
    */
  toggleCollapse() {
    this.widgetCollapsed = !this.widgetCollapsed;
  }

  /**
   * Load our popover when page
   * functions and present.
   */
  presentPopover(event) {
    let functionsPopover = this.popoverCtrl.create(FunctionsPopoverComponent, [
      'logout',
      'special-instructions',
      'add-associates',
      'save-order',
      'delete-order'
    ]);
    functionsPopover.present({
      ev: event
    });
  }

  /**
   * This function is responsible for formatting
   * our phone number as we type.
   */
  structurePhone() {
    this.search.phone = this.numberManipulator.returnPhone(this.search.phone);
  }

  /**
   * This function first checks to see if we've selected
   * a customer. If we have, it passes that data along
   * to the next screen. Otherwise, we create a new customer.
   *
   * @param newCustomer Set true if creating a new customer.
   */
  nextPage(createNewCustomer: boolean = false) {
    let customerInfo,
      primaryPhone;

    if (!createNewCustomer) {
      customerInfo = {
        customer: this.customerSearchList[this.customerSelected],
        newCustomer: false
      }
    } else {
      primaryPhone = this.numberManipulator.returnWholeNumber(this.search.phone).length == 10 ? this.numberManipulator.returnWholeNumber(this.search.phone) : '';

      customerInfo = {
        newCustomer: true,
        primaryPhone: primaryPhone
      }
    }
    this.navCtrl.push(CustomerInformationPage, customerInfo).then(() => {
      this.navCtrl.remove(this.navCtrl.getActive().index - 1);
    });
  }
}
