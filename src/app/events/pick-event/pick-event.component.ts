import { Component, OnInit } from '@angular/core';
import { User } from 'app/models/user';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { EventService } from 'app/services/event.service';
import { print } from 'util';
import { Injectable } from '@angular/core';
import { Event } from 'app/models/event';



@Component({
  selector: 'app-pick-event',
  templateUrl: './pick-event.component.html',
  styleUrls: ['./pick-event.component.css']
})
export class PickEventComponent implements OnInit {

  user:User;
  events:Event[];
  deleteStatus:Number;
  artistID:any;

  constructor(private eventService: EventService, private userService: UserService, private router: Router, private route: ActivatedRoute) { }
  
  ngOnInit() {
    this.user = this.userService.user;
    
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      this.events = events;   
      // this.eventService.events = this.events;   
    });

    this.artistID = {
      id: this.route.snapshot.params['id']
    }

  }

}
