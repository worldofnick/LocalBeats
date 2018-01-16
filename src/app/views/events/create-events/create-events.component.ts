import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { User } from '../../../models/user';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-create-events',
  templateUrl: './create-events.component.html',
  styleUrls: ['./create-events.component.css']
})
export class CreateEventsComponent implements OnInit {
  formData = {}
  console = console;
  basicForm: FormGroup;
  selectedValue: string = 'pizza';
  foods = [
    { value: 'steak', viewValue: 'Steak' },
    { value: 'pizza', viewValue: 'Pizza' },
    { value: 'tacos', viewValue: 'Tacos' }
  ];

  constructor() { }

  ngOnInit() {

    let password = new FormControl('', Validators.required);
    let confirmPassword = new FormControl('', CustomValidators.equalTo(password));

    this.basicForm = new FormGroup({
      eventName: new FormControl('', [
        Validators.minLength(4),
        Validators.maxLength(40)
      ]),
      eventType: new FormControl('', [
        Validators.required
      ]),
      eventPrice: new FormControl('', [
        Validators.required,
      ]),
      eventGenre: new FormControl('', [
        Validators.required,
      ]),
      date: new FormControl(),
      agreed: new FormControl('', (control: FormControl) => {
        const agreed = control.value;
        if(!agreed) {
          return { agreed: true }
        }
        return null;
      })
    })


  }
  onCreateEvent(form: NgForm) {
    console.log("submitted")
    console.log(this.basicForm.controls.eventName.value);
    console.log(this.basicForm.controls.eventType.value);
    console.log(this.basicForm.controls.date.value);
    
  }
}


