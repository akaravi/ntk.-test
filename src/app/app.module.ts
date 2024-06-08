import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
//todo: check
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { CURRENCY_MASK_CONFIG, CurrencyMaskConfig } from 'ng2-currency-mask';

import { MAT_COLOR_FORMATS, MatColorFormats } from 'ngx-ntk-mat-color-picker';
import { ToastrModule } from 'ngx-toastr';
import { CoreAuthService, CoreConfigurationService, CoreEnumService, CoreModuleService } from 'ntk-cms-api';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';

import { AppRoutingModule } from './app.routes';
import { ComponentsModule } from './components/components.module';
import { CmsStoreModule } from './core/reducers/cmsStore.module';
import { CmsAuthService } from './core/services/cmsAuth.service';


declare module "@angular/core" {
  interface ModuleWithProviders<T = any> {
    ngModule: Type<T>;

  }
}
function appInitializer(authService: CmsAuthService) {
  return () => {
    return new Promise((resolve) => {
      //@ts-ignore
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}
export function CreateTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}
export const CUSTOM_MAT_COLOR_FORMATS: MatColorFormats = {
  display: {
    colorInput: 'hex'
  }
}
export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  decimal: ",",
  precision: 0,
  prefix: "",
  suffix: "",
  thousands: " "
};
@NgModule({
  declarations: [
    AppComponent
  ],
  bootstrap: [
    AppComponent
  ],
  imports: [
    //BrowserModule,//.withServerTransition({ appId: 'serverApp' }),
    //BrowserAnimationsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en'
    }),
    // TranslateModule.forRoot({
    //   isolate: true,
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: (CreateTranslateLoader),
    //     deps: [HttpClient]
    //   }
    // }),
    // TranslateModule.forChild({
    //   loader: { provide: TranslateLoader, useClass: CustomLoader },
    //   compiler: { provide: TranslateCompiler, useClass: CustomCompiler },
    //   parser: { provide: TranslateParser, useClass: CustomParser },
    //   missingTranslationHandler: { provide: MissingTranslationHandler, useClass: CustomHandler },
    //   isolate: true
    // }),
    //SharedModule.forRoot(),
    ToastrModule.forRoot({
      // timeOut: 0,
      timeOut: 5000,
      enableHtml: true,
      positionClass: 'toast-bottom-right',
      // positionClass: "toast-bottom-full-width",
      preventDuplicates: true,
      closeButton: true,
      // extendedTimeOut: 0,
      extendedTimeOut: 1000,
    }),

    CmsStoreModule.forRoot(),
    AppRoutingModule,
    NgbModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    RouterModule,
    ComponentsModule
  ],
  providers: [
    //provideHttpClient(),
    provideHttpClient(withInterceptorsFromDi()),
    CoreAuthService,
    CoreEnumService,
    CoreModuleService,
    CoreConfigurationService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [CmsAuthService],
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [13]
      }
    },
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
    { provide: MAT_COLOR_FORMATS, useValue: CUSTOM_MAT_COLOR_FORMATS },
  ]
})
export class AppModule { }
