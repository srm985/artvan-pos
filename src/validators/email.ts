import { FormControl } from '@angular/forms';

export class EmailValidator {
    static isValid(control: FormControl): any {
        const EMAIL_REG = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        try {
            if (!control.value.length) {
                return null;
            } else if (!EMAIL_REG.test(control.value.toLowerCase()) && control.value.toLowerCase() !== 'none') {
                return {
                    'Invalid email address!': true
                }
            }
        } catch (err) {
            return null;
        }

        return null;
    }
}
