import { Component } from '@angular/core';
import { IonicPage, Events, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestProvider } from '../../providers/rest/rest';

import { UserDataProvider } from '../../providers/user-data/user-data';
import { SystemWarningsProvider } from '../../providers/system-warnings/system-warnings';

import * as Constants from '../../providers/config';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  userCredentialsForm: FormGroup;       // Form group for validating user input.
  invalidCredentials: boolean;          // Flag set if server returns invalid response.

  constructor(
    private rest: RestProvider,
    private formBuilder: FormBuilder,
    private userData: UserDataProvider,
    private events: Events,
    private systemWarnings: SystemWarningsProvider,
    private alertCtrl: AlertController
  ) {
    this.userCredentialsForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.minLength(1), Validators.maxLength(50)])],
      password: ['', Validators.compose([Validators.minLength(1), Validators.maxLength(50)])]
    });
    this.invalidCredentials = false;
  }

  /**
   * Handle our user login procedure.
   */
  userLogin(): void {
    const nonManagers = [...Constants.NON_MANAGER_ACCOUNTS];

    let authorizationData: any = {},
      token: string = '',
      userData: any = {},
      isNotManager = false,
      usernamePrefix = '';

    this.invalidCredentials = false;

    if (this.userCredentialsForm.valid) {
      authorizationData = this.userCredentialsForm.value;
      authorizationData.version = Constants.VERSION_NUMBER; // We have to pass a version.

      usernamePrefix = this.userCredentialsForm.value.username.trim().toLowerCase().slice(0, 3);
      isNotManager = false;

      this.rest.getAuth(authorizationData).then((data: any) => {
        if (data.ResultCode === '-1') {
          let semverError = this.alertCtrl.create({
            title: 'Version Mismatch',
            message: data.Message,
            buttons: ['Dismiss']
          });
          semverError.present();
        } else if (data.ResultCode != '0') {
          // We probably used invalid credentials.
          this.invalidCredentials = true;
        } else if (data.ResultCode == '0') {
          token = data.token;
          delete data.token;
          userData = data;

          /**
           * We check if username prefix does not have managerial
           * privileges. ArtVan requested blacklist instead of whitelist
           * because they apparently are uncertain of all the account
           * prefixes which have managerial access.
           */
          for (let account in nonManagers) {
            if (nonManagers[account].toLowerCase() === usernamePrefix) {
              isNotManager = true;
            }
          }
          userData['isNotManager'] = isNotManager;

          this.userData.setToken(token).then(() => {
            this.userData.setUserData(userData).then(() => {
              this.userCredentialsForm.reset();
              this.events.publish(Constants.EVENT_NAV_SET_ROOT);
            }).catch(() => { });
          }).catch(() => { });
        }
      }).catch((err) => {
        this.systemWarnings.networkError(126114);
      });
    }
  }
}
