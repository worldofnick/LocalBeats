import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";



@Component({
  selector: 'app-create-events',
  templateUrl: './create-events.component.html',
  styleUrls: ['./create-events.component.css']
})
export class CreateEventsComponent implements OnInit {
  formData = {}
  console = console;
  basicForm: FormGroup;
  event:Event;
  user:User;
  eventID;

  constructor(private route: ActivatedRoute, 
              private userService: UserService, 
              private bookingService: BookingService,
              private eventService: EventService,
              private router: Router
              ) { }
  
  ngOnInit() {

    this.user = this.userService.user;

    this.event = new Event;
    
    this.basicForm = new FormGroup({
      eventName: new FormControl('', [
        Validators.minLength(4),
        Validators.maxLength(40),
        Validators.required
      ]),
      eventType: new FormControl('', [
        Validators.required
      ]),
      eventPrice: new FormControl('', [
        // Validators.required,
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
    console.log("creating this event: ")
    
    this.event.eventName = this.basicForm.controls.eventName.value;
    this.event.eventGenre = this.basicForm.controls.eventGenre.value;
    this.event.eventType = this.basicForm.controls.eventType.value;
    console.log(this.event.eventName);

    this.event.hostUser = this.user;
    this.event.hostEmail = this.user.email;

    console.log(this.event);
    
    this.eventService.createEvent(this.event).then((newEvent: Event) => {
      this.event = newEvent;
      this.eventService.event = this.event;
      this.eventID = this.event._id;
      // this.router.navigate(['/single']);        
    });
  }
}


