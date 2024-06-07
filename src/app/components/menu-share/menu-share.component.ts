import { Component, OnInit } from '@angular/core';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { ThemeStoreModel } from 'src/app/core/models/themeStoreModel';

@Component({
  selector: 'app-menu-share',
  templateUrl: './menu-share.component.html',
  styleUrls: ['./menu-share.component.scss']
})
export class MenuShareComponent implements OnInit {

  constructor(
    private publicHelper: PublicHelper,
  ) { }
  themeStore = new ThemeStoreModel();

  ngOnInit(): void {
    this.publicHelper.getReducerCmsStoreOnChange().subscribe((value) => {
      this.themeStore = value.themeStore;
    });
  }


}
