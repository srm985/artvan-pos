import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular'

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'inventory-master-search',
  templateUrl: 'inventory-master-search.html'
})
export class InventoryMasterSearchComponent {

  searchData: any;              // Object containing data used to search for inventory.
  searchResults: any[];         // List of returned, matched products.
  resultSelected: any;          // Index reference for selected result.
  widgetCollapsed: boolean;     // Track if our search widget should be collapsed.
  proceedStatus: boolean;       // Track if result is selected and we may proceed.
  showAdditional: boolean;      // Show additional information for selected item.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider
  ) {
    this.searchData = {
      vendor: '',
      model: '',
      department: '',
      description: '',
      class: '',
      color_size: '',
      style: '',
      status: 'A',
      type: 'I',
      inventory_codes: ''
    }
    this.searchResults = [];
    this.widgetCollapsed = false;
    this.showAdditional = null;
  }

  ngOnInit() {
    let searchCriteria = this.viewCtrl.data;

    if (searchCriteria) {
      this.searchData.vendor = searchCriteria.vendor === null ? '' : searchCriteria.vendor;
      this.searchData.model = searchCriteria.model === null ? '' : searchCriteria.model;
    }
  }

  searchInventory() {
    const compiledData = {
      vendor: this.searchData.vendor.toString().toUpperCase(),
      model: this.searchData.model.toString().toUpperCase(),
      department: this.searchData.department.toString().toUpperCase(),
      description: this.searchData.description.toString(),
      class: this.searchData.class.toString().toUpperCase(),
      color_size: this.searchData.color_size.toString(),
      style: this.searchData.style.toString().toUpperCase(),
      status: this.searchData.status.toString().toUpperCase(),
      type: this.searchData.type.toString().toUpperCase(),
      inventory_codes: this.searchData.inventory_codes.toString().toUpperCase()
    }

    // Collapse the widget when searching.
    this.widgetCollapsed = true;

    this.api.searchInventoryItem(compiledData).then((itemList: any[]) => {
      this.searchResults = (<any>Object).values(JSON.parse(JSON.stringify(itemList)));
      for (let i in this.searchResults) {
        for (let j in this.searchResults[i]) {
          this.searchResults[i][j] = this.searchResults[i][j].trim();
        }
      }
    }).catch((response: any) => {
      // Handle response.
      this.searchResults = [];
    });
  }

  /**
   * Select our result and proceed
   * if applicable.
   */
  selectResult(result) {
    this.resultSelected = this.resultSelected != result ? result : null;
    this.proceedStatus = this.resultSelected !== null ? true : false;
  }

  /**
   * Toggle the expansion of
   * each search result.
   */
  showAdditionalInfo(event, result) {
    event.stopPropagation();
    this.showAdditional = this.showAdditional != result ? result : null;
  }

  /**
   * Return our selected result
   * to the new ticket page.
   */
  returnResult() {
    this.viewCtrl.dismiss(this.searchResults[this.resultSelected]);
  }

  /**
   * Toggle our seach menu
   * expanded or collapsed.
   */
  toggleCollapse() {
    this.widgetCollapsed = !this.widgetCollapsed;
  }

  /**
   * Dismiss our search component
   * without returning anything.
   */
  dismiss(): void {
    this.viewCtrl.dismiss(false);
  }

}
