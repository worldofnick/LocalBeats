import { Component, OnInit } from '@angular/core';
import { User } from 'app/models/user';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { EventService } from 'app/services/event.service';
import { print } from 'util';
import { Injectable } from '@angular/core';
import { Event } from 'app/models/event';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

  model:Event;
  user:User;

  constructor(private eventService: EventService, private userSerivce: UserService, private router: Router) { }
  
  ngOnInit() {
    this.user = this.userSerivce.user;
  }

 onCreateEvent(form: NgForm) {
    console.log("printing host id");
    // console.log(this.user._id);
    
    
    // const lastName = form.value.lastname;

    const eventName = form.value.eventName;
    const eventType = form.value.eventType;
    const eventGenre = form.value.eventGenre;
    const hostUID = form.value.hostUID;
    const hostEmail = form.value.hostemail;
    const performerUID = form.value.performerUID;
    const performerEmail = form.value.performerEmail;
    const address = form.value.address;
    // const fromDate = form.value.fromDate;
    // const toDate = form.value.toDate;
    const description = form.value.description;
    const fixedPrice = form.value.fixedPrice;
    // const hourlyRate: string
    // const deposit: string
    // const isBooked: string

    this.model.eventName = eventName;

    console.log("creating event: \n" );
    console.log(this.model);

    this.eventService.createEvent(this.model).then((event: Event) => {
      this.model = event;      
      this.eventService.event = this.model; 
      // this.router.navigate(['/profile']);
    });
  }
}
