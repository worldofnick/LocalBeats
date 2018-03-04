import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import { ISubscription } from "rxjs/Subscription";
import { StripeService } from 'app/services/payments/stripe.service';
import { BookingService } from 'app/services/booking/booking.service';
import { SocketService } from 'app/services/chats/socket.service';
import { SocketEvent } from '../../../services/chats/model/event';
import { Booking, StatusMessages, NegotiationResponses, VerificationResponse, BookingType } from '../../../models/booking';
import { Notification } from '../../../models/notification';
import { Payment, PaymentStatus } from '../../../models/payment';

@Component({
  selector: 'app-refund-payment-dialog',
  templateUrl: './refund-payment-dialog.component.html',
  styleUrls: ['./refund-payment-dialog.component.css']
})
export class RefundPaymentDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RefundPaymentDialogComponent>, private stripeService: StripeService, public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(): void {
    this.stripeService.charge
    this.stripeService.refund(this.data.booking).then((success: boolean) => {
      this.dialogRef.close();
      if (success) {
        let snackBarRef = this.snackBar.open('Refund sent!', "", {
          duration: 1500,
        });
      } else {
        let snackBarRef = this.snackBar.open('Refund failed, please try again.', "", {
          duration: 1500,
        });
      }
    });
  }

}
