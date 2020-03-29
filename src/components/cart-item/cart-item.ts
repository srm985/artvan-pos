import { Component, Input } from '@angular/core';
import { AlertController, Events, ModalController } from 'ionic-angular';

import { SpecialOrderComponent } from '../special-order/special-order';

import { ApiProvider } from '../../providers/api/api';
import { NumberManipulatorProvider } from '../../providers/number-manipulator/number-manipulator';
import { SpecialCodesProvider } from '../../providers/special-codes/special-codes';
import { SystemWarningsProvider } from '../../providers/system-warnings/system-warnings';

import * as Constants from '../../providers/config';

@Component({
  selector: 'cart-item',
  templateUrl: 'cart-item.html'
})
export class CartItemComponent {
  @Input() rawCartItem: any;

  cartItem: any;                      // Mapped object containing cart item info.
  editCartItem: boolean;              // Set true when editing a cart item.
  transactionTypes: any[];            // Array containing transaction types.
  floorCodes: any[];                  // Array containing floor codes.
  specialCodes: any;                  // Array containing special codes.
  transactionTypesLookup: any;        // Reverse lookup for transaction types.
  floorCodesLookup: any;              // Reverse lookup for floor codes.
  specialCodesLookup: any;            // Reverse lookup for special codes.
  tempItem: any;                      // Object storing a temporary reference of item values while editing.
  totalPrice: number;                 // Calculated and prettified total price.
  specialOrderTemplateInfo: any;      // A copy of special order info in case we need to revert.
  editingSpecialOrder: boolean;       // Set true if we have begun the edit process on a special order.

  constructor(
    private alertCtrl: AlertController,
    private numberManipulator: NumberManipulatorProvider,
    private codes: SpecialCodesProvider,
    private events: Events,
    private systemWarnings: SystemWarningsProvider,
    private api: ApiProvider,
    private modalCtrl: ModalController
  ) {
    this.editCartItem = false;
    this.transactionTypes = [];
    this.floorCodes = [];
    this.specialCodes = [];
    this.transactionTypesLookup = {};
    this.floorCodesLookup = {};
    this.specialCodesLookup = {};
    this.specialOrderTemplateInfo = {};
    this.editingSpecialOrder = false;

    this.cartItem = {
      'transType': '',
      'qty': '',
      'availableQty': '',
      'vendor': '',
      'model': '',
      'desc': '',
      'floorCode': '',
      'protection': '',
      'specialCode': '',
      'price': '',
      'lineNumber': '',
      'group': '',
      'promotion_1': '',
      'promotion_2': '',
      'imageURL': ''
    };
  }

  ngOnInit() {
    this.cartItem = {
      'transType': this.rawCartItem.WRTYPE === undefined ? '' : this.rawCartItem.WRTYPE.trim(),
      'qty': this.rawCartItem.WRQTY === undefined ? '' : this.rawCartItem.WRQTY.trim(),
      'availableQty': this.rawCartItem.WRQOH === undefined ? '' : this.rawCartItem.WRQOH.trim(),
      'vendor': this.rawCartItem.WRVNDA === undefined ? '' : this.rawCartItem.WRVNDA.trim(),
      'model': this.rawCartItem.WRMDL === undefined ? '' : this.rawCartItem.WRMDL.trim(),
      'desc': this.rawCartItem.WRDESC === undefined ? '' : this.rawCartItem.WRTYPE === 'SO' ? 'Special Order Item' : this.rawCartItem.WRDESC.trim(),
      'floorCode': this.rawCartItem.WRFLR === undefined ? '' : this.rawCartItem.WRFLR.trim(),
      'protection': this.rawCartItem.WRFP === 'Y' ? true : false,
      'specialCode': this.rawCartItem.WRSO === undefined ? '' : this.rawCartItem.WRSO.trim(),
      'price': this.rawCartItem.WRPRICE === undefined ? '' : this.rawCartItem.WRPRICE.trim(),
      'lineNumber': this.rawCartItem.WRLINE === undefined ? '' : this.rawCartItem.WRLINE.trim(),
      'group': Number(this.rawCartItem.WRGRP) > 0 ? this.rawCartItem.WRGRP.trim() : '',
      'promotion_1': this.rawCartItem.WRPROMODSC1 === undefined ? '' : this.rawCartItem.WRPROMODSC1.trim(),
      'promotion_2': this.rawCartItem.WRPROMODSC2 === undefined ? '' : this.rawCartItem.WRPROMODSC2.trim(),
      'imageURL': this.rawCartItem.imageUrl.length ? `https://mpos.artvan.com/images/eimages/${this.rawCartItem.imageUrl}` : `/assets/imgs/logo.png`
    }

    // We check to see if the image exists asynchronously.
    this.imageExists(this.cartItem.imageURL);

    // If we're using a special code, look them up.
    if (this.cartItem.specialCode.length) {
      this.api.queryItemDetails(this.cartItem).then((response: any) => {
        if ('Sc_errmsg' in response) {
          delete response.Sc_errmsg;
        }
        if ('retVal' in response) {
          delete response.retVal;
        }

        this.specialCodes = [];

        (<any>Object).values(response).forEach((code: any) => {
          let tempText = code.DXDESC.trim().toLowerCase().split(' ');

          tempText.forEach((value, index) => {
            tempText[index] = value.slice(0, 1).toUpperCase() + value.slice(1);
          });
          tempText = tempText.join(' ');

          this.specialCodes.push({
            val: code.DXTYPE.trim(),
            desc: tempText
          });
        });
        this.setCodes();
      }).catch((response: any) => {
        // Handle response.
      });
    } else {
      this.setCodes();
    }
    this.calcTotal();

    this.events.subscribe(Constants.EVENT_CART_ITEM_EDIT, () => {
      this.checkEditInProgres();
    });
  }

  ngOnDestroy() {
    this.events.unsubscribe(Constants.EVENT_CART_ITEM_EDIT);
  }

  /**
   * Edit our cart item.
   */
  editItem(event) {
    this.events.publish(Constants.EVENT_CART_ITEM_EDIT);
    // TODO: On save of other item, resume editing of new item.
    this.editCartItem = true;
    this.toggleLookups();
    this.setLookups();

    // Clone our current data in case we want to revert by cancelling.
    this.tempItem = JSON.parse(JSON.stringify(this.cartItem));

    // Convert quantity and price to pretty format and re-display total.
    this.cartItem.qty = this.numberManipulator.returnWholeNumberComma(this.cartItem.qty);
    this.cartItem.price = this.numberManipulator.returnCurrencyPretty(this.cartItem.price);
    this.calcTotal();

    // Retrieve a copy of our original special order info.
    if (this.cartItem.transType === 'SO') {
      this.editingSpecialOrder = true;
      this.api.editCartItem(this.parseCartItem(this.cartItem), 'E').then((templateInfo: any) => {
        this.specialOrderTemplateInfo = this.buildSpecialOrderTemplate(templateInfo);
      }).catch((response: any) => {
        this.specialOrderTemplateInfo = {};
      });
    }
  }

  /**
   * Check if we're currently editing
   * more than one cart item.
   */
  checkEditInProgres() {
    if (this.editCartItem) {
      let editAlert = this.alertCtrl.create({
        title: 'Edit In Progress',
        message: 'You are currently editing another cart item. Would you like to save your current changes?',
        buttons: [
          {
            text: 'Discard',
            handler: () => {
              this.cancelUpdate();
            }
          },
          {
            text: 'Save',
            handler: () => {
              this.updateItem();
            }
          }
        ]
      });
      editAlert.present();
    }
  }

  /**
   * We first check to see if we're editing a special order
   * item. Because of the AS/400 structure, once a user starts
   * to edit the item, it will be deleted so the user must
   * follow through or it cannot be recovered. We save a copy
   * though to try and submit if the process is cancelled.
   */
  updateItem() {
    let specialOrderModal,
      tempItem;

    tempItem = JSON.parse(JSON.stringify(this.parseCartItem(this.cartItem)));

    this.api.editCartItem(tempItem, 'E').then((response: any) => {
      if (response.retVal == '0') {
        if ('sorder' in response) {
          specialOrderModal = this.modalCtrl.create(SpecialOrderComponent, this.buildSpecialOrderTemplate(response));
          specialOrderModal.present();
          specialOrderModal.onDidDismiss((itemAddSuccess: boolean) => {
            if (itemAddSuccess) {
              this.editingSpecialOrder = false;
              this.events.publish(Constants.EVENT_CART_UPDATE);
            }
          });
        } else {
          this.events.publish(Constants.EVENT_CART_UPDATE);
        }
      } else {
        // Just display the first message as an error prompt.
        this.systemWarnings.returnedError([...response.message].shift());
      }
    }).catch((response: any) => {
      // Handle response.
    });
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
    return {
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

  /**
   * Cancel update to cart item. We have to make a bunch of
   * insane API calls to mimic what decent UX would be like.
   * This is because the AS/400 deletes the item as soon as
   * we start editing. So for a special order, if we're cancelling
   * the edit, we first have to re-submit our original information
   * which then restores the item to the cart. Then we have to
   * re-edit the cart item to restore other details which we saved.
   * This puts us into the loop of again having to submit special
   * order details or the item will be deleted. Insane, I know...
   * but that's how someone decided to structure the back end
   * and we're stuck with it.
   */
  cancelUpdate() {
    let tempItem;

    if (this.editingSpecialOrder) {
      tempItem = JSON.parse(JSON.stringify(this.parseCartItem(this.cartItem)));

      this.api.submitSpecialOrder(this.specialOrderTemplateInfo).then(() => {
        this.api.editCartItem(tempItem, 'E').then(() => {
          this.api.submitSpecialOrder(this.specialOrderTemplateInfo).then(() => {
            this.events.publish(Constants.EVENT_CART_UPDATE);
          }).catch((response: any) => {
            this.events.publish(Constants.EVENT_CART_UPDATE);
          });
        }).catch((response: any) => {
          this.events.publish(Constants.EVENT_CART_UPDATE);
        });
      }).catch((response: any) => {
        this.events.publish(Constants.EVENT_CART_UPDATE);
      });
    } else {
      this.editingSpecialOrder = false;
      this.editCartItem = false;
      this.cartItem = JSON.parse(JSON.stringify(this.tempItem));
      this.toggleLookups();
      this.setLookups();
    }
  }

  /**
   * Remove a deleted item from
   * our cart and update.
   */
  removeItem(event) {
    let deleteAlert = this.alertCtrl.create({
      title: 'Delete Item',
      message: 'Do you want to delete this item?',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.callDeleteItem();
          }
        }
      ]
    });
    deleteAlert.present();
  }

  /**
   * Make our call to API to delete
   * our cart item.
   */
  callDeleteItem() {
    this.toggleLookups();
    this.setLookups();

    this.api.editCartItem(this.cartItem, 'D').then((response: any) => {
      this.events.unsubscribe(Constants.EVENT_CART_ITEM_EDIT);
      this.events.publish(Constants.EVENT_CART_UPDATE);
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * Establish our special codes
   * from Codes Provider.
   */
  setCodes() {
    this.codes.queryCodes().then((codes: any) => {
      this.transactionTypes = JSON.parse(JSON.stringify(codes.transactionTypes));
      this.floorCodes = JSON.parse(JSON.stringify(codes.floorCodes));

      this.transactionTypes.forEach((val) => {
        this.transactionTypesLookup[val.val] = val.desc;
      });
      this.floorCodes.forEach((val) => {
        this.floorCodesLookup[val.val] = val.desc;
      });
      this.specialCodes.forEach((val) => {
        this.specialCodesLookup[val.val] = val.desc;
      });

      this.setLookups();
    }).catch((response: any) => {
      // Handle response.
    });
  }

  /**
   * Use our lookup tables to
   * convert item value codes
   * into readable format.
   */
  setLookups() {
    this.cartItem.transType = this.transactionTypesLookup[this.cartItem.transType] !== undefined ? this.transactionTypesLookup[this.cartItem.transType] : this.cartItem.transType;
    this.cartItem.floorCode = this.floorCodesLookup[this.cartItem.floorCode] !== undefined ? this.floorCodesLookup[this.cartItem.floorCode] : this.cartItem.floorCode;
    this.cartItem.specialCode = this.specialCodesLookup[this.cartItem.specialCode] !== undefined ? this.specialCodesLookup[this.cartItem.specialCode] : this.cartItem.specialCode;
  }

  /**
   * Toggle they key/value pairs
   * of our lookup table - used
   * in converting item value codes.
   */
  toggleLookups() {
    this.transactionTypesLookup = Object.keys(this.transactionTypesLookup)
      .reduce((obj, key) => ({ ...obj, [this.transactionTypesLookup[key]]: key }), {});
    this.floorCodesLookup = Object.keys(this.floorCodesLookup)
      .reduce((obj, key) => ({ ...obj, [this.floorCodesLookup[key]]: key }), {});
    this.specialCodesLookup = Object.keys(this.specialCodesLookup)
      .reduce((obj, key) => ({ ...obj, [this.specialCodesLookup[key]]: key }), {});
  }

  /**
   * Update item.transType after
   * select change. Two-way binding
   * isn't working.
   */
  onTransTypeChange(event) {
    this.cartItem.transType = event;
  }

  /**
   * Update item.floorCode after
   * select change. Two-way binding
   * isn't working.
   */
  onFloorCodeChange(event) {
    this.cartItem.floorCode = event;
  }

  /**
  * Update item.specialCode after
  * select change. Two-way binding
  * isn't working.
  */
  onSpecialCodeChange(event) {
    this.cartItem.specialCode = event;
  }

  formatFields() {
    this.cartItem.qty = this.numberManipulator.returnWholeNumberComma(this.cartItem.qty);
    this.cartItem.price = this.numberManipulator.returnCurrency(this.cartItem.price);
    this.calcTotal();
  }

  calcTotal() {
    this.totalPrice = Number(this.numberManipulator.returnWholeNumber(this.cartItem.qty)) * Number(this.numberManipulator.returnDecimalNumber(this.cartItem.price));
  }

  private parseCartItem(cartItem: any) {
    let tempItem;

    try {
      tempItem = {
        vendor: this.cartItem.vendor.toUpperCase(),
        model: this.cartItem.model.toUpperCase(),
        desc: this.cartItem.desc,
        qty: this.numberManipulator.returnWholeNumber(this.cartItem.qty),
        availableQty: this.numberManipulator.returnWholeNumber(this.cartItem.availableQty),
        transType: this.cartItem.transType.toUpperCase(),
        price: this.numberManipulator.returnDecimalNumber(this.cartItem.price),
        floorCode: this.cartItem.floorCode ? this.cartItem.floorCode.toUpperCase() : '',
        protection: this.cartItem.protection,
        specialCode: this.cartItem.specialCode ? this.cartItem.specialCode.toUpperCase() : '',
        lineNumber: this.cartItem.lineNumber,
        group: this.cartItem.group,
        promotion_1: this.cartItem.promotion_1,
        promotion_2: this.cartItem.promotion_2,
        imageURL: this.cartItem.imageURL
      };
    } catch (err) {
      tempItem = {};
    }

    return tempItem;
  }

  /**
   *
   * @param url Image Path
   *
   * Sometimes the AS/400 acts like an image is valid,
   * but we later find it not to be, so we try to load
   * it and
   */
  private imageExists(url) {
    const fallbackImage = '/assets/imgs/logo.png';

    let img = new Image();

    img.onerror = () => {
      this.cartItem.imageURL = fallbackImage;
    }

    img.src = url;
  }
}
