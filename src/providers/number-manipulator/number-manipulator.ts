import { Injectable } from '@angular/core';

@Injectable()
export class NumberManipulatorProvider {

  private wholeNumber_Reg = /\D/g;
  private numberPositive_Reg = /^0+/g;
  private decimalNumber_Reg = /[^0-9.]/g;
  private commaInsert_Reg = /(\d)(?=(\d{3})+(\.[0-9]{0,2})?$)/g;
  private decimalInsert_Reg = /[0-9]{1,}(\.[0-9]{0,2})?/;

  constructor() { }

  /**
   * Return a whole number.
   * Ex: 1000 -> 1000
   */
  returnWholeNumber(value: any = '') {
    value = value === null ? '' : value.toString();

    try {
      value = value.replace(this.wholeNumber_Reg, '');
    } catch (err) {
      value = '';
    }
    return value;
  }

  /**
   * Return a positive whole number.
   * Ex: 1000 -> 1000  |  0 -> ''
   */
  returnPositiveWholeNumber(value: any = '') {
    value = value === null ? '' : value.toString();

    try {
      value = value.replace(this.wholeNumber_Reg, '').replace(this.numberPositive_Reg, '');
    } catch (err) {
      value = '';
    }
    return value;
  }

  /**
   * Return a whole number with commas.
   * Ex: 1000000 -> 1,000,000
   */
  returnWholeNumberComma(value: any = '') {
    value = value === null ? '' : value.toString();

    try {
      value = this.addComma(this.returnPositiveWholeNumber(value));
    } catch (err) {
      value = '';
    }
    return value;
  }

  /**
   * Return a partial decimal number.
   * Ex: 1.2 -> 1.2  |  1 -> 1
   */
  returnDecimalNumber(value: any = '') {
    value = value === null ? '' : value.toString();
    try {
      value = value.toString().replace(this.decimalNumber_Reg, '').match(this.decimalInsert_Reg)[0].replace(/^(0{2})0{1,}/, '$1').replace(/^0{2,}/, '0').replace(/^0([0-9]+)/, '$1');
    } catch (err) {
      value = '';
    }
    return value;
  }

  /**
   * Return a partial decimal number with comma.
   * Ex: 1000.2 -> 1,000.2  |  1000 -> 1,000
   */
  returnDecimalNumberComma(value: any = '') {
    value = value === null ? '' : value.toString();

    try {
      value = this.addComma(this.returnDecimalNumber(value));
    } catch (err) {
      value = '';
    }
    return value;
  }

  /**
   * Return a prettified decimal number.
   * Ex: 1000 -> 1,000.00  |  1000.2 -> 1,000.20
   */
  returnDecimalPretty(value: any = '') {
    let priceArr: any[];

    value = value === null ? '' : value.toString();

    try {
      value = this.returnDecimalNumberComma(value);
      priceArr = value.toString().split('.');
      if (priceArr.length === 1) {
        priceArr[1] = '00';
      }
      priceArr[1] = (priceArr[1] + '00').slice(0, 2);
      value = priceArr.join('.');
    } catch (err) {
      value = '';
    }
    return value;
  }

  /**
   * Return a currency-tagged number.
   * Ex: 1000 -> $1,000  |  1000.2 -> $1,000.2
   */
  returnCurrency(value: any = '', zeroInclusive: boolean = false) {
    value = value === null ? '' : value.toString();

    try {
      value = this.returnDecimalNumberComma(value);
      if (value.replace(',', '').length) {
        value = '$' + value;
      } else {
        value = '';
      }
    } catch (err) {
      value = '';
    }
    return value;
  }

  /**
  * Return a currency-tagged number.
  * Ex: 1000 -> $1,000.00  |  1000.2 -> $1,000.20
  */
  returnCurrencyPretty(value: any = '') {
    value = value === null ? '' : value.toString();

    try {
      if (value.length) {
        value = this.returnCurrency(this.returnDecimalPretty(value));
      }
    } catch (err) {
      value = '';
    }
    return value;
  }

  /**
  * Parse value for phone number, format and return.
  * Ex: 3148675309 -> (314) 867-5309
  */
  returnPhone(value: any = '') {
    value = value === null ? '' : value.toString();

    try {
      value = this.returnWholeNumber(value).toString().slice(0, 10);
      if (value.length && value.length <= 3) {
        value = `(${value}`;
      } else if (value.length && value.length <= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
      } else if (value.length > 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
      }
    } catch (err) {
      value = '';
    }
    return value;
  }

  /**
  * Add commas according to USA standards.
  */
  private addComma(value: any = '') {
    value = value === null ? '' : value.toString();

    try {
      value = value.replace(this.commaInsert_Reg, '$1,');
    } catch (err) {
      value = '';
    }
    return value;
  }
}
