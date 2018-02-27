import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';
import { UserService } from '../../../services/auth/user.service';
import { StripeService } from 'app/services/payments/stripe.service';

// Setup Stripe Dialog
@Component({
    selector: 'stripe-dialog',
    templateUrl: 'stripe-dialog.html',
  })
  export class StripeDialogComponent {
  
    constructor(
      public dialogRef: MatDialogRef<StripeDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, private stripeService: StripeService,
        private userService: UserService) { }
  
      ngOnInit() { }
    
      onOkClick(): void {
        this.stripeService.authorizeStripe(this.userService.user).then((url: string) => {
          window.location.href = url;
        });
      }
  
      onNoClick(): void {
        this.dialogRef.close();
      }
  
  }