import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import { StripeService } from 'app/services/payments/stripe.service';

@Component({
  selector: 'app-confirm-payment-dialog',
  templateUrl: './confirm-payment-dialog.component.html',
  styleUrls: ['./confirm-payment-dialog.component.css']
})
export class ConfirmPaymentDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmPaymentDialogComponent>, private stripeService: StripeService, public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(): void {
    this.stripeService.charge(this.data.booking, false).then((success: boolean) => {
      this.dialogRef.close();
      if (success) {
        let snackBarRef = this.snackBar.open('Payment sent!', "", {
          duration: 1500,
        });
      } else {
        let snackBarRef = this.snackBar.open('Payment failed, please try again.', "", {
          duration: 1500,
        });
      }
    });
  }

}
