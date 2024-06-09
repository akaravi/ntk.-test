
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CoreConfigurationService } from 'ntk-cms-api';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  constructor(
    private configService: CoreConfigurationService,
    public publicHelper: PublicHelper,
    private cmsToastrService: CmsToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef) {
    this.loading.cdr = this.cdr;
    translate.currentLang
    translate.use('fa');
    this.loading.message = this.translate.instant('MESSAGE.Receiving_information');



    this.tesettt = this.translate.instant('ACTION.ABOUT');


  }
  loading = new ProgressSpinnerModel();
  today: Date = new Date();
  tesettt = 'gfjhgjh';
  showSplashModel = true;
  ngOnInit(): void {
    if (window.innerWidth < environment.cmsViewConfig.mobileWindowInnerWidth) {
      setTimeout(() => {
        this.showSplashModel = false;
        this.cdr.markForCheck();
      }, 5000);
    }

  }

}
