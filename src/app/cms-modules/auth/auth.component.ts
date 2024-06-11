
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { CmsTranslationService } from 'src/app/core/i18n/translation.service';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  constructor(

    public publicHelper: PublicHelper,
    public translate: CmsTranslationService,
    private cdr: ChangeDetectorRef) {
    this.loading.cdr = this.cdr;
    this.loading.message = this.translate.instant('MESSAGE.Receiving_information');
    this.tesettt = this.translate.instant('ACTION.ABOUT');


  }
  loading = new ProgressSpinnerModel();
  today: Date = new Date();
  tesettt = 'gfjhgjh';
  showSplashModel = true;
  ngOnInit(): void {
    // this.translate.setDefaultLang('en');
    // this.translate.use('en');
    this.tesettt = this.translate.instant('ACTION.ABOUT');
    console.log('Translated WELCOME_MESSAGE:', this.tesettt);

    this.translate.get('ACTION.ABOUT').subscribe((translation: string) => {
      console.log('Translated HELLO_MESSAGE:', translation);
    });

    if (window.innerWidth < environment.cmsViewConfig.mobileWindowInnerWidth) {
      setTimeout(() => {
        this.showSplashModel = false;
        this.cdr.markForCheck();
      }, 5000);
    }

  }

}
