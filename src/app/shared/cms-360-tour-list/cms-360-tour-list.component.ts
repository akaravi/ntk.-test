import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import 'ngx-ntk-pannellum/src/js/libpannellum';
import 'ngx-ntk-pannellum/src/js/pannellum';
import { File360TourDefaultModel, File360TourHotSpotModel, File360TourModel, File360TourScenesModel, File360ViewModel, FormInfoModel } from 'ntk-cms-api';
import { NodeInterface, TreeModel } from 'ntk-cms-filemanager';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { ProgressSpinnerModel } from 'src/app/core/models/progressSpinnerModel';
import { CmsToastrService } from 'src/app/core/services/cmsToastr.service';
// eslint-disable-next-line no-var
declare var pannellum: any;
export class PostionViewModel {
  viewerGetYaw: 0;
  viewerGetPitch: 0;
  clickGetYaw: 0;
  clickGetPitch: 0;
}
@Component({
  selector: 'app-cms-360-tour-list',
  templateUrl: './cms-360-tour-list.component.html'
})
export class Cms360TourListComponent implements OnInit {
  static nextId = 0;
  id = ++Cms360TourListComponent.nextId;
  constructor(private cmsToastrService: CmsToastrService,
    public publicHelper: PublicHelper,
    public translate: TranslateService,
  ) {
    this.fileManagerTree = this.publicHelper.GetfileManagerTreeConfig();

  }
  getGuid(): string {
    return Math.floor(Math.random() * 1000) + "";
  }

  public scenesList: File360TourScenesModel[] = [];
  public dataDetailModel: File360TourScenesModel = new File360TourScenesModel();
  privateDataModel: File360TourModel;
  @Output() dataModelChange: EventEmitter<File360TourModel> = new EventEmitter<File360TourModel>();
  @Input() set dataModel(model: File360TourModel) {
    if (!model) {
      model = new File360TourModel();
    }
    if (!model.defaultValue)
      model.defaultValue = new File360TourDefaultModel();
    if (!model.scenes)
      model.scenes = new Map<string, File360TourScenesModel>();
    this.scenesList = [];


    Object.keys(model.scenes).map(key => {
      model.scenes[key].guid = this.getGuid();
      this.scenesList.push(model.scenes[key]);
    });
    this.scenesList.forEach(element => {
      if (!element.hotSpots)
        element.hotSpots = [];
      element.hotSpots.forEach(h => {
        h.guid = this.getGuid();
      });
    });
    this.privateDataModel = model;
    this.tabledataSource.data = this.scenesList;
    this.tableHotSpotdataSource.data = [];
  }
  get dataModel(): File360TourModel {
    return this.privateDataModel;
  }
  @Input() set dataImageModel(model: File360ViewModel[]) {
    if (!model) {
      model = [];
    }
    this.privateDataImageModel = model;
  }
  privateDataImageModel: File360ViewModel[];
  formInfo: FormInfoModel = new FormInfoModel();
  loading = new ProgressSpinnerModel();
  loadingOption = new ProgressSpinnerModel();
  tabledataSource = new MatTableDataSource<File360TourScenesModel>();
  tableHotSpotdataSource = new MatTableDataSource<File360TourHotSpotModel>();
  tabledisplayedColumns = ['linkFileId', 'panorama', 'Title', 'Action'];
  tableHotspotDisplayedColumns = ['type', 'sceneIdSelector', 'text', 'url', 'pitch', 'yaw', 'Action'];

  selectFileTypeReport = ['jpeg', 'jpg'];

  fileManagerTree: TreeModel;
  appLanguage = 'fa';

  showAddView360 = false;
  fileManagerOpenFormReport = false;

  ngOnInit(): void {
    this.translate.get('TITLE.Edit').subscribe((str: string) => { this.formInfo.formTitle = str; });
  }

  @ViewChild('container') container: ElementRef;
  viewer: any;
  options: any;
  postionView: PostionViewModel;


  ngAfterViewInit(): void {
    this.container.nativeElement.style.display = 'none';
  }
  uniqByReduce<T>(array: T[]) {
    const result: T[] = [];
    array.forEach((item) => {
      if (!result.includes(item) && result.filter(x => x['pitch'] == item['pitch'] && x['yaw'] == item['yaw']).length == 0) {
        result.push(item);
      }
    })
    return result;
  }
  actionPannellumImageLoad(str: string, hotSpots: File360TourHotSpotModel[]): void {
    const defaultOptions = {
      "type": "equirectangular",//equirectangular, cubemap, or multires.
      "panorama": str,
      "autoLoad": true,
      "autoRotate": 1.5,
      "crossOrigin": "anonymous"
    };
    if (hotSpots && hotSpots.length > 0) {
      defaultOptions['hotSpots'] = this.uniqByReduce(hotSpots);
    }
    const combinedOptions = Object.assign({}, defaultOptions, this.options);
    if (this.viewer)
      this.onActionPannellumDestroy();
    this.viewer = pannellum.viewer(this.container.nativeElement, combinedOptions);
    this.container.nativeElement.style.display = 'block';
  }
  actionPannellumTourLoadClick = false;
  actionPannellumTourLoad(): void {
    this.actionPannellumTourLoadClick = true;
    this.actionPrivateDataModelOptimaze();
    const defaultOptions = {};
    defaultOptions['default'] = this.privateDataModel.defaultValue;
    if (this.privateDataModel && this.privateDataModel.scenes) {
      defaultOptions['scenes'] = this.privateDataModel.scenes;
    }
    const combinedOptions = Object.assign({}, defaultOptions, this.options);
    if (this.viewer)
      this.onActionPannellumDestroy();
    this.viewer = pannellum.viewer(this.container.nativeElement, combinedOptions);
    this.container.nativeElement.style.display = 'block';
  }
  onActionPannellumClick(e): void {
    if (!this.viewer)
      return;
    if (this.actionPannellumTourLoadClick) {
      this.actionPannellumTourLoadClick = false;
      return;
    }
    this.postionView = new PostionViewModel();
    this.postionView.viewerGetYaw = this.viewer.getYaw();
    this.postionView.viewerGetPitch = this.viewer.getPitch();
    const coords = this.viewer.mouseEventToCoords(e);
    if (!coords || coords.length == 0)
      return;
    this.postionView.clickGetYaw = coords[1];
    this.postionView.clickGetPitch = coords[0];
  }

  onActionPannellumDestroy(): void {
    this.container.nativeElement.style.display = 'none';
    this.postionView = null;
    if (this.viewer)
      this.viewer.destroy();
  }

  onActionPannellumClickLastPoint(): void {
    if (this.postionView && (this.postionView.clickGetYaw != 0 || this.postionView.clickGetPitch != 0)) {
      this.editHotspot.yaw = this.postionView.clickGetYaw;
      this.editHotspot.pitch = this.postionView.clickGetPitch;
    }
  }
  onActionFileSelect(model: NodeInterface): void {
    if (!model || !model.id || model.id === 0) {
      this.cmsToastrService.typeErrorSelectedRow();
      return;
    }
    this.dataDetailModel.linkFileId = model.id;
    this.dataDetailModel.panorama = model.downloadLinksrc;
    this.dataDetailModel.preview = model.downloadLinksrc;
    this.actionPannellumImageLoad(this.dataDetailModel.panorama, []);
  }

  onActionSubmitView360(): void {

    if (!this.dataDetailModel.linkFileId || this.dataDetailModel.linkFileId <= 0) {
      this.cmsToastrService.typeErrorMessage('فایل انتخاب نشده');
    }
    if (!this.scenesList) {
      this.scenesList = [];
    }
    if (this.selectIndex >= 0) {
      this.scenesList[this.selectIndex] = this.dataDetailModel;
    }
    else {
      this.scenesList.push(this.dataDetailModel);
    }

    this.actionPrivateDataModelOptimaze();
    this.dataModelChange.emit(this.privateDataModel);
    this.showAddView360 = !this.showAddView360;
    this.selectIndex = -1;
    this.onActionPannellumDestroy();
  }
  actionPrivateDataModelOptimaze() {
    if (!this.privateDataModel.defaultValue)
      this.privateDataModel.defaultValue = new File360TourDefaultModel();
    this.privateDataModel.scenes = new Map<string, File360TourScenesModel>;
    if (!this.scenesList)
      this.scenesList = [];
    this.scenesList.forEach(element => {
      if (element.title && element.title.length > 0) {
        const hotSpots: File360TourHotSpotModel[] = [];
        if (!element.hotSpots)
          element.hotSpots = [];
        element.hotSpots.forEach(elementHotspot => {
          if (elementHotspot.type && elementHotspot.type.length > 0)
            hotSpots.push(elementHotspot);
        });
        element.hotSpots = this.uniqByReduce(hotSpots);
        this.privateDataModel.scenes[element.linkFileId] = element;
        this.privateDataModel.scenes[element.linkFileId].hfov = 110;
      }
    });

    if (!this.privateDataModel.defaultValue.firstScene || this.privateDataModel.defaultValue.firstScene.length == 0) {
      if (this.privateDataModel.scenes && this.scenesList && this.scenesList.length > 0)
        this.privateDataModel.defaultValue.firstScene = this.scenesList[0].linkFileId + "";
      this.privateDataModel.defaultValue.sceneFadeDuration = 1000;
    }
  }
  onActionCancellView360(): void {
    this.showAddView360 = false;
    this.onActionPannellumDestroy();
  }
  onActionShowView360Add(): void {
    this.dataDetailModel = new File360TourScenesModel();
    this.showAddView360 = !this.showAddView360;
    this.tableHotSpotdataSource.data = [];
  }
  inAddhotspotGuid = '';
  onActionShowHotspotAdd(): void {

    if (!this.dataDetailModel)
      this.dataDetailModel = new File360TourScenesModel();
    if (!this.dataDetailModel.hotSpots)
      this.dataDetailModel.hotSpots = [];
    this.editHotspot = new File360TourHotSpotModel();
    const hotspot = new File360TourHotSpotModel();

    hotspot.guid = this.getGuid();
    this.inAddhotspotGuid = hotspot.guid;
    this.dataDetailModel.hotSpots.push(hotspot);
    this.tableHotSpotdataSource.data = this.uniqByReduce(this.dataDetailModel.hotSpots);
    this.newROw(hotspot);
    this.onActionPannellumClickLastPoint();
  }
  onActionOptionRemoveView360(index: number): void {
    if (index < 0) {
      return;
    }
    if (!this.scenesList || this.scenesList.length === 0) {
      return;
    }
    this.scenesList.splice(index, 1);
    this.actionPrivateDataModelOptimaze();
    this.dataModel = this.privateDataModel;
    this.dataModelChange.emit(this.privateDataModel);
    this.onActionPannellumDestroy();
  }
  selectIndex = -1;
  onActionOptionEditView360(index: number): void {
    if (index < 0) {
      return;
    }
    if (!this.scenesList || this.scenesList.length === 0) {
      return;
    }
    this.dataDetailModel = this.scenesList[index];
    if (!this.dataDetailModel.hotSpots)
      this.dataDetailModel.hotSpots = [];

    this.actionPannellumImageLoad(this.dataDetailModel.panorama, this.dataDetailModel.hotSpots);
    this.oldHotspot = new File360TourHotSpotModel();
    this.editHotspot = new File360TourHotSpotModel();
    this.tableHotSpotdataSource.data = this.uniqByReduce(this.dataDetailModel.hotSpots);
    this.selectIndex = index;
    this.showAddView360 = !this.showAddView360;
  }
  editHotspot: File360TourHotSpotModel; oldHotspot: File360TourHotSpotModel; editdisabled: boolean
  newROw(usr: File360TourHotSpotModel) {
    //console.log(usr)
    this.editHotspot = usr && usr.guid ? usr : new File360TourHotSpotModel();
    this.oldHotspot = { ...this.editHotspot };
  }
  editROw(usr: File360TourHotSpotModel) {
    //console.log(usr)
    this.editHotspot = usr && usr.guid ? usr : new File360TourHotSpotModel();
    this.oldHotspot = { ...this.editHotspot };
    this.inAddhotspotGuid = '';
  }
  removeROw(usr: File360TourHotSpotModel) {
    const indexId = this.dataDetailModel.hotSpots.findIndex(x => x.guid == usr.guid);
    if (indexId >= 0) {
      this.dataDetailModel.hotSpots.splice(indexId, 1);
      this.tableHotSpotdataSource.data = this.uniqByReduce(this.dataDetailModel.hotSpots);
    }
  }
  updateEdit() {
    //updateEdit
    this.inAddhotspotGuid = '';
    this.editdisabled = true;
    const indexId = this.dataDetailModel.hotSpots.findIndex(x => x.guid == this.oldHotspot.guid);
    if (indexId >= 0)
      this.dataDetailModel.hotSpots[indexId] = this.editHotspot;
    this.editdisabled = false;
    this.oldHotspot = new File360TourHotSpotModel();
    this.editHotspot = new File360TourHotSpotModel();
  }
  cancelEdit() {
    //cancel
    if (this.inAddhotspotGuid?.length > 0) {
      this.dataDetailModel.hotSpots = this.dataDetailModel.hotSpots.filter(x => x.guid != this.inAddhotspotGuid);
    }
    this.editHotspot = new File360TourHotSpotModel();
    if (this.oldHotspot && this.oldHotspot.guid) {
      if (!this.dataDetailModel.hotSpots)
        this.dataDetailModel.hotSpots = [];
      this.tableHotSpotdataSource.data = this.uniqByReduce(this.dataDetailModel.hotSpots);
    }
  }
  onActionImportFile360View(): void {
    if (this.privateDataImageModel && this.privateDataImageModel.length > 0) {
      this.actionPrivateDataModelOptimaze();
      this.privateDataImageModel.forEach(element => {
        if (!this.privateDataModel.scenes[element.linkFileId] && element.linkFileId > 0) {
          const scense = new File360TourScenesModel();
          scense.guid = this.getGuid();
          scense.linkFileId = element.linkFileId;
          scense.title = element.title
          scense.hotSpots = this.uniqByReduce(element.hotSpots);
          scense.panorama = element.panorama;
          scense.preview = element.preview;
          scense.hfov = 110;
          this.privateDataModel.scenes[element.linkFileId] = scense;
        }
      });
      this.dataModel = this.privateDataModel;
    }
  }
}

