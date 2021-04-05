import { DirectorService } from './services/director.service';
import { MessengerService } from './services/messenger.service';
import { GlobalsService } from './services/globals.service';

import { GenericAlertComponent } from './dialogs/generic-alert.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';


import { GanttRendererComponent } from './components/gantt-item/gantt-item.component';
import { SortableHeaderComponent } from './components/sortable-header/sortable-header.component';
import { SortableHeaderTimeMarkerComponent } from './components/sortable-header-time-marker/sortable-header-time-marker.component';

import {LoginDialogComponent} from './dialogs/login-dialog.component';


import { AddAllocationDialogComponent } from './dialogs/add-allocation-dialog/add-allocation-dialog.component';
import * as $ from "jquery";
import { UploadFileDialogComponent } from './dialogs/upload-file-dialog/upload-file-dialog.component';
import { DeleteDialogComponent } from './dialogs/delete-dialog/delete-dialog.component';
import { DeleteMultiDialogComponent } from './dialogs/delete-multi-dialog/delete-multi-dialog.component';

import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatSliderModule} from '@angular/material/slider';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: 
  [AppComponent, 
    LoginDialogComponent,
     GenericAlertComponent,
     GanttRendererComponent,
     SortableHeaderComponent,
     SortableHeaderTimeMarkerComponent,
     AddAllocationDialogComponent,
     UploadFileDialogComponent,
     DeleteDialogComponent,
     DeleteMultiDialogComponent ],
  imports: [
   BrowserModule,
   CommonModule,
   BrowserAnimationsModule,
   AgGridModule.withComponents([ CommonModule,
    GanttRendererComponent,
    SortableHeaderComponent]),
   HttpClientModule,
   FormsModule,
   MatMenuModule,
   MatIconModule,
   NgbModule,
   MatSliderModule,
   NgxMaterialTimepickerModule,
  ],
  providers: [ MessengerService, DirectorService, GlobalsService, ],
  bootstrap: [AppComponent],
  exports: [BrowserModule, MatMenuModule, MatIconModule, MatSliderModule],
  entryComponents: [  SortableHeaderTimeMarkerComponent, AddAllocationDialogComponent, UploadFileDialogComponent, DeleteDialogComponent,DeleteMultiDialogComponent,LoginDialogComponent, GenericAlertComponent ],
})
export class AppModule { }
