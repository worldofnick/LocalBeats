import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-negotiate-dialog',
  templateUrl: './negotiate-dialog.component.html',
  styleUrls: ['./negotiate-dialog.component.css']
})
export class NegotiateDialogComponent implements OnInit {
  negotiationForm: FormGroup;
  buttonText: string = "Accept";
  initialPrice: number;
  negotiable: boolean;
  title: string = "Offer";
  subtext: string = "Please enter your bid or accept the current price:";

  constructor(
    public dialogRef: MatDialogRef<NegotiateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.negotiable = this.data.negotiable;
    this.negotiationForm = this.formBuilder.group({
      price: new FormControl({value: this.data.currentPrice, disabled: !this.negotiable}, Validators.required)
    });
    this.initialPrice = this.data.currentPrice;

    if(this.negotiable) {
      this.title = "Offer";
      this.subtext = "Please enter your bid or accept the current price:"
    } else {
      this.title = "Offer";
      this.subtext = "Are you sure you want to apply?"
    }

  }

  accept() {
    if(this.negotiationForm.get('price').value != this.initialPrice) {
      this.dialogRef.close({accepted: 'new', price: this.negotiationForm.get('price').value});
    } else {
      this.dialogRef.close({accepted: 'accepted', price: this.negotiationForm.get('price').value});
    }
  }

  decline() {
    this.dialogRef.close({accepted: 'declined'});
  }

  onPriceChange(){
    if(this.negotiationForm.get('price').value != this.initialPrice) {
      this.buttonText = "Bid"
    } else {
      this.buttonText = "Accept";
    }
  }

}
