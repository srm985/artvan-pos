import { Component } from '@angular/core';
import { ViewController, AlertController } from 'ionic-angular'

import { ApiProvider } from '../../providers/api/api';
import { NumberManipulatorProvider } from '../../providers/number-manipulator/number-manipulator';
import { SystemWarningsProvider } from '../../providers/system-warnings/system-warnings';

@Component({
  selector: 'group-pricing',
  templateUrl: 'group-pricing.html'
})
export class GroupPricingComponent {

  cartItems: any[];             // List of cart items.
  groupList: any[];             // Array containing group pricing groups.
  invalidGroup: any[];          // List tracking valid form groups.
  groupErrors: any[];           // List of any errors returned.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider,
    private numberManipulator: NumberManipulatorProvider,
    private alertCtrl: AlertController,
    private systemWarnings: SystemWarningsProvider
  ) {
    // Create an initial instance in group list.
    this.groupList = [{
      items: [],
      price: '',
      isValid: true
    }];
    this.groupErrors = [];

    this.api.returnGroupPricingAvailableItems().then((availableGroupItems: any) => {
      this.cartItems = [];

      if (Object.keys(availableGroupItems).length) {
        const tempList = (<any>Object).values(JSON.parse(JSON.stringify(availableGroupItems)));

        tempList.forEach((item: any) => {
          this.cartItems.push({
            item: {
              vendor: item.DXVNDA.trim(),
              model: item.DXMDL.trim(),
              lineNum: item.DXLINE.trim()
            },
            avl: true
          });
        });
      }
    }).catch((response: any) => {
      this.cartItems = [];
    });
  }

  /**
   * Add an additional entry in our
   * group list.
   */
  addNewGroup() {
    this.groupList.push({
      items: [],
      price: '',
      isValid: true
    });
  }

  /**
   * Delete an entry in our group list.
   */
  deleteGroup(group) {
    this.groupList[group].items.forEach((item) => {
      this.cartItems.forEach((remainingItem, index) => {
        if (item.id == remainingItem.item.id) {
          this.cartItems[index].avl = true;
        }
      });
    });
    this.groupList.splice(group, 1);
  }

  presentGroupItems(group: number) {
    let mappedInputs,
      groupItemsList;

    mappedInputs = [];

    this.cartItems.forEach((option: any, index: any) => {
      if (option.avl) {
        mappedInputs.push({
          type: 'checkbox',
          label: option.item.vendor.trim() + ' ' + option.item.model,
          value: index,
        });
      }
    });

    groupItemsList = this.alertCtrl.create({
      title: 'Add Item(s)',
      inputs: mappedInputs,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Select',
          handler: (options: any[]) => {
            options.forEach((option: number) => {
              this.addToGroup(group, option);
            });
          }
        }
      ]
    });
    groupItemsList.present();
  }

  /**
   * Add an item to a specific group.
   */
  addToGroup(group, item) {
    this.groupList[group].items.push(JSON.parse(JSON.stringify(this.cartItems[item].item)));
    this.cartItems[item].avl = false;
  }

  /**
   * Remove an item from a specific group.
   */
  removeFromGroup(group, itemID) {
    let tempHolder;

    this.groupList[group].items.forEach((item, index) => {
      if (item.id == itemID) {
        this.groupList[group].items.splice(index, 1);
      }
    });
    this.cartItems.forEach((remainingItem, index) => {
      if (remainingItem.item.id == itemID) {
        this.cartItems[index].avl = true;
      }
    });

    /**
     * Toggle the group list to trigger a redraw,
     * clearing select values - it's insane, I know...
     *
     * Essentially, when deleting a group item, the select
     * might still contain the old selected value before
     * ngIf was triggered. This is my solution to clearing
     * the previously-selected values.
     */
    tempHolder = JSON.parse(JSON.stringify(this.groupList));
    setTimeout(() => {
      this.groupList = JSON.parse(JSON.stringify(tempHolder))
    }, 0);
  }

  /**
   * Submit our price groups.
   */
  submitGroupPricing() {
    const tempGroup = JSON.parse(JSON.stringify(this.groupList));
    let proceedStatus = true;

    tempGroup.forEach((group, index) => {
      tempGroup[index].price = this.numberManipulator.returnDecimalNumber(group.price);
      if (group.items.length == 0) {
        tempGroup.splice(index, 1);
        proceedStatus = false;
      } else if (group.items.length == 1) {
        tempGroup[index].isValid = false;
        proceedStatus = false;
      } else {
        tempGroup[index].isValid = true;
      }
    });

    if (proceedStatus) {
      let errorFlag = false;
      this.groupErrors = [];

      this.api.editGroupPricing(tempGroup).then((response: any) => {
        // Make sure we have the key in response before proceeding.
        if ('groups' in response) {
          // Check if we have any group pricing errors.
          for (let group in response.groups) {
            if (response.groups[group].retVal != '0') {
              errorFlag = true;
            }
            this.groupErrors[Number(group) - 1] = response.groups[group].Sc_errmsg.Sc_errmsg_0.trim()
          }
          if (!errorFlag) {
            this.dismiss(true);
          }
        }
      }).catch((response: any) => {
        // Handle response.
      });
    } else {
      let errorAlert = this.alertCtrl.create({
        title: 'Invalid Group',
        message: 'Please review the group to ensure you have grouped at least two items together and have set a valid group price.',
        buttons: [
          {
            text: 'Dismiss'
          }
        ]
      });
      errorAlert.present();
    }
  }

  /**
   * This function removes a specific grouping
   * of items.
   */
  removeGroupPricing() {
    let removeGroupModal = this.alertCtrl.create({
      title: 'Remove Group',
      message: 'Please enter the group number to remove.',
      inputs: [
        {
          name: 'groupNumber',
          placeholder: 'Group Number',
          type: 'tel'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Remove',
          handler: data => {
            this.api.deleteGroupPricing(data.groupNumber).then((response: any) => {
              if ('groups' in response) {
                if (response.groups[data.groupNumber].retVal == '0') {
                  this.dismiss(true);
                } else {
                  this.systemWarnings.returnedError(response.groups[data.groupNumber].Sc_errmsg.Sc_errmsg_0);
                }
              }
            }).catch((response: any) => {
              // Handle response.
            });
          }
        }
      ]
    });
    removeGroupModal.present();
  }

  /**
   * Dismiss price group modal without
   * editing.
   */
  dismiss(status: boolean = false) {
    this.viewCtrl.dismiss(status);
  }

  /**
   * Format price to currency.
   */
  formatCurrency() {
    for (let i = 0; i < this.groupList.length; i++) {
      this.groupList[i].price = this.numberManipulator.returnCurrency(this.groupList[i].price);
    }
  }
}
