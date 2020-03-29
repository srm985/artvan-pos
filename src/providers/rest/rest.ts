import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, Events } from 'ionic-angular';

import { UserDataProvider } from '../user-data/user-data';
import { SystemWarningsProvider } from '../../providers/system-warnings/system-warnings';

import * as Constants from '../../providers/config';
import { StorageProvider } from '../storage/storage';

@Injectable()
export class RestProvider {

  hasToken: any;
  headers: HttpHeaders;

  private token: string;

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private userData: UserDataProvider,
    private systemWarnings: SystemWarningsProvider,
    private events: Events,
    private storage: StorageProvider
  ) { }

  /**
   * Query UserData for token
   * and save for later use.
   */
  recallToken() {
    return new Promise((resolve) => {
      this.userData.recallToken().then((token: string) => {
        console.log(`recalled token: ${token}`)
        this.token = token;
        resolve();
      }).catch(() => {
        this.systemWarnings.systemError(276129);
        resolve();
      });
    });
  }

  /**
 * Quickly verify if token
 * has been set.
 */
  checkToken() {
    return new Promise((resolve) => {
      if (this.token !== undefined) {
        resolve();
      } else {
        this.recallToken().then(() => {
          resolve();
        });
      }
    });
  }

  /**
   * Define our header when
   * making calls.
   */
  private setHeaders() {
    return this.headers = new HttpHeaders({
      'Content-Type': 'application/json'
      //'Accept': 'application/json'
    });
  }

  /**
   * Handle user authentication.
   */
  getAuth(userCredentials) {
    const navigatorObject = navigator;

    let deviceInformation = {};

    for (let key in navigatorObject) {
      deviceInformation[key] = navigatorObject[key];
    }

    const payload = {
      username: userCredentials.username.toUpperCase(),
      password: userCredentials.password,
      version: Constants.VERSION_NUMBER,
      navigator: deviceInformation
    }

    let loading;

    // Initialize our loading spinner.
    loading = this.loadingController.create();
    loading.present();

    return new Promise((resolve, reject) => {
      this.http.post(Constants.API_URL + Constants.AUTH_URL, JSON.parse(JSON.stringify(payload)))
        .subscribe((response: any) => {
          console.log(response);
          loading.dismiss(); // Destroy our loading spinner.
          if (response.token) {
            // We were issued a token and we're in!
            this.token = response.token;
            resolve(response);
          } else {
            // We probably used invalid credentials.
            resolve(response);
          }
        },
          (err) => {
            loading.dismiss(); // Destroy our loading spinner.
            // reject(err);

            // MOCKED !!!
            this.token = 'ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFO';

            resolve({
              cmpByte: '',
              cmpNumber: '0',
              empName: '',
              empNumber: '52487',
              ErrMsg: '',
              location: {
                ClrLoc: '37',
                ErrMsg: '',
                IpAddr: '10.10.101.22',
                RtlLoc: '30',
                Rtnvlu: '0'
              },
              ResultCode: 0,
              retLocation: '30',
              retVal: '0',
              role: 'Administrator',
              token: 'ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFO',
              user_id: 'MISSMQ'
            });
          });
    });
  }

  /**
   * Handle get calls.
   */
  get(url) {
    let loading;

    // Initialize our loading spinner.
    loading = this.loadingController.create();
    loading.present();

    return new Promise((resolve, reject) => {
      this.checkToken().then(() => {
        //this.headers = this.setHeaders(this.token);
        this.http.get(Constants.API_URL + url, {
          observe: 'body',
          responseType: 'json',
          reportProgress: true,
          headers: this.headers,
          withCredentials: false
        })
          .subscribe((data) => {
            loading.dismiss(); //Destroy our loading spinner
            resolve(data);
          },
            (err) => {
              loading.dismiss(); //Destroy our loading spinner.
              reject(err);
            });
      });
    });
  }

  /**
   * Handle post calls.
   */
  post(url, payload: any = {}) {
    let loading,
      headers;

    // Initialize our loading spinner.
    loading = this.loadingController.create();
    loading.present();

    return new Promise((resolve, reject) => {
      this.checkToken().then(() => {

        // Append token to body.
        payload['inToken'] = this.token;

        // Set our headers.
        headers = this.setHeaders();

        //let headers = new HttpHeaders();
        //headers = headers.set('Content-Type','application/json').set('Accept', 'application/json');
        this.storage.returnTransactionID().then((transactionID: string) => {

          // Append transactionID to body only if we didn't send one.
          if (payload.inTransID === undefined) {
            payload['inTransID'] = transactionID;
          }

          payload = JSON.stringify(payload);

          console.log(`%cPOST ${url.replace('mobileapi/', '').replace('/json', '')} (${this.generateTimestamp()})...`, `color:blue;text-decoration:underline;`);
          console.log('%c' + JSON.parse(JSON.stringify(payload.toString())), `color:blue;`);

          this.http.post(Constants.API_URL + url, payload, {
            headers: headers,
            observe: 'body',
            responseType: 'json',
            reportProgress: true,
            withCredentials: false
          })
            .subscribe((data: any) => {
              loading.dismiss(); //Destroy our loading spinner.
              if (data.message == 'Expired token') {
                this.events.publish(Constants.EVENT_USER_LOGOUT, true);
              } else {
                console.log(`%cReturned POST ${url.replace('mobileapi/', '').replace('/json', '')} (${this.generateTimestamp()})...`, `color:green;text-decoration:underline;`);
                console.log('%c' + JSON.stringify(data), `color:green;`);
                resolve(data);
              }
            },
              (err) => {
                loading.dismiss(); //Destroy our loading spinner.
                console.log(err)
                reject(err);
              });
        });
      });
    });
  }

  /**
   * Handle put calls to
   * update data.
   */
  update(url, data) {
    let loading;

    // Initialize our loading spinner.
    loading = this.loadingController.create();
    loading.present();

    return new Promise((resolve, reject) => {
      this.checkToken().then(() => {
        //this.headers = this.setHeaders(this.token);
        this.http.put(Constants.API_URL + url, data, {
          observe: 'body',
          responseType: 'json',
          reportProgress: true,
          headers: this.headers,
          withCredentials: false
        })
          .subscribe((data) => {
            loading.dismiss(); //Destroy our loading spinner.
            resolve(data);
          },
            (err) => {
              loading.dismiss(); //Destroy our loading spinner.
              reject(err);
            });
      });
    });
  }

  /**
   * Handle delete calls.
   */
  remove(url) {
    let loading;

    // Initialize our loading spinner.
    loading = this.loadingController.create();
    loading.present();

    return new Promise((resolve, reject) => {
      this.checkToken().then(() => {
        //this.headers = this.setHeaders(this.token);
        this.http.delete(Constants.API_URL + url)
          .subscribe((data) => {
            loading.dismiss(); //Destroy our loading spinner.
            resolve(data);
          },
            (err) => {
              loading.dismiss(); //Destroy our loading spinner.
              reject(err);
            });
      });
    });
  }

  private generateTimestamp() {
    const now = new Date();

    let date: any = [now.getDate(), now.getMonth() + 1, now.getFullYear()],
      time: any = [now.getHours(), now.getMinutes(), now.getSeconds()];

    date.forEach((value: string, index: any) => {
      date[index] = (`0${value}`).slice(-2);
    });
    time.forEach((value: string, index: any) => {
      time[index] = (`0${value}`).slice(-2);
    });

    return `${time.join('.')} ${date.join('.')}`;
  }
}
