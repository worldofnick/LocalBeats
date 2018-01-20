import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-negotiate-dialog',
  templateUrl: './negotiate-dialog.component.html',
  styleUrls: ['./negotiate-dialog.component.css']
})
export class NegotiateDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<NegotiateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any
  ) {}

  ngOnInit() {
  }

}
