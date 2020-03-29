import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, PopoverController, Events } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { InvoiceTotalPage } from '../invoice-total/invoice-total';

import { FunctionsPopoverComponent } from '../../components/functions-popover/functions-popover';
import { OrderDetailsComponent } from '../../components/order-details/order-details';
import { GroupPricingComponent } from '../../components/group-pricing/group-pricing';
import { InventoryMasterSearchComponent } from '../../components/inventory-master-search/inventory-master-search';
import { ComfortProtectionProgramComponent } from '../../components/comfort-protection-program/comfort-protection-program';
import { SpecialOrderComponent } from '../../components/special-order/special-order';
import { ProtectionPlanPromptComponent } from '../../components/protection-plan-prompt/protection-plan-prompt';

import { NumberManipulatorProvider } from '../../providers/number-manipulator/number-manipulator';
import { SpecialCodesProvider } from '../../providers/special-codes/special-codes';
import { ApiProvider } from '../../providers/api/api';
import { StorageProvider } from '../../providers/storage/storage';
import { ErrorMapperProvider } from '../../providers/error-mapper/error-mapper';

import * as Constants from '../../providers/config';

@IonicPage()
@Component({
  selector: 'page-new-ticket',
  templateUrl: 'new-ticket.html',
})
export class NewTicketPage {

  cartList: any[];                    // Array containing cart item objects.
  transactionTypes: any[];            // Array of available transaction types
  floorCodes: any[];                  // Array of available floor codes.
  specialCodes: any[];                // Array of special codes, retrived when "query" is pressed.
  addItemForm: FormGroup;             // Form validation for the add item form.
  proceedStatus: boolean;             // Flag set to true when checks allow procession to next page.
  widgetCollapsed: boolean;           // Flag used to control the state of the add item form.
  inputErrors: any;                   // Object containing any mapped returned errors.
  showProtection: boolean;            // Flag set true is protection is offered on the current item.
  storeTypeHeader: string;            // Displays the type of store location.
  specialOrderTemplateInfo: any;      // A copy of special order info in case we need to revert.

  constructor(
    private navCtrl: NavController,
    private numberManipulator: NumberManipulatorProvider,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private codes: SpecialCodesProvider,
    private events: Events,
    private formBuilder: FormBuilder,
    private api: ApiProvider,
    private storage: StorageProvider,
    private errorMap: ErrorMapperProvider
  ) {
    this.proceedStatus = false;
    this.widgetCollapsed = false;
    this.cartList = [];
    this.showProtection = true;

    this.addItemForm = this.formBuilder.group({
      transType: ['', Validators.required],
      qty: [''],
      vendor: ['', Validators.required],
      model: ['', Validators.required],
      floorCode: [null],
      protection: [{ value: false, disabled: !this.showProtection }],
      specialCode: [null],
      price: ['']
    });

    this.inputErrors = [];
    this.specialOrderTemplateInfo = {};
  }

  ionViewDidLoad() {
    // Populate any required codes on page load.
    this.codes.queryCodes().then((codes: any) => {
      this.transactionTypes = codes.transactionTypes;
      this.floorCodes = codes.floorCodes;
    });
  }

  ionViewWillEnter() {
    // Update our cart list based on changes.
    this.events.subscribe(Constants.EVENT_CART_UPDATE, () => {
      // Only make a call if we have an open ticket i.e. transaction ID.
      this.api.returnCartItems().then((itemList: any) => {
        if (itemList.items.length) {
          this.cartList = [...itemList.items];
          this.proceedStatus = true;
        } else {
          this.cartList = [];
          this.proceedStatus = false;
        }
      }).catch(() => {
        this.cartList = [];
        this.proceedStatus = false;
      });
    });

    // If we have a valid transaction ID, check for cart updates.
    this.storage.returnTransactionID().then((transactionID: string) => {
      if (transactionID.length) {
        this.events.publish(Constants.EVENT_CART_UPDATE);
      }
    }).catch((response: any) => {
      // Handle response.
    });
    this.clearForm();
  }

  ionViewDidEnter() {
    // Update our header with the store type.
    this.storage.returnStoreType().then((storeType: string) => {
      this.storeTypeHeader = storeType === 'R' ? 'Retail' : 'Outlet';
    });
  }

  ionViewWillLeave() {
    // Destroy events when leaving page.
    this.events.unsubscribe(Constants.EVENT_CART_UPDATE);
  }

  ionViewWillUnload() {
    // Probably not needed, but let's be certain.
    this.events.unsubscribe(Constants.EVENT_CART_UPDATE);
  }

  /**
   * Open our inventory master search
   * component and pass any relevant data.
   */
  masterSearch() {
    let searchModal = this.modalCtrl.create(InventoryMasterSearchComponent, {
      vendor: this.addItemForm.value.vendor,
      model: this.addItemForm.value.model
    });

    searchModal.present();
    searchModal.onDidDismiss((data) => {
      if (data) {
        this.addItemForm.value.vendor = data.IVVNDA;
        setTimeout(() => {
          this.addItemForm.value.model = data.IVMDL;
          //this.queryItem();
        }, 0);
      }
    });
  }

  /**
   * Query codes and additional information
   * about the entered item.
   */
  queryItem(clearErrors: boolean = true) {
    let query = {
      transType: this.addItemForm.value.transType === null ? '' : this.addItemForm.value.transType.toUpperCase(),
      vendor: this.addItemForm.value.vendor === null ? '' : this.addItemForm.value.vendor.trim().toUpperCase(),
      model: this.addItemForm.value.model === null ? '' : this.addItemForm.value.model.trim().toUpperCase()
    };

    // Clear any search errors on each attempt.
    if (clearErrors) {
      this.inputErrors = [];
    }

    // Check if an item is being edited.
    this.events.publish(Constants.EVENT_CART_ITEM_EDIT);

    // Check if we have a valid vendor/model, special order, or SKU.
    if ((query.vendor.length && query.model.length)
      || (query.transType === 'SO' && query.vendor.length && (!query.model.length || query.model.toUpperCase() === 'SPECIAL'))
      || ((query.vendor.length == 0 || query.vendor.toUpperCase() === 'SKU') && Number.isInteger(Number(query.model)))) {
      this.api.queryItemDetails(query).then((itemDetails: any) => {
        if ('item' in itemDetails ? itemDetails.item.retVal == '0' : itemDetails.retVal == '0') {
          // Update fields based on returned values.
          if ('item' in itemDetails) {
            this.addItemForm.value.vendor = itemDetails.item.vendor.trim().toUpperCase();
            setTimeout(() => {
              this.addItemForm.value.model = itemDetails.item.model.trim().toUpperCase();
            }, 0);
            // Check if this item has a protection plan available.
            if (itemDetails.item.showProt) {
              this.showProtection = true;
            } else {
              setTimeout(() => {
                this.addItemForm.value.protection = false;
              }, 0);
              this.showProtection = false;
            }
          }

          if (query.transType === 'SO') {
            this.specialCodes = [];

            // Delete our error message keys.
            delete itemDetails['Sc_errmsg'];
            delete itemDetails['retVal'];

            // Map our special codes.
            for (let specialCode in itemDetails) {
              this.specialCodes.push({
                val: itemDetails[specialCode]['DXTYPE'].trim(),
                desc: this.formatSpecialCodes(itemDetails[specialCode]['DXDESC'])
              });
            }
          }
        } else {
          this.inputErrors[2] = itemDetails.message;
        }
      }).catch((response: any) => {
        this.inputErrors[2] = 'Invalid Vendor';
        this.inputErrors[3] = 'Invalid Model';
      });
    } else {
      if (!query.vendor.length) {
        this.inputErrors[2] = 'Invalid Vendor';
      }
      if (!query.model.length) {
        this.inputErrors[3] = 'Invalid Model';
      }
    }
  }

  /**
   * Submit an attempted inventory
   * item to be added to cart. If
   * exists, add to cart.
   */
  addToCart(): void {
    let addItem,
      specialOrderModal;

    this.inputErrors = [];

    // Check if an item is being edited.
    this.events.publish(Constants.EVENT_CART_ITEM_EDIT);

    addItem = JSON.parse(JSON.stringify(this.addItemForm.value));

    // Clean up our item before passing it to middleware.
    try {
      addItem = {
        'transType': addItem.transType === null ? '' : addItem.transType.toUpperCase(),
        'qty': !addItem.qty ? 1 : this.numberManipulator.returnWholeNumber(addItem.qty.trim()),
        'vendor': addItem.vendor === null ? '' : addItem.vendor.trim().toUpperCase(),
        'model': addItem.model === null ? '' : addItem.model.trim().toUpperCase(),
        'floorCode': addItem.floorCode === null ? '' : addItem.floorCode.toUpperCase(),
        'protection': addItem.protection,
        'specialCode': addItem.specialCode === null ? '' : addItem.specialCode.toUpperCase(),
        'specialCodesList': this.specialCodes,
        'price': addItem.price === null ? 0 : Number(this.numberManipulator.returnDecimalNumber(addItem.price.trim())),
      }
    } catch (err) { }

    if ((addItem.transType === 'SO' && addItem.vendor.length)
      || (addItem.transType.length && addItem.vendor.length && addItem.model.length)
      || (addItem.transType.length && (addItem.vendor.length == 0 || addItem.vendor == 'SKU') && Number.isInteger(Number(addItem.model)))) {

      this.api.addCartItem(addItem).then((itemData: any) => {
        if (addItem.transType === 'SO' && itemData.retVal == '0') {
          this.buildSpecialOrderTemplate(itemData);
          specialOrderModal = this.modalCtrl.create(SpecialOrderComponent, this.specialOrderTemplateInfo);
          specialOrderModal.present();
          specialOrderModal.onDidDismiss((itemAddSuccess) => {
            if (itemAddSuccess) {
              this.clearForm();
              // Once added, query our cart list again to update.
              this.events.publish(Constants.EVENT_CART_UPDATE);
            }
          });
        } else if ('indicator' in itemData ? itemData.indicator.retVal == '0' : itemData.retVal == '0') {
          this.clearForm();
          // Once added, query our cart list again to update.
          this.events.publish(Constants.EVENT_CART_UPDATE);
        } else {
          this.inputErrors = this.errorMap.mapErrors(itemData.errInd, itemData.message);
        }
      }).catch((response: any) => {
        // Handle response.
      });
    } else if (!addItem.transType.length) {
      this.inputErrors[0] = 'Transaction Type Required';
    } else {
      this.queryItem();
    }
  }

  /**
   * This function is called to clear the add item
   * form. The setTimeout is required to correctly
   * toggle the slider. I'm not sure why this is
   * an issue.
   */
  private clearForm() {
    this.showProtection = true;
    document.getElementsByTagName('form')[0].reset();
    this.specialCodes = [];
    setTimeout(() => { this.addItemForm.value.protection = false; }, 10);
  }

  /**
   * This functions currently makes two calls to determine
   * if we need to collect order details and if we need to
   * offer a mattress satisfaction guarantee. Once evaluated,
   * it proceeds to next page, if possible.
   */
  nextPage() {
    let orderDetailsPrompt,
      comfortProtectionPrompt,
      orderDetailsRequired,
      comfortProtectionRequired,
      deliveryDateRequired = false,
      allowSameDayPickup = false;

    new Promise((resolve, reject) => {
      new Promise((resolve, reject) => {
        // Check if we need to prompt for additional details.
        this.api.checkDetailsRequired().then((orderDetails: any) => {
          // Check if we need to collect order details.
          if (orderDetails.cpuFlag === 'Y'
            || orderDetails.dlvFlag === 'Y'
            || orderDetails.dxFlag === 'Y'
            || orderDetails.bedPickup === 'Y') {
            orderDetailsRequired = true;
          }

          // Check if we don't need a delivery date and if we can show today's pickup date.
          if (orderDetailsRequired) {
            for (let item in this.cartList) {
              if (this.cartList[item].WRTYPE === 'DL') {
                deliveryDateRequired = true;
              }
              if (this.cartList[item].WRTYPE === 'CP' && this.cartList[item].WRFLR.trim().length) {
                allowSameDayPickup = true;
              }
            }
          }
          orderDetails['deliveryDateRequired'] = deliveryDateRequired;
          orderDetails['allowSameDayPickup'] = allowSameDayPickup;

          // Check if we need to offer the bedding TSG.
          if (Number(orderDetails.price) > 0) {
            comfortProtectionRequired = true;
          } else {
            comfortProtectionRequired = false;
          }
          // Move on to displaying any modals.
          resolve(orderDetails);
        }).catch(() => {
          reject();
        });
      }).then((orderDetails: any) => {
        // Offer protection plans.
        new Promise((resolve, reject) => {
          let protectionPlanModal;

          if (orderDetails.skipWarranty.toUpperCase() !== 'Y' && orderDetails.onPGM === 'Y') {
            protectionPlanModal = this.modalCtrl.create(ProtectionPlanPromptComponent);
            protectionPlanModal.present();
            protectionPlanModal.onDidDismiss((success: any) => {
              if (success) {
                resolve();
              } else {
                reject();
              }
            });
          } else {
            resolve();
          }
        }).then((acceptedPlan: boolean) => {
          // Collect order details.
          new Promise((resolve, reject) => {
            if (orderDetailsRequired) {
              // If we need to collect order details, present modal.
              orderDetailsPrompt = this.modalCtrl.create(OrderDetailsComponent, orderDetails);
              orderDetailsPrompt.present();
              orderDetailsPrompt.onDidDismiss((proceedStatus) => {
                if (proceedStatus) {
                  // We successfully collected our order details so proceed.
                  resolve(orderDetails);
                } else {
                  // The user probably just closed the modal.
                  reject();
                }
              });
            } else {
              resolve(orderDetails);
            }
          }).then((orderDetails: any) => {
            // Collect mattress protection acceptance.
            new Promise((resolve, reject) => {
              if (Object.keys(orderDetails).length) {
                resolve(orderDetails);
              } else {
                this.api.returnMattressProtectionDetails().then((orderDetails: any) => {
                  resolve(orderDetails);
                }).catch(() => {
                  reject();
                });
              }
            }).then((orderDetails: any) => {
              if (comfortProtectionRequired) {
                comfortProtectionPrompt = this.modalCtrl.create(ComfortProtectionProgramComponent, orderDetails);
                comfortProtectionPrompt.present();
                comfortProtectionPrompt.onDidDismiss((proceedStatus) => {
                  if (proceedStatus) {
                    // We successfully collected the user's response on mattress protection.
                    resolve();
                  } else {
                    // The user probably just closed the modal.
                    reject();
                  }
                });
              } else {
                // No need to collect mattress protection details so proceed.
                resolve();
              }
            }).catch(() => {
              reject();
            });
          }).catch(() => {
            reject();
          });
        }).catch(() => {
          reject();
        })
      }).catch(() => {
        reject();
      });
    }).then(() => {
      this.navCtrl.push(InvoiceTotalPage);
    }).catch(() => {
      // Handle response.
      this.events.publish(Constants.EVENT_CART_UPDATE);
    });
  }

  /**
   * Format fields. We catch errors because
   * clearing the form sets inputs = null,
   * which throws an error for string manipulation.
   */
  formatFields() {
    try {
      this.addItemForm.patchValue({ qty: this.numberManipulator.returnWholeNumberComma(this.addItemForm.value.qty) });
    } catch (err) { }
    try {
      this.addItemForm.patchValue({ price: this.numberManipulator.returnCurrency(this.addItemForm.value.price) });
    } catch (err) { }
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
    let functionsPopover,
      functionsList = [
        'logout',
        'special-instructions',
        'add-associates',
        'save-order',
        'delete-order',
        'apply-promotions',
        'group-pricing'];


    functionsPopover = this.popoverCtrl.create(FunctionsPopoverComponent, functionsList);
    functionsPopover.present({
      ev: event
    });
    functionsPopover.onDidDismiss((data) => {
      switch (data) {
        case 'group-pricing':
          this.initGroupPricing();
          break;
      }
    });
  }

  /**
   * Trigger group pricing mode.
   */
  initGroupPricing() {
    let groupPricingModal;

    groupPricingModal = this.modalCtrl.create(GroupPricingComponent);
    groupPricingModal.present();
    groupPricingModal.onDidDismiss((proceedStatus: boolean = false) => {
      if (proceedStatus) {
        this.events.publish(Constants.EVENT_CART_UPDATE);
      }
    });
  }

  /**
   *
   * @param specialCode String containing unformatted special code.
   *
   * This function converts a poorly-formatted special
   * code string into something more pleasant for
   * human consumption.
   */
  private formatSpecialCodes(specialCode: any) {
    specialCode = specialCode.trim().toLowerCase().split(' ');
    specialCode.forEach((element, index) => {
      specialCode[index] = element.slice(0, 1).toUpperCase() + element.slice(1);
    });
    return specialCode.join(' ');
  }

  /**
   *
   * @param passedParameters Response from API call containing values.
   *
   * We build a template for our special orders. This
   * information can also be used later if the order
   * is cancelled after starting to edit. On the AS/400
   * once the user begins to edit, the order is deleted
   * so we have to save a copy ourselves...
   */
  buildSpecialOrderTemplate(passedParameters: any) {
    this.specialOrderTemplateInfo = {
      vendor: passedParameters.sorder.vendor,
      vendorDescription: passedParameters.sorder.vndDsc,
      model: passedParameters.sorder.soMdl.trim(),
      specialCode: passedParameters.XDSO,
      categoryDescription: passedParameters.sorder.catDsc,
      alternateDescription: passedParameters.sorder.aDsc,
      website: passedParameters.sorder.webSite,
      price: passedParameters.XDPRICE,
      protection: passedParameters.XDFP,
      quantity: passedParameters.XDQTY,
      category: passedParameters.sorder.catDsc,
      expectedDelivery: passedParameters.sorder.eta,
      comments: passedParameters.sorder.soCom1 + passedParameters.sorder.soCom2 + passedParameters.sorder.soCom3,
      fplpNumber: (passedParameters.sorder.FPVnda.trim() + ' ' + passedParameters.sorder.FPMdl.trim()).trim(),
      lines: [
        {
          desc: passedParameters.template.line1,
          val: passedParameters.sorder.desc.trim()
        },
        {
          desc: passedParameters.template.line2,
          val: passedParameters.sorder.szCl.trim()
        },
        {
          desc: passedParameters.template.line3,
          val: passedParameters.sorder.aDsc.trim()
        },
        {
          desc: passedParameters.template.line4,
          val: passedParameters.sorder.text1.trim()
        },
        {
          desc: passedParameters.template.line5,
          val: passedParameters.sorder.text2.trim()
        },
        {
          desc: passedParameters.template.line6,
          val: passedParameters.sorder.text3.trim()
        },
        {
          desc: passedParameters.template.line7,
          val: passedParameters.sorder.text4.trim()
        }
      ]
    };
  }
}
