import { LOCATION_INITIALIZED } from '@angular/common';
import { Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CmsAuthService } from '../services/cmsAuth.service';
const LOCALIZATION_LOCAL_STORAGE_KEY = 'language';

export function appInitializerFactory(translate: TranslateService, injector: Injector, authService: CmsAuthService) {
  return () => new Promise<any>((resolve: any) => {
    authService.getUserByToken().subscribe().add(resolve);
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {

      const langToSet = localStorage.getItem(LOCALIZATION_LOCAL_STORAGE_KEY) || this.translate?.getDefaultLang() || 'fa';
      translate.setDefaultLang(langToSet);
      translate.use(langToSet).subscribe(() => {
        console.info(`Successfully initialized '${langToSet}' language.'`);
      }, err => {
        console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}
