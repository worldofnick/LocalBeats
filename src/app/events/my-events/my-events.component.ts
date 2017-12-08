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
    
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      this.events = events;   
      // this.eventService.events = this.events;   
    });
  }

  onDeleteEvent(event:Event, index:Number){
    this.eventService.deleteEventByEID(event).then((status:Number) => {
      this.deleteStatus = status;
      console.log(this.deleteStatus);
      if(this.deleteStatus == 200){
        //remove event from events[]
        console.log("printing events before deletion:");
        console.log(this.events);
        
        var newEvents:Event[] = [];

        //go thru and push all events except the deleted one to the new event.
        for(let i:number = 0; i < this.events.length; i++){
          if(i != index){
            newEvents.push(this.events[i]);
          }
        }

        this.events = newEvents;
        
        console.log("printing events after deletion:");
        console.log(this.events);

      }
    });

  }

  onEditEvent(event:Event){
    
  }

  onPickEvent(event:Event){
    // this.model = event;      
    this.eventService.event = event;
    this.router.navigate(['/event-page', event._id]); //this will go to the page about the event    
  }

  viewApplicants(event: Event) {
    this.eventService.event = event;
    this.router.navigate(['/applicant-list', event._id]);  
  }

}