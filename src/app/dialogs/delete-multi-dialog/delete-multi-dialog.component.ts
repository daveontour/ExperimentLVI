import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  template: `
    <div class="modal-header" style="color:black">
      <h4 class="modal-title">Delete Multi Counter Allocation</h4>
    </div>
    <div class="modal-body" style="color:black" align="left">
    
    Delete Allocation <br/><br/>Counter: <strong>All Counters</strong><br>Flight: <strong>{{alloc.airline}}{{+alloc.flightNumber}}</strong><br/>Start Time: <strong>{{alloc.startTime}}</strong> <br/> End Time: <strong>{{alloc.endTime}}</strong>
    
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-outline-dark" (click)="button2Click()">Cancel</button>
    <button type="button" class="btn btn-outline-dark" (click)="button1Click()">Delete</button>
    </div>
  `
})
export class DeleteMultiDialogComponent  {

  @Input() alloc: any;

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  button1Click(): any {
    this.activeModal.close({ login: true, allocation:this.alloc});
  }
  button2Click(): any {
    this.activeModal.close({ login: false });
  }
}
