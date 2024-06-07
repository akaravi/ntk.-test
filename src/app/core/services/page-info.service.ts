import { Injectable } from '@angular/core';
import { IApiCmsServerBase } from 'ntk-cms-api';
import { BehaviorSubject } from 'rxjs';
import { ContentInfoModel } from 'src/app/core/models/contentInfoModel';
import { PageLinkModel } from '../models/pageLinkModel';



@Injectable({
  providedIn: 'root',
})
export class PageInfoService {
  public title: BehaviorSubject<string> = new BehaviorSubject<string>(
    '.'
  );
  public description: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public breadcrumbs: BehaviorSubject<Array<PageLinkModel>> = new BehaviorSubject<
    Array<PageLinkModel>
  >([]);
  public contentService: BehaviorSubject<IApiCmsServerBase> = new BehaviorSubject<IApiCmsServerBase>(null);
  public contentInfo: BehaviorSubject<ContentInfoModel> = new BehaviorSubject<ContentInfoModel>(new ContentInfoModel('', '', false, '', ''));


  constructor() { }

  public setTitle(_title: string) {
    this.title.next(_title);
  }
  public updateTitle(_title: string) {
    setTimeout(() => {
      this.setTitle(_title);
    }, 1);
  }



  public setContentService(model: IApiCmsServerBase) {
    this.contentService.next(model);
  }
  public updateContentService(model: IApiCmsServerBase) {
    setTimeout(() => {
      this.setContentService(model);
    }, 1);
  }
  public setContentInfo(model: ContentInfoModel) {
    this.contentInfo.next(model);
  }
  public updateContentInfo(model: ContentInfoModel) {
    setTimeout(() => {
      this.setContentInfo(model);
    }, 1);
  }

  public setDescription(_title: string) {
    this.description.next(_title);
  }

  public updateDescription(_description: string) {
    setTimeout(() => {
      this.setDescription(_description);
    }, 1);
  }

  public setBreadcrumbs(_bs: Array<PageLinkModel>) {
    this.breadcrumbs.next(_bs);
  }

  public updateBreadcrumbs(_bs: Array<PageLinkModel>) {
    setTimeout(() => {
      this.setBreadcrumbs(_bs);
    }, 20);
  }

  public calculateTitle() {
    const asideTitle = this.calculateTitleInMenu('asideMenu');
    const headerTitle = this.calculateTitleInMenu('#kt_header_menu');
    const title = asideTitle || headerTitle || '';
    this.setTitle(title);
  }

  public calculateTitleInMenu(menuId: string): string | undefined {
    const menu = document.getElementById(menuId);
    if (!menu) {
      return;
    }

    const allActiveMenuLinks = Array.from<HTMLLinkElement>(
      menu.querySelectorAll('a.menu-link')
    ).filter((link) => link.classList.contains('active'));

    if (!allActiveMenuLinks || allActiveMenuLinks.length === 0) {
      return;
    }

    const titleSpan = allActiveMenuLinks[0].querySelector(
      'span.menu-title'
    ) as HTMLSpanElement | null;
    if (!titleSpan) {
      return;
    }

    return titleSpan.innerText;
  }

  public calculateBreadcrumbs() {
    const asideBc = this.calculateBreadcrumbsInMenu('asideMenu');
    const headerBc = this.calculateBreadcrumbsInMenu('#kt_header_menu');
    const bc = asideBc && asideBc.length > 0 ? asideBc : headerBc;
    if (!bc) {
      this.setBreadcrumbs([]);
      return;
    }
    this.setBreadcrumbs(bc);
  }

  public calculateBreadcrumbsInMenu(
    menuId: string
  ): Array<PageLinkModel> | undefined {
    const result: Array<PageLinkModel> = [];
    const menu = document.getElementById(menuId);
    if (!menu) {
      return;
    }

    const allActiveParents = Array.from<HTMLDivElement>(
      menu.querySelectorAll('div.menu-item')
    ).filter((link) => link.classList.contains('here'));

    if (!allActiveParents || allActiveParents.length === 0) {
      return;
    }

    allActiveParents.forEach((parent) => {
      const titleSpan = parent.querySelector(
        'span.menu-title'
      ) as HTMLSpanElement | null;
      if (!titleSpan) {
        return;
      }

      const title = titleSpan.innerText;
      const path = titleSpan.getAttribute('data-link');
      if (!path) {
        return;
      }

      result.push({
        title,
        path,
        isSeparator: false,
        isActive: false,
      });
      // add separator
      result.push({
        title: '',
        path: '',
        isSeparator: true,
        isActive: false,
      });
    });

    return result;
  }
}
