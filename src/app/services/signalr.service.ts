import { Injectable, EventEmitter } from '@angular/core';
import 'jquery';
import { HubConnection } from 'signalr';
import { NgZone } from '@angular/core';
import { GlobalService } from './global.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog.component';

declare var jQuery: any;
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  // All the emitters for the received messages.

  connectionEstablished = new EventEmitter<boolean>();
  connectionEstablishing = new EventEmitter<boolean>();
  connectionError = new EventEmitter<boolean>();
  addReceived = new EventEmitter<any>();
  deleteReceived = new EventEmitter<any>();
  updateReceived = new EventEmitter<any>();
  towsReceived = new EventEmitter<any>();
  allowActual = new EventEmitter<boolean>();
  configCallBack = new EventEmitter<boolean[]>();
  loggedIn = new EventEmitter<boolean>();
  loggedOut = new EventEmitter<boolean>();
  forceLogoout = new EventEmitter<any>();

 // private connectionIsEstablished = false;
  private hubConnection: HubConnection;
  private proxy;
  public disableAccess = true;

  constructor(private zone: NgZone, public globals: GlobalService, public dialog: MatDialog) {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  private createConnection(): any {
    const that = this;
    // The hub URL is set in index.html to make it easier edit for runtime requirements
    this.hubConnection = $.hubConnection(window.localStorage.getItem('hubURL'));
    this.proxy = this.hubConnection.createHubProxy('TowHub');

    this.hubConnection.reconnecting(() => {
      that.connectionEstablishing.emit(true);
    });
    this.hubConnection.reconnected(() => {
      that.connectionEstablished.emit(true);
    });
    this.hubConnection.disconnected(() => {
      that.connectionError.emit(true);
    });
  }
  private registerOnServerEvents(): void {

    const that = this;

    this.proxy.on('ForceLogout', () => {
      this.forceLogoout.emit();
      this.zone.run(() => { });
    });
    this.proxy.on('Add', (data: any) => {
      if (that.disableAccess) {
        return;
      }
      this.addReceived.emit(data);
      this.zone.run(() => { });
    });
    this.proxy.on('Update', (data: any) => {
      if (that.disableAccess) {
        return;
      }
      this.updateReceived.emit(data);
      this.zone.run(() => { });
    });
    this.proxy.on('Delete', (data: any) => {
      if (that.disableAccess) {
        return;
      }
      this.deleteReceived.emit(data);
      this.zone.run(() => { });
    });
    this.proxy.on('AllTows', (data: any) => {
      if (that.disableAccess) {
        return;
      }
      this.towsReceived.emit(data);
      this.zone.run(() => { });
    });
  }
  private startConnection(): void {
    const that = this;
    that.connectionEstablishing.emit(true);

    this.hubConnection
      .start()
      .then(() => {
        this.connectionEstablished.emit(true);
        this.zone.run(() => { });
      })
      // tslint:disable-next-line:variable-name
      .catch( (_err: any) => {
        setTimeout(() => { that.startConnection(); }, 5000);
        this.zone.run(() => { });
      });
  }

  public getTows(from: any, to: any): any {
    if (this.disableAccess) {
      return;
    }
    const that = this;
    this.proxy.invoke('getTows', from, to).done((tows) => {
      that.towsReceived.emit(tows);
      that.zone.run(() => { });
    }).fail((error) => {
      console.log('Invocation of getTows failed. Error: ' + error);
    });
  }

  public getTowsForDateRange(rangeDateFrom: any, rangeDateTo: any, type: any): any {
    const that = this;

    this.proxy.invoke('getTowsForDateRange', rangeDateFrom, rangeDateTo, type).done((tows) => {
      that.towsReceived.emit(tows);
      that.zone.run(() => { });
    }).fail((error) => {
      console.log('Invocation of getTowsForDateRange failed. Error: ' + error);
    });
  }

  public updateActualStart(start: any, id: any): any {
    if (this.disableAccess) {
      return;
    }
    const that = this;
    this.proxy.invoke('UpdateActualStart', start, id).done((msg: string) => {
      if (msg !== 'OK') {
        alert(msg);
      }
    }).fail((error) => {
      console.log('Invocation of updateActual Start failed. Error: ' + error);
    });
  }

  public updateActualEnd(end: any, id: any): any {
    if (this.disableAccess) {
      return;
    }
    const that = this;
    this.proxy.invoke('UpdateActualEnd', end, id).done((msg: string) => {
      if (msg !== 'OK') {
        alert(msg);
      }
    }).fail((error) => {
      console.log('Invocation of updateActualEnd failed. Error: ' + error);
    });
  }

  public updateReadyState(state: any, id: any): any {
    if (this.disableAccess) {
      return;
    }
    const that = this;
    this.proxy.invoke('UpdateReadyState', state, id).done((tows) => {

    }).fail((error) => {
      console.log('Invocation of UpdateReadyState failed. Error: ' + error);
    });
  }

  public login(id: string, token: string): any {
    this.globals.id = id;
    this.globals.token = token;
    const that = this;
    this.proxy.invoke('Login', id, token).done((data) => {
      that.globals.blinkBeforeStart = data.BlinkBeforeStart;
      if (!data.View && !data.Edit) {
        const dialogRef = that.dialog.open(ConfirmationDialogComponent, {
          data: {
            message: 'Login incorrect or no configured edit capability'
          },
          disableClose: true
        });
        dialogRef.afterClosed().subscribe((confirmed: any) => {
          that.loggedIn.emit(false);
        });
        that.disableAccess = true;
        that.globals.userStatus = 'No Access';
      } else if (!data.Edit) {

        const dialogRef = that.dialog.open(ConfirmationDialogComponent, {
          data: {
            message: 'Login Successful. View Access Only'
          },
          disableClose: true
        });
        dialogRef.afterClosed().subscribe((confirmed: any) => {
          that.disableAccess = false;
          that.loggedIn.emit(true);
        });
        that.globals.userStatus = 'No Edit Access';
      } else if (data.Edit) {
        that.disableAccess = false;
        that.loggedIn.emit(true);
        that.allowActual.emit(true);
        that.globals.userStatus = 'Logged In';
      }
      that.zone.run(() => { });
    }).fail((error) => {
      console.log('Invocation of Login failed. Error: ' + error);
      that.allowActual.emit(false);
      that.zone.run(() => { });
    });
  }

  public checkEnableReady(): any {
    const that = this;
    this.proxy.invoke('EnableReady').done((config: boolean[]) => {
      that.configCallBack.emit(config);
    }).fail((error) => {
      that.configCallBack.emit([false, false, false]);
      console.log('Invocation of Enable Ready failed. Error: ' + error);
    });
  }

  public logout(): any {
    const that = this;
    that.disableAccess = true;
    this.proxy.invoke('Logout', this.globals.id, this.globals.token).done((data) => {
      //  that.allowActual.emit(false);
      //  that.loggedOut.emit(true);
    }).fail((error) => {
      //  that.allowActual.emit(false);
      //  that.loggedOut.emit(true);
    });
    that.allowActual.emit(false);
    that.loggedOut.emit(true);
    this.globals.userStatus = 'Logged Out';
    this.globals.id = null;
    this.globals.token = null;
    that.zone.run(() => { });
  }
  public getTowsOneOff(from: any, to: any): any {
    if (this.disableAccess) {
      return;
    }
    const that = this;
    this.proxy.invoke('getTowsOneOff', from, to).done((tows) => {
      that.towsReceived.emit(tows);
      that.zone.run(() => { });
    }).fail((error) => {
      console.log('Invocation of getTowsOneOff failed. Error: ' + error);
    });
  }
}
