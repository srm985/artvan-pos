import { FormControl } from '@angular/forms';

export class PhoneValidator {
    static isValid(control: FormControl): any {

        try {
            const phone = control.value.replace(/\D+/g, '');

            if (!phone.length) {
                return null;
            } else if (phone.length < 10) {
                return {
                    'Phone number too short!': true
                }
            } else if (phone.length > 10) {
                return {
                    'Phone number too long!': true
                }
            }

        } catch (err) {
            return null;
        }
    }
}
