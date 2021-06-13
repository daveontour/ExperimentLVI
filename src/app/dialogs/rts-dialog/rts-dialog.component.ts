import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">Download RTS Data</h4>
    </div>

    <table>

    <tr><td><label style="width:150px; color:black">From Date:&nbsp;</label></td><td> <input class="gridinput" id = "dayFrom"  style="width:150px;background-color:white; color:black" type="date"></td></tr>
    <tr><td><label style="width:150px; color:black">To Date:&nbsp;</label></td><td> <input class="gridinput" id = "dayTo"  style="width:150px;background-color:white; color:black" type="date"></td></tr>
    

     </table>

    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button2Click()">Cancel</button>
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">Download</button>
    </div>
  `
})
export class RTSDialogComponent  {

  @Input() alloc: any;


  public dayFrom: string;
  public dayTo: string;



  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  button1Click(): any {
    this.dayFrom = $('#dayFrom').val().toString();
    this.dayTo = $('#dayTo').val().toString();
    this.activeModal.close({ login: true, dayFrom:this.dayFrom, dayTo:this.dayTo});
  }
  button2Click(): any {
    this.activeModal.close({ login: false });
  }
}
