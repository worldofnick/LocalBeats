import { Component, OnInit, Input } from '@angular/core';
import { User } from 'app/models/user';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { EventService } from 'app/services/event.service';
import { print } from 'util';
import { Injectable } from '@angular/core';
import { Event } from 'app/models/event';


// event singleton. this is an event item that goes in the event list!!
@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

  // @Input() user:User;
  @Input() event:Event;
  @Input() index:Number;
  deleteStatus:Number;
 
  
  constructor(private eventService: EventService, private userService: UserService, private router: Router) { }

  ngOnInit() {
    // this.event = this.eventService.event;
  }

  onDeleteEvent(index: Number){
    console.log(index);
    this.eventService.deleteEventByEID(this.event).then((status:Number) => {
      this.deleteStatus = status;
      console.log(this.deleteStatus);
      if(this.deleteStatus == 200){
        // this.eventService.events = this.eventService.events.filter(e => e !== this.event);
        this.router.navigate(['/my-events']);
      }
    });
  }

}
