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
  confirmationButton: string;
  buttonText: string = "Accept";
  initialPrice: number;

  constructor(
    public dialogRef: MatDialogRef<NegotiateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.negotiationForm = this.formBuilder.group({
      price: new FormControl(this.data.currentPrice, Validators.required)
    });
    this.initialPrice = this.data.currentPrice;

  }

  accept() {
    if(this.negotiationForm.get('price').value != this.initialPrice) {
      this.dialogRef.close(2);
    } else {
      this.dialogRef.close(0);
    }
  }

  decline() {
    this.dialogRef.close(1);
  }

  onPriceChange(){
    if(this.negotiationForm.get('price').value != this.initialPrice) {
      this.buttonText = "Propose New Price"
    } else {
      this.buttonText = "Accept";
    }
  }

}
