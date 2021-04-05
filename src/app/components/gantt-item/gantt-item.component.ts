import { MessengerService } from 'src/app/services/messenger.service';
import { GlobalsService } from '../../services/globals.service';
import { Component, AfterViewInit, HostListener, NgZone, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import * as moment from 'moment';
import * as $ from 'jquery';
import { AppComponent } from 'src/app/app.component';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { fromEvent, Subscription } from 'rxjs';

@Component({
    templateUrl: './gantt-item.component.html',
    styleUrls: ['./gantt-item.component.scss']
})
export class GanttRendererComponent implements ICellRendererAngularComp, AfterViewInit {
    public flights: any;
    public counter: any;
    public html: any;

    public zone: NgZone;
    public res: string[] = [];
    public start: number[] = [];
    public width: number[] = [];
    public record: any[] = [];
    public sub: Subscription;

    @ViewChild('userMenu') userMenu: TemplateRef<any>;

    overlayRef: OverlayRef | null;
    constructor(
        public globals: GlobalsService, 
        public messenger: MessengerService,
        public overlay: Overlay,
        public viewContainerRef: ViewContainerRef) {

        const that = this;
        messenger.updateNow$.subscribe(
            data => {
                that.calcBarParams();
            }
        );

    }
    agInit(params: any): void {

        try {
        this.counter = params.data.code;
        this.flights = params.data.assignments.flights;
        } catch (Exception){
            this.flights = null;
        }
    }

    ngAfterViewInit() {

        this.calcBarParams();

        // Update the hour markers on the gantt
        $('.hourIndicator').css('left', '0px');

        // // Hour markers
        const firstHour = this.globals.zeroTime.hour();
        const minutesLeftInFirstHour = 60 - this.globals.zeroTime.minutes();
        const firstOffSet = minutesLeftInFirstHour * this.globals.minutesPerPixel;

        let hour = firstHour + 1;

        let offset = 0;
        let i = 0;
        do {
            const val = hour++ % 24;
            offset = 60 * this.globals.minutesPerPixel * i + firstOffSet;
            const clazz = '.' + i + 'Hour';
            $(clazz).css('left', offset + 'px');
            i++;
        } while (offset < window.innerWidth - 100);

        // Now Marker
        const origin = moment().diff(this.globals.zeroTime, 'minutes');
        const nowLeft = origin * this.globals.minutesPerPixel;
        $('.nowIndicator').css('left', nowLeft + 'px');
    }

    calcBarParams() {
        const minutePerPixel = this.globals.minutesPerPixel;

        // Clear existing entries for the counter
        this.start = [];
        this.width = [];
        this.res = [];
        this.record = [];

        // Calculate the new value for each allocation


        if (this.flights != null) {

            this.flights.forEach(el => {
                try {

                    el['counter'] = this.counter;
                    this.record.push(el);

                    const s = moment(el.startTime);
                    const e = moment(el.endTime);

                    this.res.push(el.airline + el.flightNumber+ ' @ ' + el.scheduleTime);


                    const s1 = s.diff(this.globals.zeroTime, 'minutes');
                    const stay = e.diff(s, 'minutes');

                    if (s1 < 0) {
                        this.start.push(0);
                        this.width.push(stay * minutePerPixel + s1 * minutePerPixel);
                    } else {
                        this.start.push(s1 * minutePerPixel);
                        this.width.push(stay * minutePerPixel);
                    }

                } catch (e) {
                    console.log(this.flights);
                }
            });
        }
    }

    refresh(params: any): boolean {
        this.agInit(params);
        this.ngAfterViewInit();
        return true;
    }

    getStart(index: number): number {
        if (index >= this.start.length) {
            return 0;
        }
        return this.start[index];
    }
    getWidth(index: number): number {
        if (index >= this.width.length) {
            return 0;
        }
        return this.width[index];
    }
    getRes(index: number): string {
        if (index >= this.res.length) {
            return '-';
        }
        return this.res[index];
    }

    deleteSingleAllocation(index: number){
        AppComponent.that.deleteAllocation(this.record[index]);
    }
    deleteFlightAllocation(index: number){
        AppComponent.that.deleteFlightAllocation(this.record[index]);
    }

    
    getClassArr(index: number) {

        const clazz = [];



        if (index >= this.start.length) {
            clazz.push('invisible');
            return clazz;
        }

        const record = this.record[index];
        const e = moment(record.end);
        const s1 = e.diff(this.globals.zeroTime, 'minutes');

        // The end of the allocation is before the origin time
        if (s1 <= 0) {
            clazz.push('invisible');
            return clazz;
        }

        clazz.push('single');
        clazz.push('visible');
        clazz.push('ganttItemArr');

        return clazz;
    }

}
