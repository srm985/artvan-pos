import { Component, ViewChild } from '@angular/core';
import { Platform, Events, Nav } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { enableProdMode } from '@angular/core';
/* import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen'; */

import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';

import { UserDataProvider } from '../providers/user-data/user-data';
import { ApiProvider } from '../providers/api/api';

import * as Constants from '../providers/config';

enableProdMode();

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  constructor(
    private platform: Platform,
    /* private statusBar: StatusBar,
    private splashScreen: SplashScreen, */
    private userData: UserDataProvider,
    private events: Events,
    private api: ApiProvider,
    private user: UserDataProvider,
    private storage: Storage
  ) { }

  ngOnInit() {

    // Check if we have a valid token saved or not.
    this.checkLoggedIn();

    // Warn users when they attempt to leave page.
    window.addEventListener('beforeunload', (event) => {
      //event.returnValue = null;
    });

    // Watch for page unload events and prompt user.
    window.addEventListener('unload', (event) => {
      //this.events.publish(Constants.EVENT_APP_CLOSE);
      //this.api.suspendOrder();
    });

    this.platform.ready().then(() => {
      /* this.statusBar.styleDefault();
      this.splashScreen.hide(); */
    });

    // Listen for an event calling for the app root.
    this.events.subscribe(Constants.EVENT_NAV_SET_ROOT, () => {
      this.checkLoggedIn();
    });

    // Listen for a call to clear storage.
    this.events.subscribe(Constants.EVENT_CLEAR_STORAGE, () => {
      this.storage.ready();
      this.storage.clear();
    });

    // Listen for a user logout event and try to suspend order before logging out.
    this.events.subscribe(Constants.EVENT_USER_LOGOUT, (noPrompt: boolean = false) => {
      new Promise((resolve) => {
        if (noPrompt) {
          resolve();
        } else {
          this.user.logoutPrompt().then((logoutConfirm) => {
            if (logoutConfirm) {
              resolve();
            }
          });
        }
      }).then(() => {
        new Promise((resolve) => {
          if (noPrompt) {
            resolve();
          } else {
            this.api.suspendOrder().then(() => {
              resolve();
            }).catch((response: any) => {
              resolve();
            });
          }
        }).then(() => {
          this.user.logout();
        });
      });
    });
  }

  /**
   * This function checks to see if we have
   * a valid token in storage and sets the
   * app root accordingly.
   */
  checkLoggedIn() {
    this.userData.hasValidToken().then((isLoggedIn) => {
      if (!isLoggedIn) {
        this.rootPage = LoginPage;
      } else {
        this.rootPage = TabsPage;
      }
    });
  }
}
