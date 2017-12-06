import { Component, OnInit, Input } from '@angular/core';
import { User } from 'app/models/user';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { EventService } from 'app/services/event.service';
import { print } from 'util';
import { Injectable } from '@angular/core';
import { Event } from 'app/models/event';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

  // @Input() user:User;
  @Input() event:Event;
  @Input() index:Number;
 
  
  constructor(private eventService: EventService, private userService: UserService, private router: Router) { }

  ngOnInit() {
    // this.event = this.eventService.event;
    console.log("printing event in singleton" );
    console.log(this.event);
    console.log("printing inex associated from ngforloop");
    console.log(this.index);
  }

}
