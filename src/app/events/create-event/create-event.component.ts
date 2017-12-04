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
    console.log(this.user._id);
  }

 onCreateEvent(form: NgForm) {
    console.log("printing host id");
    // console.log(this.user._id);
    
    
    // const lastName = form.value.lastname;
    const eventName = form.value.eventName;

    //TODO: only save the edited parts of the profile
    // this.model.email = email,
    // this.modelpassword: password,

    this.model.eventName = eventName;

    console.log("sending \n" );
    console.log(this.model);

    this.eventService.createEvent(this.model).then((event: Event) => {
      this.model = event;      
      this.eventService.event = this.model; 
      // this.router.navigate(['/profile']);
    });
  }
}
