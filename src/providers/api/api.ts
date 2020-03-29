import { Injectable } from '@angular/core';

import { RestProvider } from '../rest/rest';
import { SystemWarningsProvider } from '../system-warnings/system-warnings';
import { StorageProvider } from '../storage/storage';

@Injectable()
export class ApiProvider {

  constructor(
    private rest: RestProvider,
    private systemWarnings: SystemWarningsProvider,
    private storage: StorageProvider,
  ) { }

  createNewTicket(ticketData: any = {}) {
    let data;
    return new Promise((resolve, reject) => {
      this.storage.returnStoreType().then((storeType: string) => {
        data = {
          'inInvType': 1,
          'inRetailOrClearance': storeType,
          'inAction': 'L'
        };
        this.rest.post('mobileapi/CreateNewTicket/json', data).then((transactionID: any) => {
          this.storage.setTransactionID(transactionID.transID).then(() => {
            resolve(transactionID);
          }).catch((response: any) => {
            // Handle response.
            reject();
          });
        }).catch((error) => {
          // this.systemWarnings.networkError(479330);
          reject();
        });
      });
    });
  }

  queryItemDetails(searchDetails: any = {}) {
    const mappedSearchDetails = {
      'inSKU': Number.isInteger(searchDetails.model) ? searchDetails.model : '',
      'inTransType': searchDetails.transType,
      'inVendor': Number.isInteger(searchDetails.model) ? '' : searchDetails.vendor,
      'inModel': Number.isInteger(searchDetails.model) ? '' : searchDetails.model,
      'inInvoiceCode': '',
      'inActive': ''
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/QueryItemDetails/json', mappedSearchDetails).then((itemDetails: any) => {
        resolve(itemDetails);
      }).catch((error) => {
        this.systemWarnings.networkError(303565);
        reject();
      });
    });
  }

  returnCartItems() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnCartItems/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(555682);
        reject();
      });
    });
  }

  addCartItem(cartItem: any = {}) {
    return new Promise((resolve, reject) => {
      this.storage.returnStoreType().then((storeType: string) => {
        const mappedCartItem = {
          'inRetailOrClearance': storeType,
          'inTransType': cartItem.transType,
          'inQuantity': cartItem.qty,
          'inVendor': cartItem.vendor,
          'inModel': cartItem.model,
          'inFloorCode': cartItem.floorCode,
          'inProtFp': 'N',
          'inProtSo': cartItem.specialCode,
          'inLineNumber': '',
          'inPrice': Math.abs(Number(cartItem.price)).toString(),
          'inDeliveryDate': '',
          'inVIA': ''
        };


        this.rest.post('mobileapi/AddCartItem/json', mappedCartItem).then((response: any) => {
          resolve(response);
        }).catch((error) => {
          // this.systemWarnings.networkError(536723);
          resolve();
        });
      }).catch((response: any) => {
        // Handle response.
      });
    });
  }

  editCartItem(cartItem: any = {}, action: string) {
    return new Promise((resolve, reject) => {
      this.storage.returnStoreType().then((storeType: string) => {
        const mappedCartItem = {
          'inRetailOrClearance': storeType,
          'inLineNumber': cartItem.lineNumber,
          'inAction': action,
          'inTransType': cartItem.transType,
          'inQuantity': cartItem.qty,
          'inVendor': cartItem.vendor,
          'inModel': cartItem.model,
          'inFloorCode': cartItem.floorCode,
          'inProtFp': 'N',
          'inProtSo': cartItem.specialCode,
          'inPrice': Math.abs(Number(cartItem.price)).toString(),
          'inDeliveryDate': '',
          'inVIA': ''
        };


        this.rest.post('mobileapi/editCartItem/json', mappedCartItem).then((response: any) => {
          resolve(response);
        }).catch((error) => {
          this.systemWarnings.networkError(284837);
          reject();
        });

      }).catch((response: any) => {
        // Handle response.
      });
    });
  }

  submitSpecialOrder(specialOrderDetails: any) {
    const mappedSpecialOrderDetails = {
      'inLineNum': '',
      'inFloorCode': '',
      'inQuantity': specialOrderDetails.quantity,
      'inXDFP': specialOrderDetails.protection,
      'inProtFp': specialOrderDetails.specialCode,
      'inXDPRICE': specialOrderDetails.price,
      'inVendor': specialOrderDetails.vendor.toUpperCase(),
      'inSoModel': specialOrderDetails.model.trim().toUpperCase(),
      'inSoCategory': specialOrderDetails.category.toUpperCase(),
      'inVendorDesc': specialOrderDetails.vendorDescription.toUpperCase(),
      'inCategoryDesc': specialOrderDetails.categoryDescription.toUpperCase(),
      'inEta': specialOrderDetails.expectedDelivery.toUpperCase(),
      'inFPVendor': specialOrderDetails.fplpNumber.trim().split(' ')[1] === undefined ? '' : specialOrderDetails.fplpNumber.trim().split(' ')[0].toUpperCase(),
      'inFPModel': specialOrderDetails.fplpNumber.trim().split(' ')[1] === undefined ? '' : specialOrderDetails.fplpNumber.trim().split(' ')[1].toUpperCase(),
      'inDesc': specialOrderDetails.lines[0].val.trim().toUpperCase(),
      'inSizeColor': specialOrderDetails.lines[1].val.trim().toUpperCase(),
      'inAltDesc': specialOrderDetails.lines[2].val.trim().toUpperCase(),
      'inText1': specialOrderDetails.lines[3].val.trim().toUpperCase(),
      'inText2': specialOrderDetails.lines[4].val.trim().toUpperCase(),
      'inText3': specialOrderDetails.lines[5].val.trim().toUpperCase(),
      'inText4': specialOrderDetails.lines[6].val.trim().toUpperCase(),
      'inSOComment1': specialOrderDetails.comments.slice(0, 80).toUpperCase(),
      'inSOComment2': specialOrderDetails.comments.slice(81, 162).toUpperCase(),
      'inSOComment3': specialOrderDetails.comments.slice(163).toUpperCase(),
      'inWebSite': specialOrderDetails.website.toUpperCase()
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SubmitSpecialOrder/json', mappedSpecialOrderDetails).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(717815);
        reject();
      });
    });
  }

  returnGroupPricingGroups() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnGroupPricingGroups/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(348057);
        reject();
      });
    });
  }

  returnGroupPricingAvailableItems() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnGroupPricingAvailableItems/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(989107);
        reject();
      });
    });
  }

  editGroupPricing(groupList: any = {}) {
    let mappedPayload = {
      'groups': JSON.parse(JSON.stringify(groupList))
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/EditGroupPricing/json', mappedPayload).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(189103);
        reject();
      });
    });
  }

  deleteGroupPricing(group: string = '') {
    const mappedPayload = {
      'groups': [
        {
          'delete': true,
          'groupid': group
        }
      ]
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/EditGroupPricing/json', mappedPayload).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(189103);
        reject();
      });
    });
  }

  editPromotions(promotionType: string) {
    const mappedPayload = {
      'inPromotionType': promotionType,
      /* 'inRetailLoc': 30 */
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/EditPromotions/json', mappedPayload).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(932591);
        reject();
      });
    });
  }

  submitSelectedPromotion(promoCode: string = '', financePromoCode: string = '') {
    let mappedPayload = {
      'inSpecialPromo': promoCode,
      'inSalesPromo': financePromoCode
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SubmitSelectedPromotion/json', mappedPayload).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(522895);
        reject();
      });
    });
  }

  removePromotions() {
    const mappedPayload = {
      'inPromotionType': 'D'
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/EditPromotions/json', mappedPayload).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(932592);
        reject();
      });
    });
  }

  checkDetailsRequired() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/CheckDetailsRequired/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(132283);
        reject();
      });
    });
  }

  returnOrderDetails() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/returnOrderDetails/json').then((orderDetails: any) => {
        resolve(orderDetails);
      }).catch((error) => {
        this.systemWarnings.networkError(974320);
        reject();
      });
    });
  }

  returnPickupDates(pickupLocation: string) {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnPickupDates/json', { 'inCustomerPickUpLoc': pickupLocation }).then((pickupDates: Date[]) => {
        resolve(pickupDates);
      }).catch((error) => {
        this.systemWarnings.networkError(415858);
        reject();
      });
    });
  }

  returnDeliveryDates(orderDetails: any = {}) {
    const mappedDeliveryDetails = {
      'inCity': orderDetails.city === undefined ? '' : orderDetails.city,
      'inZip': orderDetails.zipCode === undefined ? '' : orderDetails.zipCode
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnDeliveryDates/json', mappedDeliveryDetails).then((deliveryDates: Date[]) => {
        resolve(deliveryDates);
      }).catch((error) => {
        this.systemWarnings.networkError(856293);
        reject();
      });
    });
  }

  submitOrderDetails(orderDetails: any = {}) {
    const mappedOrderDetails = {
      'inDelCharge': orderDetails.deliveryCharge ? 'Y' : '',
      'inPremCharge': orderDetails.premiumCharge ? 'Y' : '',
      'inDelZip': orderDetails.zipCode,
      'inDelCity': orderDetails.city,
      'inDelDate': orderDetails.deliveryDate,
      'inPuDate': orderDetails.cpuDate,
      'inVia': orderDetails.via,
      'inBedPickup': orderDetails.beddingPickup,
      'inBedQty': orderDetails.recycleQty
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/submitOrderDetails/json', mappedOrderDetails).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(857882);
        reject();
      });
    });
  }

  returnMattressProtectionDetails() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnMattressProtectionDetails/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(594326);
        reject();
      });
    });
  }

  addMattressProtection(tsgDetails: any = {}) {
    const mappedPayload = {
      'inAccepted': tsgDetails.accepted ? 'Y' : '',
      'inPrice': tsgDetails.price,
      'inTSGType': tsgDetails.tsgType
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/AddMattressProtection/json', mappedPayload).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(768046);
        reject();
      });
    });
  }

  returnInvoiceTotalWholePageInfo(explodeOrder: boolean) {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnInvoiceTotalWholePageInfo/json', { 'inExplode': explodeOrder }).then((invoiceTotalWholePageInfo: any) => {
        resolve(invoiceTotalWholePageInfo);
      }).catch((error) => {
        this.systemWarnings.networkError(853502);
        reject();
      });
    });
  }

  // Removed 5 June 2018 - No Longer On Terminal
  /* returnOTDPrice() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnOTDPrice/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(946729);
        reject();
      });
    });
  }

  editOTDPrice(otdPrice: any) {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/EditOTDPrice/json', { 'inOTDPrice': otdPrice }).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(593418);
        reject();
      });
    });
  } */

  checkLineItemEditAvailable(lineNumbers: any[]) {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/CheckLineItemEditAvailable/json', { 'inLineIDS': [...lineNumbers] }).then((response) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(231678);
        reject();
      });
    });
  }

  submitLineItemEdit(lineItems: any) {
    let mappedPayload = [];

    lineItems.forEach((item: any) => {
      mappedPayload.push({
        'inLine': item.line,
        'inSKU': item.SKU === undefined ? '' : item.SKU,
        'inNewType': item.transType,
        'inOldType': item.originalTransType,
        'inDelDate': item.acquisitionDate,
        'inVia': item.via,
        'inFLR': item.floorCode,
        'inPrice': Number(item.price) >= 0 ? item.price : '',
        'inEditLine': item.editLine === undefined ? false : item.editLine
      });
    });

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SubmitLineItemEdit/json', { 'inLines': mappedPayload }).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(387460);
        reject();
      });
    });
  }

  searchCustomer(customerInfo: any) {
    const mappedCustomerInfo = {
      'inFirstName': customerInfo.firstName === null ? '' : customerInfo.firstName.toUpperCase(),
      'inLastName': customerInfo.lastName === null ? '' : customerInfo.lastName.toUpperCase(),
      'inHomePhone': customerInfo.phone === null ? '' : customerInfo.phone
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SearchCustomer/json', mappedCustomerInfo).then((customerList: any) => {
        resolve(customerList);
      }).catch((error) => {
        this.systemWarnings.networkError(551411);
        reject();
      });
    });
  }

  returnSelectedCustomer() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnSelectedCustomer/json', { 'data': 'blank' }).then((customerDetails: any) => {
        resolve(customerDetails);
      }).catch((error) => {
        this.systemWarnings.networkError(679304);
        reject();
      });
    });
  }

  createNewCustomer(customerInfo: any = {}) {
    let street;

    street = customerInfo.street.split(' ');
    street.shift();
    street = street.join(' ');

    const mappedCustomerInfo = {
      'inHomePhone': customerInfo.phone,
      'inFirstName': customerInfo.first_name,
      'inLastName': customerInfo.last_name,
      'inAddressNum': customerInfo.street.split(' ')[0],
      'inAddress': street,
      'inZipCode': customerInfo.zip,
      'inZipFour': '',
      'inWkPhone': customerInfo.work_phone,
      'inWkExt': customerInfo.work_ext,
      'inCellPhone': customerInfo.cell_phone,
      'inTaxID': customerInfo.tax_exempt_id,
      'inEmailAddr': customerInfo.guest_email.trim().length ? customerInfo.guest_email : 'NONE',
      'inCity': customerInfo.city,
      'inState': customerInfo.state,
      'inSeq': customerInfo.sequence,
      'inDupChk': false
    }

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/CreateNewCustomer/json', mappedCustomerInfo).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(910110);
        reject();
      });
    });
  }

  returnCustomerInfoDeliveryDetails() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnCustomerInfoDeliveryDetails/json').then((customerInfoDeliveryDetails: any) => {
        resolve(customerInfoDeliveryDetails);
      }).catch((error) => {
        this.systemWarnings.networkError(546135);
        reject();
      });
    });
  }

  linkCustomerInformation(customerInfo: any) {
    const mappedCustomerDetails = {
      'customer': {
        'inSeq': customerInfo.GSSEQNUMBER === undefined ? '' : customerInfo.GSSEQNUMBER.trim().toUpperCase(),
        'inHomePhone': customerInfo.GSHOMEPHONE === undefined ? '' : customerInfo.GSHOMEPHONE.trim().toUpperCase(),
        'inFirstName': customerInfo.GSFIRSTNAME === undefined ? '' : customerInfo.GSFIRSTNAME.trim().toUpperCase(),
        'inLastName': customerInfo.GSLASTNAME === undefined ? '' : customerInfo.GSLASTNAME.trim().toUpperCase(),
        'inAddressNum': customerInfo.GSADR === undefined ? '' : customerInfo.GSADR.trim().toUpperCase(),
        'inAddress': customerInfo.GSADDRESS === undefined ? '' : customerInfo.GSADDRESS.trim().toUpperCase(),
        'inZipCode': customerInfo.GSZIPCODE === undefined ? '' : customerInfo.GSZIPCODE.trim().toUpperCase(),
        'inZipFour': customerInfo.GSZIPCODE4 === undefined ? '' : customerInfo.GSZIPCODE4.trim().toUpperCase(),
        'inWkPhone': customerInfo.GSWORKPHONE === undefined ? '' : customerInfo.GSWORKPHONE.trim().toUpperCase(),
        'inWkPhoneExt': customerInfo.GSWORKEXT === undefined ? '' : customerInfo.GSWORKEXT.trim().toUpperCase(),
        'inCellPhone': customerInfo.GSCELLPHONE === undefined ? '' : customerInfo.GSCELLPHONE.trim().toUpperCase(),
        'inTaxID': customerInfo.GSTAXEXEMPT === undefined ? '' : customerInfo.GSTAXEXEMPT.trim().toUpperCase(),
        'inEmailAddr': customerInfo.GSEMAIL === undefined ? 'NONE' : customerInfo.GSEMAIL.trim().length ? customerInfo.GSEMAIL.trim().toUpperCase() : 'NONE',
        'inCity': customerInfo.GSCITY === undefined ? '' : customerInfo.GSCITY.trim().toUpperCase(),
        'inState': customerInfo.GSSTATE === undefined ? '' : customerInfo.GSSTATE.trim().toUpperCase(),
      }
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/LinkCustomerInformation/json', mappedCustomerDetails).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(152426);
        reject();
      });
    });
  }

  submitCustomerInfoDeliveryDetails(customerInfo: any) {
    let mappedCustomerDetails,
      street;

    street = customerInfo.customer.street.split(' ');
    street.shift();
    street = street.join(' ');

    mappedCustomerDetails = {
      'customer': {
        'inSeq': customerInfo.customer.sequence,
        'inHomePhone': customerInfo.customer.phone,
        'inFirstName': customerInfo.customer.first_name,
        'inLastName': customerInfo.customer.last_name,
        'inAddressNum': customerInfo.customer.street.split(' ')[0],
        'inAddress': street,
        'inZipCode': customerInfo.customer.zip,
        'inZipFour': '',
        'inWkPhone': customerInfo.customer.work_phone,
        'inWkPhoneExt': customerInfo.customer.work_ext,
        'inCellPhone': customerInfo.customer.cell_phone,
        'inTaxID': customerInfo.customer.tax_exempt_id,
        'inEmailAddr': customerInfo.customer.guest_email,
        'inCity': customerInfo.customer.city,
        'inState': customerInfo.customer.state,
        'updatePrimaryPhone': customerInfo.customer.updatePrimaryPhone
      }
    };

    if (customerInfo.delivery.home_phone.length) {
      let street;

      street = customerInfo.delivery.street.split(' ');
      street.shift();
      street = street.join(' ');

      mappedCustomerDetails.delivery = {
        'inHomePhone': customerInfo.delivery.home_phone,
        'inFirstName': customerInfo.delivery.first_name,
        'inLastName': customerInfo.delivery.last_name,
        'inAddressNum': customerInfo.delivery.street.split(' ')[0],
        'inAddress': street,
        'inZipCode': customerInfo.delivery.zip,
        'inZipFour': '',
        'inCity': customerInfo.delivery.city,
        'inState': customerInfo.delivery.state,
        'inWkPhone': customerInfo.delivery.work_phone,
        'inWkPhoneExt': customerInfo.delivery.work_ext,
        'inCellPhone': customerInfo.delivery.cell_phone,
        'delCrossStreets': customerInfo.delivery.cross_streets,
        'bestCont': customerInfo.delivery.contact_method
      };
    }

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SubmitCustomerInfoDeliveryDetails/json', mappedCustomerDetails).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(152427);
        reject();
      });
    });
  }

  submitManagerPromotion(promotionList: any[]) {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SubmitManagerPromotion/json', { 'inPromoLines': promotionList }).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(641811);
        reject();
      });
    });
  }

  returnPreTenderWholePageInfo() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnPreTenderWholePageInfo/json').then((preTenderWholePageInfo: any) => {
        resolve(preTenderWholePageInfo);
      }).catch((error) => {
        this.systemWarnings.networkError(789138);
        reject();
      });
    });
  }

  savePaymentMethods(paymentMethods: any) {
    const mappedPaymentMethods = {
      'cashAmt': paymentMethods.cash,
      'checkAmt': paymentMethods.check,
      'card1Amt': paymentMethods.credit_1,
      'card2Amt': paymentMethods.credit_2,
      'card3Amt': paymentMethods.credit_3,
      'card4Amt': paymentMethods.credit_4,
      'altFinAmt': paymentMethods.financeAmount,
      'financeCompany': paymentMethods.financeCompany,
      'syncBAmt': paymentMethods.syncbAmount,
      'geccPromo': paymentMethods.syncbPromo,
      'giftAmt': paymentMethods.giftCard,
      'slsPromo': paymentMethods.salesPromo,
      'compCare': paymentMethods.completeCare ? 'R' : '',
      'careFlag': paymentMethods.completeCareFlag ? 'Y' : '',
      'invTot': paymentMethods.invoiceTotal,
      'reqDep': paymentMethods.invoiceDeposit,
      'tideWaterAmt': paymentMethods.tidewaterAmount,
      'tideWaterPromo': paymentMethods.tidewaterPromo
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SavePaymentMethods/json', mappedPaymentMethods).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(495770);
        reject();
      });
    });
  }

  submitPaymentMethods(paymentMethods: any) {
    const mappedPaymentMethods = {
      'cashAmt': paymentMethods.cash,
      'checkAmt': paymentMethods.check,
      'card1Amt': paymentMethods.credit_1,
      'card2Amt': paymentMethods.credit_2,
      'card3Amt': paymentMethods.credit_3,
      'card4Amt': paymentMethods.credit_4,
      'altFinAmt': paymentMethods.financeAmount,
      'financeCompany': paymentMethods.financeCompany,
      'syncBAmt': paymentMethods.syncbAmount,
      'geccPromo': paymentMethods.syncbPromo,
      'giftAmt': paymentMethods.giftCard,
      'slsPromo': paymentMethods.salesPromo,
      'compCare': 'R',
      'careFlag': paymentMethods.completeCareFlag ? 'Y' : '',
      'invTot': paymentMethods.invoiceTotal,
      'reqDep': paymentMethods.invoiceDeposit,
      'toMgr': '1',
      'ots': '',
      'tideWaterAmt': paymentMethods.tidewaterAmount,
      'tideWaterPromo': paymentMethods.tidewaterPromo
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/submitPaymentMethods/json', mappedPaymentMethods).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(495771);
        reject();
      });
    });
  }

  returnSuspendedOrders(employeeNumber: string = '') {
    const mappedPayload = {
      'inEmployeeNumber': employeeNumber
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnSuspendedOrders/json', mappedPayload).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(947503);
        reject();
      });
    });
  }

  openSuspendedOrder(ticketDetails: any) {
    const mappedPayload = {
      'inTransID': ticketDetails.id,
      'invLoc': ticketDetails.invoiceLocation.slice(0, 1).toUpperCase() + ticketDetails.invoiceLocation.slice(1).toLowerCase()
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/OpenSuspendedOrder/json', mappedPayload).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(647212);
        reject();
      });
    }).catch(() => { });
  }

  deleteSuspendedOrder(transactionInfo: any) {
    const mappedTransactionInfo = {
      'inTransID': transactionInfo.transactionID,
      'inPasswd': transactionInfo.password
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/DeleteSuspendedOrder/json', mappedTransactionInfo).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(689375);
        reject();
      });
    });
  }

  searchInventoryItem(searchCriteria: any) {
    const mappedSearchCriteria = {
      'inVendor': searchCriteria.vendor,
      'inModel': searchCriteria.model,
      'inDept': searchCriteria.department,
      'inClass': searchCriteria.class,
      'inStyle': searchCriteria.style,
      'inDesc': searchCriteria.description,
      'inSizeColor': searchCriteria.color_size,
      'inDelFlag': searchCriteria.status,
      'inSetFlag': searchCriteria.type,
      'inInvoiceCode': searchCriteria.inventory_codes
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SearchInventoryItem/json', mappedSearchCriteria).then((inventorySearchResults: any[]) => {
        resolve(inventorySearchResults);
      }).catch((error) => {
        this.systemWarnings.networkError(596415);
        reject();
      });
    });
  }

  returnSalesAssociates() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnSalesAssociates/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(705287);
        reject();
      });
    });
  }

  setSalesAssociates(associateList: any) {
    const mappedAssociateList = {
      'inSalesAssociateNum1': associateList[0] === undefined ? '' : associateList[0],
      'inSalesAssociateNum2': associateList[1] === undefined ? '' : associateList[1],
      'inSalesAssociateNum3': associateList[2] === undefined ? '' : associateList[2],
      'inSalesAssociateNum4': associateList[3] === undefined ? '' : associateList[3]
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SetSalesAssociates/json', mappedAssociateList).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(237645);
        reject();
      });
    });
  }

  returnSpecialInstructions() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnSpecialInstructions/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(246849);
        reject();
      });
    });
  }

  editSpecialInstructions(specialInstructions: string) {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/EditSpecialInstructions/json', {
        'inXMINS': specialInstructions.replace(/\n/g, ' ')
      }).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(150813);
        reject();
      });
    });
  }

  /**
   * When suspending an order, we'll first check to see if
   * anything is in the cart. If it's empty, we'll just
   * delete the order. If we receive an error, let's just
   * default to assuming something is in the cart.
   */
  suspendOrder() {
    let cartEmpty;

    return new Promise((resolve, reject) => {
      new Promise((resolve) => {
        this.returnCartItems().then((cartItems: any) => {
          try {
            if (cartItems.items.length) {
              cartEmpty = false;
            } else {
              cartEmpty = true;
            }
          } catch (err) {
            cartEmpty = false;
          } finally {
            resolve(cartEmpty);
          }
        }).catch((response: any) => {
          cartEmpty = false;
          resolve(cartEmpty);
        });
      }).then((cartEmpty: boolean) => {
        if (cartEmpty) {
          this.deleteTicket().then((response: any) => {
            resolve(response);
          }).catch((response: any) => {
            reject(response);
          });
        } else {
          this.rest.post('mobileapi/SuspendOrder/json').then((response: any) => {
            this.storage.removeTransactionID();
            this.storage.removeStoreType();
            resolve(response);
          }).catch((error) => {
            this.systemWarnings.networkError(703837);
            reject();
          });
        }
      });
    });
  }

  returnTransactionTypes() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnTransactionTypes/json').then((transactionTypes: any[]) => {
        resolve(transactionTypes);
      }).catch((error) => {
        // this.systemWarnings.networkError(973527);
        resolve([
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
        ]);
      });
    });
  }

  zipCodeReverseLookup(zipCity: string) {
    const mappedPayload = {
      'inZipCode': '',
      'inCity': zipCity
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ZipCodeReverseLookup/json', mappedPayload).then((zipCodeList: any[]) => {
        resolve(zipCodeList);
      }).catch((error) => {
        this.systemWarnings.networkError(674788);
        reject();
      });
    });
  }

  returnInStoreCredits() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnInStoreCredits/json').then((inStoreCredits: any) => {
        resolve(inStoreCredits);
      }).catch((error) => {
        this.systemWarnings.networkError(373248);
        reject();
      });
    });
  }

  editInStoreCredits(credits: any) {
    let mappedCredits = {
      'E': {
        'inStore1': credits.completeCareNumber_1.split('-')[0] === undefined ? '0' : credits.completeCareNumber_1.split('-')[0],
        'inINV1': credits.completeCareNumber_1.split('-')[1] === undefined ? '0' : credits.completeCareNumber_1.split('-')[1],
        'inLine1': credits.completeCareNumber_1.split('-')[2] === undefined ? '0' : credits.completeCareNumber_1.split('-')[2],
        'inStore2': credits.completeCareNumber_2.split('-')[0] === undefined ? '0' : credits.completeCareNumber_2.split('-')[0],
        'inINV2': credits.completeCareNumber_2.split('-')[1] === undefined ? '0' : credits.completeCareNumber_2.split('-')[1],
        'inLine2': credits.completeCareNumber_2.split('-')[2] === undefined ? '0' : credits.completeCareNumber_2.split('-')[2]
      },
      'T': {
        'inStore1': credits.tsgNumber_1.split('-')[0] === undefined ? '0' : credits.tsgNumber_1.split('-')[0],
        'inINV1': credits.tsgNumber_1.split('-')[1] === undefined ? '0' : credits.tsgNumber_1.split('-')[1],
        'inLine1': credits.tsgNumber_1.split('-')[2] === undefined ? '0' : credits.tsgNumber_1.split('-')[2],
        'inStore2': credits.tsgNumber_2.split('-')[0] === undefined ? '0' : credits.tsgNumber_2.split('-')[0],
        'inINV2': credits.tsgNumber_2.split('-')[1] === undefined ? '0' : credits.tsgNumber_2.split('-')[1],
        'inLine2': credits.tsgNumber_2.split('-')[2] === undefined ? '0' : credits.tsgNumber_2.split('-')[2]
      },
      'I': {
        'inQTY25': credits.giftCard_25.trim().length ? credits.giftCard_25.trim() : '0',
        'inQTY50': credits.giftCard_50.trim().length ? credits.giftCard_50.trim() : '0'
      }
    };

    /* if (Number(credits.completeCareNumber_1.split('-')[0]) > 0 || Number(credits.completeCareNumber_2.split('-')[0]) > 0) {
      mappedCredits['E'] = {
        'inStore1': credits.completeCareNumber_1.split('-')[0] === undefined ? '0' : credits.completeCareNumber_1.split('-')[0],
        'inINV1': credits.completeCareNumber_1.split('-')[1] === undefined ? '0' : credits.completeCareNumber_1.split('-')[1],
        'inLine1': credits.completeCareNumber_1.split('-')[2] === undefined ? '0' : credits.completeCareNumber_1.split('-')[2],
        'inStore2': credits.completeCareNumber_2.split('-')[0] === undefined ? '0' : credits.completeCareNumber_2.split('-')[0],
        'inINV2': credits.completeCareNumber_2.split('-')[1] === undefined ? '0' : credits.completeCareNumber_2.split('-')[1],
        'inLine2': credits.completeCareNumber_2.split('-')[2] === undefined ? '0' : credits.completeCareNumber_2.split('-')[2]
      };
    }
    if (Number(credits.tsgNumber_1.split('-')[0]) > 0 || Number(credits.tsgNumber_2.split('-')[0]) > 0) {
      mappedCredits['T'] = {
        'inStore1': credits.tsgNumber_1.split('-')[0] === undefined ? '0' : credits.tsgNumber_1.split('-')[0],
        'inINV1': credits.tsgNumber_1.split('-')[1] === undefined ? '0' : credits.tsgNumber_1.split('-')[1],
        'inLine1': credits.tsgNumber_1.split('-')[2] === undefined ? '0' : credits.tsgNumber_1.split('-')[2],
        'inStore2': credits.tsgNumber_2.split('-')[0] === undefined ? '0' : credits.tsgNumber_2.split('-')[0],
        'inINV2': credits.tsgNumber_2.split('-')[1] === undefined ? '0' : credits.tsgNumber_2.split('-')[1],
        'inLine2': credits.tsgNumber_2.split('-')[2] === undefined ? '0' : credits.tsgNumber_2.split('-')[2]
      };
    }
    if (Number(credits.giftCard_25) > 0 || Number(credits.giftCard_50) > 0) {
      mappedCredits['I'] = {
        'inQTY25': credits.giftCard_25.length ? credits.giftCard_25 : '0',
        'inQTY50': credits.giftCard_50.length ? credits.giftCard_50 : '0'
      };
    } */

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/EditInStoreCredits/json', mappedCredits).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(157666);
        reject();
      });
    });
  }

  returnTaxExemptStatus() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnTaxExemptStatus/json').then((taxExemptStatus: boolean) => {
        resolve(taxExemptStatus);
      }).catch((error) => {
        this.systemWarnings.networkError(831172);
        reject();
      });
    });
  }

  toggleTaxExemptStatus() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ToggleTaxExemptStatus/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(770412);
        reject();
      });
    });
  }

  returnManagerApprovalOrders() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnManagerApprovalOrders/json').then((ticketList: any) => {
        resolve(ticketList);
      }).catch((error) => {
        this.systemWarnings.networkError(703102);
        reject();
      });
    });
  }

  openManagerApprovalOrder() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/OpenManagerApprovalOrder/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(635028);
        reject();
      });
    });
  }

  returnAppliedPromotions() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnAppliedPromotions/json').then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(727042);
        reject();
      });
    });
  }

  submitManagerApprovalCode(password: string) {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SubmitManagerApprovalCode/json', { 'inPassword': password.toUpperCase() }).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(529656);
        reject();
      });
    });
  }

  returnFinanceCompanies() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnFinanceCompanies/json').then((financeCompanyList: any) => {
        resolve(financeCompanyList);
      }).catch((error) => {
        this.systemWarnings.networkError(319311);
        reject();
      });
    });
  }

  returnFinancePromotions() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnFinancePromotions/json').then((financePromotionList: any) => {
        resolve(financePromotionList);
      }).catch((error) => {
        this.systemWarnings.networkError(378381);
        reject();
      });
    });
  }

  deleteTicket() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/DeleteTicket/json').then((response: any) => {
        this.storage.removeTransactionID();
        this.storage.removeStoreType();
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(188853);
        reject();
      });
    });
  }

  returnProtectionPlans() {
    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/ReturnProtectionPlans/json').then((protectionPlans: any) => {
        resolve(protectionPlans);
      }).catch((error) => {
        this.systemWarnings.networkError(462039);
        reject();
      });
    });
  }

  submitProtectionPlanWarrantKit(planSelection: any) {
    const mappedPayload = {
      'inPlanPrice': planSelection.price,
      'inBronzeSelected': planSelection.plan === 'B' ? '1' : '',
      'inSilverSelected': planSelection.plan === 'S' ? '1' : '',
      'inGoldSelected': planSelection.plan === 'G' ? '1' : '',
      'inPremKit': planSelection.kit === 'P' ? 'Y' : '',
      'inFreeKit': planSelection.kit === 'F' ? 'Y' : '',
      'inOfferDeclined': planSelection.plan === 'D' ? 'Y' : ''
    };

    return new Promise((resolve, reject) => {
      this.rest.post('mobileapi/SubmitProtectionPlanWarrantyKit/json', mappedPayload).then((response: any) => {
        resolve(response);
      }).catch((error) => {
        this.systemWarnings.networkError(912699);
        reject();
      });
    });
  }
}
