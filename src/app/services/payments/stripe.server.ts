// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Booking } from 'app/models/booking';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';
import { NegotiateDialogComponent } from '../../views/negotiate/negotiate-dialog/negotiate-dialog.component';

@Injectable()
export class StripeService {
}
