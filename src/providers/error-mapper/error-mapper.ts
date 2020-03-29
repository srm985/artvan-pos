import { Injectable } from '@angular/core';

@Injectable()
export class ErrorMapperProvider {

  constructor() { }

  /**
   * We receive an array of error flags and
   * an array of error messages. We map those
   * to the error flag index.
   *
   * @param errorFlags List of error flags.
   * @param errorList List of text for any errors.
   */
  mapErrors([...errorFlags], [...errorList]) {
    let mappedErrors = [];

    errorFlags.forEach((error: string) => {
      if (error == '1') {
        mappedErrors.push(errorList.shift());
      } else {
        mappedErrors.push('');
      }
    });

    return mappedErrors;
  }
}
