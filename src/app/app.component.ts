import { GlobalsService } from './services/globals.service';
import { SortableHeaderComponent } from './components/sortable-header/sortable-header.component';
import { GanttRendererComponent } from './components/gantt-item/gantt-item.component';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DirectorService } from './services/director.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgZone } from '@angular/core';
import * as moment from 'moment';

import AbstractXHRObject from 'sockjs-client/lib/transport/browser/abstract-xhr';
import * as $ from 'jquery';
import { AddAllocationDialogComponent } from './dialogs/add-allocation-dialog/add-allocation-dialog.component';
import { UploadFileDialogComponent } from './dialogs/upload-file-dialog/upload-file-dialog.component';
import { DeleteDialogComponent } from './dialogs/delete-dialog/delete-dialog.component';
import { UpdateDialogComponent } from './dialogs/update-dialog/update-dialog.component';
import { UpdateMultiDialogComponent } from './dialogs/update-multi-dialog/update-multi-dialog.component';
import { LoginDialogComponent } from './dialogs/login-dialog.component';
import { DeleteMultiDialogComponent } from './dialogs/delete-multi-dialog/delete-multi-dialog.component';
import {GenericAlertComponent} from './dialogs/generic-alert.component';
import {RTSDialogComponent} from './dialogs/rts-dialog/rts-dialog.component';

const _start = AbstractXHRObject.prototype._start;

AbstractXHRObject.prototype._start = function (method, url, payload, opts) {
  if (!opts) {
    opts = { noCredentials: true };
  }
  return _start.call(this, method, url, payload, opts);
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public title = 'Counter Allocation';
  public airport = '';
  public frameworkComponents: any;
  public rowData: any;
  public columnDefs: any;
  public context: any;
  public getRowNodeId: any;
  private gridApi: any;

  private passToken: string;
  public count = 0;

  public defaultColDef;

  public reconnectTask;

  public offsetFrom: number;
  public offsetTo: number;

  public rangeFrom: number;
  public rangeTo: number;
  public rangeDate = new Date();

  public showOnBlocks = true;
  public showDateRange = true;
  public enableDisplaySwitcher = false;
  public selectMode = 'Today';

  public zoomLevel = 11;

  public resources = [];


  public static that: any;

  public dateLoad = new Date();

  public darkTheme = {
    container: {
      bodyBackgroundColor: '#424242',
      buttonColor: '#fff'
    },
    dial: {
      dialBackgroundColor: '#555',
    },
    clockFace: {
      clockFaceBackgroundColor: '#555',
      clockHandColor: '#9fbd90',
      clockFaceTimeInactiveColor: '#fff'
    }
  };
  bigRefresh: any;

  constructor(
    private http: HttpClient,
    private director: DirectorService,
    public globals: GlobalsService,
    public zone: NgZone,
    private modalService: NgbModal
  ) {

    AppComponent.that = this;
    this.offsetFrom = this.globals.offsetFrom;
    this.offsetTo = this.globals.offsetTo;
    this.columnDefs = [
      {
        headerName: 'Counter',
        field: 'externalName',
        minWidth: 120,
        maxWidth: 120,
        enableCellChangeFlash: true,
        sortable: true,
        enableRowGroup: true,
        hide: false
      },
      {
        headerName: 'Counter  Allocation',
        colId: 'gantt',
        field: 'assignments',
        cellRenderer: 'ganttRenderer',
        resizable: true,
        minWidth: 500,
        maxWidth: 3000,
        headerComponent: 'sortableHeaderComponent',
        hide: false
      }
    ];
    this.defaultColDef = {
      sortable: true,
      filter: true
    };

    this.context = { componentParent: this };
    this.frameworkComponents = {
      ganttRenderer: GanttRendererComponent,
      sortableHeaderComponent: SortableHeaderComponent
    };


    this.getRowNodeId = (data: any) => {
      return data.externalName;
    };

  }
  getContextMenuItems(params) {


    var flights = params.node.data.assignments.flights;
    var counter = params.node.data.code;
    var result = [];

    result.push({
      // custom item
      name: 'View Allocations ',
      action: function () {
        AppComponent.that.openDeleteDialog(params.node.data);
      },
      cssClasses: ['redFont', 'bold'],
    })

    result.push('separator');

    if (flights != null) {
      flights.forEach(element => {
        element.counter = counter;
        result.push(
          {
            name: 'Delete Allocation: ' + element.airline + element.flightNumber + ' Start Time: ' + element.startTime + '  End Time: ' + element.endTime,
            action: function () {
              AppComponent.that.openDeleteDialog(element);
            },
            cssClasses: ['redFont', 'bold']

          }
        );
      });
    }


    return result;
  }


  refresh() {
    this.gridApi.setRowData();
    this.loadData();
  }

  changeOnBlocks() {
    this.loadData();
  }

  loadData() {
    this.loadResourcesHTTP();
    this.loadAllocationsHTTP();
  }

  modeSelectChange(): any {
    // this.rowData = [];
    // this.numRows = 0;
    // if (this.selectMode === 'Monitor') {
    //   this.globals.rangeMode = 'offset';
    //   this.displayMode = 'Monitor';
    //   this.setCurrentRange();
    // } else {
    //   this.globals.rangeMode = 'range';
    //   this.displayMode = 'Review';
    // }
  }

  loadResourcesHTTP() {
    this.http.get<any>(this.globals.serverURL + '/getResources').subscribe(data => {

      const itemsToUpdate = [];
      this.resources = data.resource;
      this.resources.forEach(x => {
        itemsToUpdate.push(x);
      });

      this.gridApi.updateRowData({ add: itemsToUpdate });
    });
  }

  loadAllocationsHTTP() {
    this.http.get<any>(this.globals.serverURL + '/getAllocations?from=' + this.globals.offsetFrom + '&to=' + this.globals.offsetTo + '').subscribe(data => {
      let resources = [];
      const itemsToUpdate = [];
      resources = data.resource;
      resources.forEach(allocation => {
        itemsToUpdate.push(allocation);
      });

      this.gridApi.updateRowData({ update: itemsToUpdate });

    });
  }

  logout() {
    this.loginDialog();
  }
  loginDialog(message = ''): any {

    const that = this;
    const modalRef = this.modalService.open(LoginDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.result.then((result) => {
      if (result.login) {

        // Validte the user is authenticated
        this.http.get<any>(this.globals.serverURL + '/validateAdminLogin?id=' + result.id + '&token=' + result.token + '').subscribe(data => {

          if (data.status == "SUCCESS"){
            this.loadData();
            this.gridApi.sizeColumnsToFit();
            that.airport = data.airport;
            that.passToken = data.token;
          } else {
            that.loginDialog();
          }

        });
      }
    });
  }

  openAddDialog(message = ''): any {

    const that = this;
    const modalRef = this.modalService.open(AddAllocationDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.counters = this.resources;
    modalRef.result.then((result) => {
      if (result.login) {
        this.http.get<any>(this.globals.serverURL + '/addAllocation?passToken='+that.passToken+'&first=' + result.first + '&last=' + result.last + '&day=' + result.day + '&start=' + result.start + '&end=' + result.end + '&airline=' + result.airline + '&flight=' + result.flight + '&sto=' + result.sto).subscribe(data => {
          if (data.status != 'OK'){
            var  failRef = this.modalService.open(GenericAlertComponent, { centered: true, size: 'md', backdrop: 'static' });
            failRef.componentInstance.title = 'Security Failure';
            failRef.componentInstance.message = 'Invalid or Expired security token.';
            failRef.componentInstance.message2 = 'Please login again';
            failRef.componentInstance.button1 = 'OK';
            failRef.componentInstance.showFooter = true;
            failRef.result.then((result)=> {
              that.loginDialog();
            })
            return;
          }
          
          this.gridApi.setRowData();
          this.loadData();
        });
      }
    });
  }

  updateAllocation(alloc: any){
    this.openUpdateDialog(alloc);
  }

  openUpdateDialog(alloc: any): any {

    const that = this;
    const modalRef = this.modalService.open(UpdateDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.alloc = alloc;
    modalRef.result.then((result) => {
      if (result.login) {
        this.http.get<any>(this.globals.serverURL + '/updateAllocation?passToken='+that.passToken+'&id='+result.allocation.id+'&day='+result.day+'&start='+result.start+'&end='+result.end).subscribe(data => {
          if (data.status != 'OK'){
            var  failRef = this.modalService.open(GenericAlertComponent, { centered: true, size: 'md', backdrop: 'static' });
            failRef.componentInstance.title = 'Security Failure';
            failRef.componentInstance.message = 'Invalid or Expired security token.';
            failRef.componentInstance.message2 = 'Please login again';
            failRef.componentInstance.button1 = 'OK';
            failRef.componentInstance.showFooter = true;
            failRef.result.then((result)=> {
              that.loginDialog();
            })
            return;
          }          
          this.gridApi.setRowData();
          this.loadData();
        });
      }
    });
  }

  updateFlightAllocation(alloc: any){
    this.openUpdateMultiDialog(alloc);
  }

  openUpdateMultiDialog(alloc: any): any {

    const that = this;
    const modalRef = this.modalService.open(UpdateMultiDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.alloc = alloc;
    modalRef.result.then((result) => {
      if (result.login) {
        this.http.get<any>(this.globals.serverURL + '/updateGroupAllocation?passToken='+that.passToken+'&id='+result.allocation.id+'&day='+result.day+'&start='+result.start+'&end='+result.end).subscribe(data => {
          if (data.status != 'OK'){
            var  failRef = this.modalService.open(GenericAlertComponent, { centered: true, size: 'md', backdrop: 'static' });
            failRef.componentInstance.title = 'Security Failure';
            failRef.componentInstance.message = 'Invalid or Expired security token.';
            failRef.componentInstance.message2 = 'Please login again';
            failRef.componentInstance.button1 = 'OK';
            failRef.componentInstance.showFooter = true;
            failRef.result.then((result)=> {
              that.loginDialog();
            })
            return;
          }          
          this.gridApi.setRowData();
          this.loadData();
        });
      }
    });
  }

  deleteAllocation(alloc: any){
    this.openDeleteDialog(alloc);
  }

  openDeleteDialog(alloc: any): any {

    const that = this;
    const modalRef = this.modalService.open(DeleteDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.alloc = alloc;
    modalRef.result.then((result) => {
      if (result.login) {
        this.http.get<any>(this.globals.serverURL + '/deleteAllocation?passToken='+that.passToken+'&id='+result.allocation.id).subscribe(data => {
          if (data.status != 'OK'){
            var  failRef = this.modalService.open(GenericAlertComponent, { centered: true, size: 'md', backdrop: 'static' });
            failRef.componentInstance.title = 'Security Failure';
            failRef.componentInstance.message = 'Invalid or Expired security token.';
            failRef.componentInstance.message2 = 'Please login again';
            failRef.componentInstance.button1 = 'OK';
            failRef.componentInstance.showFooter = true;
            failRef.result.then((result)=> {
              that.loginDialog();
            })
            return;
          }          
          this.gridApi.setRowData();
          this.loadData();
        });
      }
    });
  }

  deleteFlightAllocation(alloc: any){
    this.openDeleteFlightDialog(alloc);
  }

  openDeleteFlightDialog(alloc: any): any {

    const that = this;
    const modalRef = this.modalService.open(DeleteMultiDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.alloc = alloc;
    modalRef.result.then((result) => {
      if (result.login) {
        this.http.get<any>(this.globals.serverURL + '/deleteFlightAllocation?passToken='+that.passToken+'&id='+result.allocation.id).subscribe(data => {
          if (data.status != 'OK'){
            var  failRef = this.modalService.open(GenericAlertComponent, { centered: true, size: 'md', backdrop: 'static' });
            failRef.componentInstance.title = 'Security Failure';
            failRef.componentInstance.message = 'Invalid or Expired security token.';
            failRef.componentInstance.message2 = 'Please login again';
            failRef.componentInstance.button1 = 'OK';
            failRef.componentInstance.showFooter = true;
            failRef.result.then((result)=> {
              that.loginDialog();
            })
            return;
          }
          this.gridApi.setRowData();
          this.loadData();
        });
      }
    });
  }

  openViewDialog(row: any): any {

    const that = this;
    const modalRef = this.modalService.open(DeleteDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.row = row;
    modalRef.result.then((result) => {
      if (result.login) {
        alert("View Allocation");

      }
    });
  }

  openFileDialog(message = ''): any {

    const that = this;
    const modalRef = this.modalService.open(UploadFileDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.message = message;
    modalRef.result.then((result) => {
      if (result.login) {
        this.postFile(result.file);
      }
    });
  }

  openRTSDialog(message = ''): any {

    const that = this;
    const modalRef = this.modalService.open(RTSDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.message = message;
    modalRef.result.then((result) => {
      if (result.login) {
        window.location.href=this.globals.serverURL + '/downloadRTS?passToken='+this.passToken+'&from='+result.dayFrom+'&to='+result.dayTo ;
      }
    });
  }

  postFile(fileToUpload: File) {
    const that = this;
    const endpoint = this.globals.serverURL + '/postFile?passToken='+this.passToken+'';
    const formData: FormData = new FormData();
    formData.append('fileKey', fileToUpload, fileToUpload.name);
    this.http.post(endpoint, formData).subscribe(data => {
      this.gridApi.setRowData();
      this.loadData();
    });
  }

   ngOnInit() {
    const that = this;
    window.addEventListener("resize", function (e) {
      that.gridApi.sizeColumnsToFit();

    });
    this.loginDialog();

  }


  onGridReady(params) {
    this.gridApi = params.api;
  }

  displayModeChangeCallback(loadData = true) {
    if (loadData) {
      this.loadData();
    }
  }

  setRange() {
    if (this.selectMode == 'Today') {
      this.setCurrentRange();
    } else {
      this.setSelectedRange();
    }
  }

  setCurrentRange() {
    this.globals.rangeMode = 'offset';
    this.globals.offsetFrom = this.offsetFrom;
    this.globals.offsetTo = this.offsetTo;
    this.globals.zeroTime = moment().add(this.offsetFrom, 'minutes');
    this.director.minuteTick();

    this.loadAllocationsHTTP();
  }

  setSelectedRange() {

    this.globals.rangeMode = 'range';

    const mss = this.rangeDate + ' ' + this.rangeFrom;
    const ms = moment(mss, 'YYYY-MM-DD HH:mm');

    const mse = this.rangeDate + ' ' + this.rangeTo;
    const me = moment(mse, 'YYYY-MM-DD HH:mm');

    this.offsetFrom = ms.diff(moment(), 'm');
    this.offsetTo = me.diff(moment(), 'm');
    this.globals.offsetFrom = this.offsetFrom;
    this.globals.offsetTo = this.offsetTo;


    this.globals.zeroTime = moment().add(this.offsetFrom, 'minutes');
    this.director.minuteTick();

    this.loadAllocationsHTTP();

  }

  zoomChanged() {
    this.zoom(this.zoomLevel - 11)
  }

  zoom(d: number) {

    let x = this.globals.minutesPerPixelDefault;
    x = x + d * (0.1 * x);
    this.globals.minutesPerPixel = x;
    this.director.minuteTick();
  }

  getOffsetBulletClass() {
    if (this.globals.rangeMode === 'offset') {
      return 'show';
    } else {
      return 'hide';
    }
  }
}