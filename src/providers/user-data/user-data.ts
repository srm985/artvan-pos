import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events, AlertController } from 'ionic-angular';

import * as Constants from '../config';

@Injectable()
export class UserDataProvider {

  constructor(
    private storage: Storage,
    private events: Events,
    private alertCtrl: AlertController
  ) { }

  /**
   * Once a user has been authenticated,
   * we save our token to storage.
   */
  setToken(token: string) {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        console.log(`setting token: ${token}`);
        this.storage.set(Constants.TOKEN_PATH, token).then((response) => {
          resolve();
        }).catch(() => {
          reject();
        });
      }).catch(() => {
        reject();
      });
    });
  }

  /**
   * Retrieve our stored token from
   * device storage.
   */
  recallToken() {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.get(Constants.TOKEN_PATH).then((token) => {
          console.log(`recalling token: ${token}`)
          resolve(token);
        }).catch((error) => {
          reject(error);
        });
      }).catch(() => {
        reject();
      });
    });
  }

  /**
   * Promise which resolves by returning
   * true if a token is saved in storage.
   */
  hasValidToken() {
    return new Promise((resolve, reject) => {
      this.recallToken().then((token) => {
        if (token) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch(() => {
        resolve(false);
      });
    });
  }

  /**
   * Once user has been authenticated,
   * we save our user data to storage.
   */
  setUserData(userData) {
    return new Promise((resolve, reject) => {
      this.storage.set(Constants.USER_DATA_PATH, userData).then(() => {
        resolve();
      }).catch(() => {
        reject();
      });
    });
  }

  /**
   * Retrieve our stored user data
   * from device storage.
   */
  recallUserData() {
    return new Promise((resolve, reject) => {
      this.storage.get(Constants.USER_DATA_PATH).then((value) => {
        resolve(value);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Log out our user and redirect
   * to login page.
   */
  logoutPrompt() {
    return new Promise((resolve) => {
      let logoutAlert = this.alertCtrl.create({
        title: 'Log Out',
        message: 'Do you want to log out?',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              resolve(false);
            }
          },
          {
            text: 'Log Out',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });

      logoutAlert.present();
    });
  }

  logout() {
    /* this.clearStorage().then(() => {
      this.events.publish(Constants.EVENT_NAV_SET_ROOT);
    }).catch(() => { }); */
    this.events.publish(Constants.EVENT_CLEAR_STORAGE);
    this.events.publish(Constants.EVENT_NAV_SET_ROOT);
  }
}
