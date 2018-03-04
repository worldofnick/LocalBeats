import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import { ISubscription } from "rxjs/Subscription";
import { StripeService } from 'app/services/payments/stripe.service';
import { BookingService } from 'app/services/booking/booking.service';
import { SocketService } from 'app/services/chats/socket.service';
import { SocketEvent } from '../../../services/chats/model/event';
import { Booking, StatusMessages, NegotiationResponses, VerificationResponse, BookingType } from '../../../models/booking';
import { Notification } from '../../../models/notification';
import { Payment, PaymentStatus } from '../../../models/payment';
import { RefundPaymentDialogComponent } from '../refund-payment-dialog/refund-payment-dialog.component';

@Component({
  selector: 'app-payment-history-dialog',
  templateUrl: './payment-history-dialog.component.html',
  styleUrls: ['./payment-history-dialog.component.css']
})
export class PaymentHistoryDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RefundPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _socketService: SocketService, private stripeService: StripeService) { }
    socketSubscription: ISubscription;

    ngOnInit() {
      this.socketSubscription = this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
        .subscribe((notification: Notification) => {
          this.stripeService.getBookingPayments(notification.booking).then((payments: Payment[]) => {
            this.data.payments = payments;
          });
      });
    }
    
    ngOnDestroy() {
      this.socketSubscription.unsubscribe();
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
