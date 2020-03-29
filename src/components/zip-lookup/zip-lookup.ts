import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'zip-lookup',
  templateUrl: 'zip-lookup.html'
})
export class ZipLookupComponent {

  zipCity: string;              // Contains a string with the given city name.
  zipResults: any[];            // Contains a list of the returned zip codes.
  resultSelected: number;       // Tracks the index of the item currently selected.
  proceedStatus: boolean;       // Set true when an item has been selected.

  constructor(
    private viewCtrl: ViewController,
    private api: ApiProvider
  ) {
    this.zipCity = '';
    this.zipResults = [];
    this.proceedStatus = false;
  }

  /**
   * Make a call to zip reverse lookup API and
   * attempt to retrieve list pf zip codes for
   * given city.
   */
  fetchZipResults() {
    const searchCity = this.zipCity.trim() === '' ? null : this.zipCity.trim().toUpperCase();

    let tempResults;

    this.api.zipCodeReverseLookup(searchCity).then((zipList: any) => {
      this.zipResults = [];
      tempResults = (<any>Object).values(JSON.parse(JSON.stringify(zipList)));
      tempResults.forEach((result: any) => {
        this.zipResults.push({
          city: result.ZXCITY.trim(),
          state: result.ZXST.trim(),
          zip: result.ZXZIP.trim()
        });
      });
    }).catch((response: any) => {
      this.zipResults = [];
    });
  }

  /**
   * This function handles the actions when a
   * user clicks on a list item. If it was previously
   * selected, it is deselected. If an item is selected,
   * the user can proceed.
   */
  selectZip(zip) {
    this.resultSelected = this.resultSelected != zip ? zip : null;
    this.proceedStatus = this.resultSelected !== null ? true : false;
  }

  /**
   * This function should only be called if a zip code
   * has been selected. It then returns the selected
   * value from the list.
   */
  returnZip() {
    this.viewCtrl.dismiss({
      zip: this.zipResults[this.resultSelected].zip,
      city: this.zipResults[this.resultSelected].city
    });
  }

  /**
   * This function dismisses our modal and passes an
   * empty string as the zip value.
   */
  dismiss() {
    this.viewCtrl.dismiss('');
  }
}
