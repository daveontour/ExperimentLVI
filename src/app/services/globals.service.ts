import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public minutesPerPixel = 1000 / 400;
  public minutesPerPixelDefault = 1000 / 400;
  public zeroTime = moment().subtract(120, 'm');
  public rangeMode = 'offset';
  public offsetFrom = -120;
  public offsetTo = 720;
  public airports: any;
  public serverURL = window.localStorage.getItem('serverURL');
  public serverWebRoot = 'http://localhost:8080';

  constructor() { }
}
