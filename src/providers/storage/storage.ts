import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import * as Constants from '../config';

@Injectable()
export class StorageProvider {

  constructor(
    private storage: Storage
  ) { }

  setTransactionID(transactionID: string) {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.set(Constants.STORAGE_TRANSACTION_ID, transactionID).then((response: any) => {
          resolve();
        }).catch((response: any) => {
          // Handle response.
          reject();
        });
      }).catch(() => {
        reject();
      });
    });
  }

  returnTransactionID() {
    return new Promise((resolve) => {
      this.storage.ready().then(() => {
        this.storage.get(Constants.STORAGE_TRANSACTION_ID).then((transactionID: string) => {
          if (transactionID !== null) {
            resolve(transactionID);
          } else {
            resolve('');
          }
          resolve(transactionID);
        }).catch((response: any) => {
          // Handle response.
          resolve('');
        });
      }).catch(() => {
        resolve('');
      });
    });
  }

  removeTransactionID() {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.remove(Constants.STORAGE_TRANSACTION_ID).then((response: any) => {
          resolve();
        }).catch((response: any) => {
          // Handle response.
          reject();
        });
      }).catch(() => {
        reject();
      });
    });
  }

  setTransactionType(transactionID: string) {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.set(Constants.STORAGE_TRANSACTION_TYPE, transactionID).then((response: any) => {
          resolve();
        }).catch((response: any) => {
          // Handle response.
          reject();
        });
      }).catch(() => {
        reject();
      });
    });
  }

  returnTransactionType() {
    return new Promise((resolve) => {
      this.storage.ready().then(() => {
        this.storage.get(Constants.STORAGE_TRANSACTION_TYPE).then((transactionID: string) => {
          if (transactionID !== null) {
            resolve(transactionID);
          } else {
            resolve('');
          }
          resolve(transactionID);
        }).catch((response: any) => {
          // Handle response.
          resolve('');
        });
      }).catch(() => {
        resolve('');
      });
    });
  }

  removeTransactionType() {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.remove(Constants.STORAGE_TRANSACTION_TYPE).then((response: any) => {
          resolve();
        }).catch((response: any) => {
          // Handle response.
          reject();
        });
      }).catch(() => {
        reject();
      });
    });
  }

  setStoreType(storeType: string) {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.set(Constants.STORAGE_STORE_TYPE, storeType).then((response: any) => {
          resolve();
        }).catch((response: any) => {
          reject();
        });
      }).catch(() => {
        reject();
      });
    });
  }

  returnStoreType() {
    return new Promise((resolve) => {
      this.storage.ready().then(() => {
        this.storage.get(Constants.STORAGE_STORE_TYPE).then((storeType: string) => {
          if (storeType !== null) {
            resolve(storeType);
          } else {
            resolve('');
          }
          resolve(storeType);
        }).catch((response: any) => {
          // Handle response.
          resolve('');
        });
      }).catch(() => {
        resolve('');
      });
    });
  }

  removeStoreType() {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.remove(Constants.STORAGE_STORE_TYPE).then((response: any) => {
          resolve();
        }).catch((response: any) => {
          // Handle response.
          reject();
        });
      }).catch(() => {
        reject();
      });
    });
  }

  setPreviouslySuspendedOrderFlag() {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.set(Constants.STORAGE_SUSPENDED_ORDER_FLAG, true).then((response: any) => {
          resolve();
        }).catch((response: any) => {
          reject();
        });
      }).catch(() => {
        reject();
      });
    });
  }

  returnPreviouslySuspendedOrderFlag() {
    return new Promise((resolve) => {
      this.storage.ready().then(() => {
        this.storage.get(Constants.STORAGE_SUSPENDED_ORDER_FLAG).then((suspendedStatus: boolean) => {
          resolve(suspendedStatus);
        }).catch((response: any) => {
          resolve(false);
        });
      }).catch(() => {
        resolve(false);
      });
    });
  }

  removePreviouslySuspendedOrderFlag() {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.remove(Constants.STORAGE_SUSPENDED_ORDER_FLAG).then((response: any) => {
          resolve();
        }).catch((response: any) => {
          reject();
        });
      }).catch(() => {
        reject();
      });
    });
  }
}
