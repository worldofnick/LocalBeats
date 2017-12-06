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
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css']
})
export class MyEventsComponent implements OnInit {

  user:User;
  events:Event[];
  deleteStatus:Number;

  constructor(private eventService: EventService, private userService: UserService, private router: Router) { }
  
  ngOnInit() {
    this.user = this.userService.user;
    
    this.eventService.getEventsByUID(this.user).then((events: Event[]) => {
      this.events = events;   
      // this.eventService.events = this.events;   
    });
  }

  onDeleteEvent(event:Event, index:number){
    this.eventService.deleteEventByEID(event).then((status:Number) => {
      this.deleteStatus = status;
      console.log(this.deleteStatus);
      if(this.deleteStatus == 200){
        //remove event from events[]
        console.log("printing events before deletion:");
        console.log(this.events);
        
        
        this.events.splice(index, 1);


        console.log("printing events afte deletion:");
        console.log(this.events);

      }
    });

  }

}