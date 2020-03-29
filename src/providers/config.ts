// Define our application version.
export const VERSION_NUMBER = '1.0.3';

// Define where authorization token is stored.
export const TOKEN_PATH = 'authToken';

// Define where user data is stored.
export const USER_DATA_PATH = 'userData';

// Define account prefixes without managerial permissions.
export const NON_MANAGER_ACCOUNTS = ['SLS', 'FSL'];

// Define our base API URL.
export const API_URL = `localhost:8101/`;                                   // Dev
//export const API_URL = `https://mposapiqa.artvan.com:8443/`;      // QA
// export const API_URL = `https://mposapi.artvan.com/`;               // Prod

// Define our user authentication sub-URL.
export const AUTH_URL = 'login';


/*************************Events**************************/

// Define user event name constant.
const USER = 'user';

// Define cart event name constant.
const CART = 'cart';

// Define navigation event name constant.
const NAV = 'nav';

// Define application event name constant.
const APP = 'app';

// Define our user logout event.
export const EVENT_USER_LOGOUT = `${USER}:logout`;

// Define our user logout event.
export const EVENT_CLEAR_STORAGE = `${USER}:clearStorage`;

// Define our update cart event.
export const EVENT_CART_UPDATE = `${CART}:update`;

// Define our OTD price event.
export const EVENT_UPDATE_INVOICE_TOTAL = `${CART}:invoiceTotal`;

// Define our multiple cart item edits in progress event.
export const EVENT_CART_ITEM_EDIT = `${CART}:edit`;

// Define our set root page event.
export const EVENT_NAV_SET_ROOT = `${NAV}:setRoot`;

// Define our set home page navigation event.
export const EVENT_NAV_POP_HOME = `${NAV}:popToHome`;

// Define our set root of manager approval.
export const EVENT_NAV_POP_MANAGER_APPROVAL = `${NAV}:popToManagerApproval`;

// Define our application closure event.
export const EVENT_APP_CLOSE = `${APP}:close`;


/*************************Storage Locations**************************/

// Define our storage name constant.
const STORAGE = 'storage';

// Define the location where we store our transaction ID.
export const STORAGE_TRANSACTION_ID = `${STORAGE}:transactionID`;

// Define the location where we store our transaction TYPE.
export const STORAGE_TRANSACTION_TYPE = `${STORAGE}:transactionType`;

// Define the location where we store our store type.
export const STORAGE_STORE_TYPE = `${STORAGE}:storeType`;

// Define the location where we store our suspended order flag.
export const STORAGE_SUSPENDED_ORDER_FLAG = `${STORAGE}:suspendedFlag`;
