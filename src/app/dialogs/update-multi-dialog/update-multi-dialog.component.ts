import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">Update Counter Allocation for Flight</h4>
    </div>
    <div class="modal-body" style="color:black" align="left">
    
   <br/><br/>Counter: <strong>All Counters</strong><br>Flight: <strong>{{alloc.airline}}{{+alloc.flightNumber}}</strong><br/>Start Time: <strong>{{alloc.startTime}}</strong> <br/> End Time: <strong>{{alloc.endTime}}</strong>
    
    </div>

    <div class="modal-body" style="color:black" align="left">
    <table>

    <tr><td align="right" style="color:black;" >Date:&nbsp;</td><td> <input class="gridinput" id = "day"  style="width:150px;background-color:white; color:black" type="date"></td></tr>
    
    <tr><td align="right" style="color:black;" >Start Time:&nbsp;</td><td>
    <input [ngxTimepicker]="picker3" [format]="24" class="gridinput"  id = "start" style="height:25px;width:90px; font-size: 12px;">
    <ngx-material-timepicker #picker3 ></ngx-material-timepicker>
    </td></tr>
   
    <tr><td align="right" style="color:black;" >End Time:&nbsp;</td><td>
    <input [ngxTimepicker]="picker4" [format]="24" class="gridinput"  id = "end" style="height:25px;width:90px; font-size: 12px;">
    <ngx-material-timepicker #picker4 ></ngx-material-timepicker>
    </td></tr>

     </table>
</div>

    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button2Click()">Cancel</button>
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">Update</button>
    </div>
  `
})
export class UpdateMultiDialogComponent  {

  @Input() alloc: any;


  public day: string;
  public start: string;
  public end: string;


  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  button1Click(): any {
    this.day = $('#day').val().toString();
    this.start = $('#start').val().toString();
    this.end = $('#end').val().toString();
    this.activeModal.close({ login: true, day:this.day, start:this.start, end:this.end,allocation:this.alloc});
  }
  button2Click(): any {
    this.activeModal.close({ login: false });
  }
}
