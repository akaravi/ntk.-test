import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';

import { LOCATION_INITIALIZED } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CmsAuthService } from '../services/cmsAuth.service';

export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient);
}

export function ApplicationInitializerFactory(translate: TranslateService, injector: Injector, authService: CmsAuthService) {
    return async (resolve) => {
        authService.getUserByToken().subscribe().add(resolve);
        await injector.get(LOCATION_INITIALIZED, Promise.resolve(null));

        const deaultLang = 'fa';
        translate.addLangs(['en', 'fa']);
        translate.setDefaultLang(deaultLang);
        try {
            await translate.use(deaultLang).toPromise();
        } catch (err) {
            console.log(err);
        }
        console.log(`Successfully initialized ${deaultLang} language.`);
    };
}