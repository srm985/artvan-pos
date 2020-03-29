import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
/* import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar'; */
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { NewTicketPage } from '../pages/new-ticket/new-ticket';
import { TabsPage } from '../pages/tabs/tabs';
import { SuspendedTicketsPage } from '../pages/suspended-tickets/suspended-tickets';
import { InvoiceTotalPage } from '../pages/invoice-total/invoice-total';
import { CustomerSearchPage } from '../pages/customer-search/customer-search';
import { CustomerInformationPage } from '../pages/customer-information/customer-information';
import { TenderMethodsPage } from '../pages/tender-methods/tender-methods';
import { ManagerApprovalListPage } from '../pages/manager-approval-list/manager-approval-list';
import { ManagerApprovalDetailsViewPage } from '../pages/manager-approval-details-view/manager-approval-details-view';

import { AddAssociatesComponent } from '../components/add-associates/add-associates';
import { SpecialInstructionsComponent } from '../components/special-instructions/special-instructions';
import { ZipLookupComponent } from '../components/zip-lookup/zip-lookup';
import { InventoryMasterSearchComponent } from '../components/inventory-master-search/inventory-master-search';
import { CartItemComponent } from '../components/cart-item/cart-item';
import { OrderDetailsComponent } from '../components/order-details/order-details';
import { FunctionsPopoverComponent } from '../components/functions-popover/functions-popover';
import { EditLineItemComponent } from '../components/edit-line-item/edit-line-item';
import { GroupPricingComponent } from '../components/group-pricing/group-pricing';
import { ComfortProtectionProgramComponent } from '../components/comfort-protection-program/comfort-protection-program';
import { InStoreCreditComponent } from '../components/in-store-credit/in-store-credit';
import { PromotionsComponent } from '../components/promotions/promotions';
import { SpecialOrderComponent } from '../components/special-order/special-order';
import { ManagerPromotionComponent } from '../components/manager-promotion/manager-promotion';
import { FinancePromotionsComponent } from '../components/finance-promotions/finance-promotions';
import { ProtectionPlanPromptComponent } from '../components/protection-plan-prompt/protection-plan-prompt';
import { ManagerApprovalOrderDetailsComponent } from '../components/manager-approval-order-details/manager-approval-order-details';

import { RestProvider } from '../providers/rest/rest';
import { UserDataProvider } from '../providers/user-data/user-data';
import { NumberManipulatorProvider } from '../providers/number-manipulator/number-manipulator';
import { StateListProvider } from '../providers/state-list/state-list';
import { SpecialCodesProvider } from '../providers/special-codes/special-codes';
import { SystemWarningsProvider } from '../providers/system-warnings/system-warnings';
import { ApiProvider } from '../providers/api/api';
import { StorageProvider } from '../providers/storage/storage';
import { DeviceAddressProvider } from '../providers/device-address/device-address';
import { ErrorMapperProvider } from '../providers/error-mapper/error-mapper';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    NewTicketPage,
    TabsPage,
    SuspendedTicketsPage,
    InvoiceTotalPage,
    CustomerSearchPage,
    CustomerInformationPage,
    TenderMethodsPage,
    ManagerApprovalListPage,
    ManagerApprovalDetailsViewPage,
    AddAssociatesComponent,
    SpecialInstructionsComponent,
    ZipLookupComponent,
    InventoryMasterSearchComponent,
    CartItemComponent,
    OrderDetailsComponent,
    FunctionsPopoverComponent,
    EditLineItemComponent,
    GroupPricingComponent,
    ComfortProtectionProgramComponent,
    InStoreCreditComponent,
    PromotionsComponent,
    SpecialOrderComponent,
    ManagerPromotionComponent,
    FinancePromotionsComponent,
    ProtectionPlanPromptComponent,
    ManagerApprovalOrderDetailsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    NewTicketPage,
    TabsPage,
    SuspendedTicketsPage,
    ManagerApprovalListPage,
    ManagerApprovalDetailsViewPage,
    AddAssociatesComponent,
    SpecialInstructionsComponent,
    ZipLookupComponent,
    InventoryMasterSearchComponent,
    CartItemComponent,
    OrderDetailsComponent,
    FunctionsPopoverComponent,
    InvoiceTotalPage,
    CustomerSearchPage,
    CustomerInformationPage,
    TenderMethodsPage,
    EditLineItemComponent,
    GroupPricingComponent,
    ComfortProtectionProgramComponent,
    InStoreCreditComponent,
    PromotionsComponent,
    SpecialOrderComponent,
    ManagerPromotionComponent,
    FinancePromotionsComponent,
    ProtectionPlanPromptComponent,
    ManagerApprovalOrderDetailsComponent
  ],
  providers: [
    /* StatusBar,
    SplashScreen, */
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    },
    RestProvider,
    UserDataProvider,
    NumberManipulatorProvider,
    StateListProvider,
    SpecialCodesProvider,
    SystemWarningsProvider,
    ApiProvider,
    StorageProvider,
    DeviceAddressProvider,
    ErrorMapperProvider
  ]
})
export class AppModule { }
