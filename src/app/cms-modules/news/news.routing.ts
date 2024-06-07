import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsCategoryMenuComponent } from './category/menu/menu.component';
import { NewsCommentListComponent } from './comment/list/list.component';
import { NewsContentAddComponent } from './content/add/add.component';
import { NewsContentEditComponent } from './content/edit/edit.component';
import { NewsContentListComponent } from './content/list/list.component';
import { NewsComponent } from './news.component';
const routes: Routes = [
  {
    path: '',
    component: NewsComponent,
    data: { title: 'ROUTE.NEWS' },

    children: [
      /* Config */
      {
        path: 'config',
        loadChildren: () =>
          import('./config/news-config.module').then((m) => m.NewsConfigModule),
        data: { title: 'ROUTE.NEWS' },
      },
      /* Config */
      {
        path: 'category',
        component: NewsCategoryMenuComponent,
        data: { title: 'ROUTE.NEWS.CATEGORY' },
      },
      {
        path: 'category/LinkParentId/:LinkParentId',
        component: NewsCategoryMenuComponent,
        data: { title: 'ROUTE.NEWS.CATEGORY' },
      },
      {
        path: 'content',
        component: NewsContentListComponent,
        data: { title: 'ROUTE.NEWS.CONTENT' },
      },
      {
        path: 'content/LinkCategoryId/:LinkCategoryId',
        component: NewsContentListComponent,
        data: { title: 'ROUTE.NEWS.CONTENT' },
      },

      {
        path: 'content/add/:CategoryId',
        component: NewsContentAddComponent,
        data: { title: 'ROUTE.NEWS.CONTENT' },
      },
      {
        path: 'content/edit/:Id',
        component: NewsContentEditComponent,
        data: { title: 'ROUTE.NEWS.CONTENT' },
      },
      {
        path: 'comment',
        component: NewsCommentListComponent,
        data: { title: 'ROUTE.NEWS.COMMENT' },
      },
      {
        path: 'comment/:ContentId',
        component: NewsCommentListComponent,
        data: { title: 'ROUTE.NEWS.COMMENT' },
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewsRouting { }
