# Art Van Mobile POS
This repository houses the Ionic application intended to serve as the Art Van Mobile POS.

### Development
This application currently relies on the Ionic CLI tool for serving and issuing builds. [Node.js](https://nodejs.org/en/) is required to serve or build this application.

To serve this application in development mode, once cloned, the code below will need to be executed. Prior to this, it's import to update the API base URL in ```config.ts``` found in the ```/providers``` directory. Once configured, execute:

```sh
$ npm install -g ionic@latest
$ cd artvan-pos
$ npm install
$ ionic serve
```

To issue a build:

```sh
$ npm install -g ionic@latest
$ cd artvan-pos
$ npm install
$ ionic build --minifyjs --minifycss
```

Once built, the contents of the `/www/` directory can be deployed.

### Pages
| Page | Description |
| ---- | ----------- |
| Customer Information | This page creates/updates the customer profile and collects delivery information if required for a given order. |
| Customer Search | This page is used to search for, and select existing customer profiles. |
| Home | This page presents the user with the option to select the retail or clearance version of their store. |
| Invoice Total | This page presents the user with the invoice total, including all fees and taxes. |
| Login | This page serves as the primary login page for the user. Credentials are identical to green screen credentials. |
| Manager Approval Details View | This page provides a detailed view of a ticket awaiting manager approval and provides an option to enter an approval code. |
| Manager Approval List | This page provides a list of tickets currently awaiting manager approval. |
| New Ticket | This page allows the user to create a new ticket (worksheet). |
| Suspended Tickets | This page provides a list of suspended tickets linked to the user's employee number. Users with elevated privileges can search based on employee numbers. |
| Tabs | This page currently allows users to switch between their current ticket page and any suspended tickets. The tab count will increase as new features are incorporated. |
| Tender Methods | This page allows users to input various tender method options and submit the order for tendering or manager approval. |

### Components
| Component | Description |
| --------- | ----------- |
| Add Associates | This component provides users with the ability to add additional associates to a specific transaction. |
| Cart Item | This component contains the framework for the tiles used in displaying items currently in the cart. |
| Comfort Protection Program | This component is displayed as a modal if the user is purchasing a mattress. |
| Edit Line Item | This component provides the user with a modal in which they can update aspects of an item on the invoice total page. |
| Finance Promotions | This component queries and then presents a list of available finance promotions available for use during tendering. |
| Functions Popover | This component contains all popover functions used to replace function keys throughout the order process. |
| Group Pricing | This component provides the user with a modal which allows grouping of cart items and establishing a group price. |
| In-Store Credit | This component allows users to apply the various in-store credits to an order. |
| Inventory Master Search | This component provides users with the ability to perform an inventory master search - returning a vendor and model. |
| Manager Approval Order Details | This component presents a list of order detail flags set when opening a manager approval order. |
| Manager Promotion | This component is displayed when cart items require a promotional code for tendering. It displays any cart items which require this code and a list of available codes. |
| Order Details | This component prompts the user for additional details such as pickup, delivery, or bedding information. |
| Promotions | This component allows users to apply the various promotions to an order. |
| Protection Plan Prompt | This component presents users with the selection of available protection plans for the current order. |
| Special Instructions | This component allows the user to input special instructions appended to the current order. |
| Special Order | This component is used to collect information required to submit a special order item. |
| Zip Lookup | This component provides users with the ability to search for a customer's zip code based on their city. |

### Providers
| Provider | Description |
| -------- | ----------- |
| API | This provider contains all available API calls and relevant I/O mappings. |
| Device Address | This provider attempts to resolve the device's local IP address. This is used to determine the store location of the device. |
| Error Mapper | This provider uses a returned list of error flags to map error text to the correct form field. |
| Number Manipulator | This provider offers several numerical-formatting functions. These functions are very similar to Angular pipes, but support real-time, continuous use on input fields. |
| Rest | This provider contains formatted AJAX template functions for making API calls. It also contains user authentication logic. |
| Special Codes | This provider attempts to centralize any codes required throughout the transaction such as the transaction types or the floor codes. By centralizing this information, the goal is that only one call will be required throughout the application lifecycle. |
| State List | This provider contains a list of US states/territories and Canadian provinces. |
| Storage | This provider contains all functions related to storage manipulation used to store key things such as API token and transaction type. We don't store any user information because it's currently stashed in the token. |
| System Warnings | This provider contains the modals required to display system errors and general warnings. |
| User Data | This provider handles archiving and recalling user data, saved after the initial login. |
| Config | While not a provider, this file contains all global constants. |

### Error Codes
| Error | Description |
| ---------- | ----------- |
| 126114 | The application experienced an error while trying to log the user in. |
| 132283 | The application experienced an error while attempting to call the CheckDetailsRequired API. |
| 150813 | The application experienced an error while attempting to call the EditSpecialInstructions API. |
| 152426 | The application experienced an error while attempting to call the LinkCustomerInformation API. |
| 152427 | The application experienced an error while attempting to call the SubmitCustomerInfoDeliveryDetails API. |
| 157666 | The application experienced an error while attempting to call the EditInStoreCredits API. |
| 188853 | The application experienced an error while attempting to call the DeleteTicket API. |
| 189103 | The application experienced an error while attempting to call the EditGroupPricing API. |
| 231678 | The application experienced an error while attempting to call the CheckLineItemEditAvailable API. |
| 237645 | The application experienced an error while attempting to call the SetSalesAssociates API. |
| 246849 | The application experienced an error while attempting to call the ReturnSpecialInstructions API. |
| 250006 | The application experienced an error while attempting to resolve the local IP address of the device. |
| 284837 | The application experienced an error while attempting to call the EditCartItem API. |
| 303565 | The application experienced an error while attempting to call the QueryItemDetails API. |
| 319311 | The application experienced an error while attempting to call the ReturnFinanceCompanies API. |
| 348057 | The application experienced an error while attempting to call the ReturnGroupPricingGroups API. |
| 373248 | The application experienced an error while attempting to call the ReturnInStoreCredits API. |
| 378381 | The application experienced an error while attempting to call the ReturnFinancePromotions API. |
| 387460 | The application experienced an error while attempting to call the SubmitLineItemEdit API. |
| 415858 | The application experienced an error while attempting to call the ReturnPickupDates API. |
| 462039 | The application experienced an error while attempting to call the ReturnProtectionPlans API. |
| 479330 | The application experienced an error while attempting to call the CreateNewTicket API. |
| 495770 | The application experienced an error while attempting to call the SavePaymentMethods API. |
| 495771 | The application experienced an error while attempting to call the SubmitPaymentMethods API. |
| 497434 | The application experienced an error while attempting to call the SubmitDeliveryInfo API. |
| 522895 | The application experienced an error while attempting to call the SubmitSelectedPromotion API. |
| 529656 | The application experienced an error while attempting to call the SubmitManagerApprovalCode API. |
| 536723 | The application experienced an error while attempting to call the AddCartItem API. |
| 546135 | The application experienced an error while attempting to call the ReturnCustomerInfoDeliveryDetails API. |
| 551411 | The application experienced an error while attempting to call the SearchCustomer API. |
| 555682 | The application experienced an error while attempting to call the ReturnCartItems API. |
| 593418 | The application experienced an error while attempting to call the EditOTDPrice API. |
| 594326 | The application experienced an error while attempting to call the ReturnMattressProtectionDetails API. |
| 596415 | The application experienced an error while attempting to call the SearchInventoryItem API. |
| 635028 | The application experienced an error while trying to call the OpenManagerApprovalOrder API. |
| 638591 | The application experienced an error while trying to query transaction types or special codes. |
| 641811 | The application experienced an error while attempting to call the SubmitManagerPromotion API. |
| 642445 | The application experienced an error while trying convert and return transaction types or special codes. |
| 647212 | The application experienced an error while attempting to call the OpenSuspendedOrder API. |
| 674788 | The application experienced an error while attempting to call the ZipCodeReverseLookup API. |
| 679304 | The application experienced an error while attempting to call the ReturnSelectedCustomer API. |
| 689375 | The application experienced an error while attempting to call the DeleteSuspendedOrder API. |
| 703102 | The application experienced an error while attempting to call the SuspendOrder API. |
| 703837 | The application experienced an error while attempting to call the ReturnManagerApprovalOrders API. |
| 705287 | The application experienced an error while attempting to call the ReturnSalesAssociates API. |
| 717815 | The application experienced an error while attempting to call the SubmitSpecialOrder API. |
| 727042 | The application experienced an error while attempting to call the ReturnAppliedPromotions API. |
| 768046 | The application experienced an error while attempting to call the AddMattressProtection API. |
| 770412 | The application experienced an error while attempting to call the ToggleTaxExemptStatus API. |
| 789138 | The application experienced an error while attempting to call the ReturnPreTenderWholePageInfo API. |
| 831172 | The application experienced an error while attempting to call the ReturnTaxExemptStatus API. |
| 853502 | The application experienced an error while attempting to call the ReturnInvoiceTotalWholePageInfo API. |
| 856293 | The application experienced an error while attempting to call the ReturnDeliveryDates API. |
| 857882 | The application experienced an error while attempting to call the SubmitOrderDetails API. |
| 897926 | The application experienced an error while attempting to call the SubmitCustomerInfo API. |
| 910110 | The application experienced an error while attempting to call the CreateNewCustomer API. |
| 912699 | The application experienced an error while attempting to call the SubmitProtectionPlanWarrantyKit API. |
| 927636 | The application experienced an error while attempting to call the UpdatePrimaryPhone API. |
| 932591 | The application experienced an error while attempting to call the EditPromotions API. |
| 932592 | The application experienced an error while attempting to call the RemovePromotions API. |
| 946729 | The application experienced an error while attempting to call the ReturnSalesAssociates API. |
| 947503 | The application experienced an error while attempting to call the ReturnSuspendedOrders API. |
| 953322 | The application experienced an error while trying to submit additional order details such as selected pickup, delivery dates, or bedding options while editing an item on the invoice summary page. |
| 973527 | The application experienced an error while attempting to call the ReturnTransactionTypes API. |
| 974320 | The application experienced an error while attempting to call the ReturnOrderDetails API. |
| 989107 | The application experienced an error while attempting to call the ReturnGroupPricingAvailableItems API. |
