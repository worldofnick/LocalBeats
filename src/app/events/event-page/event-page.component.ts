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
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.css']
})
export class EventPageComponent implements OnInit {
  model:Event;
  user:User;

  EID:any;

  constructor(private eventService: EventService, private userSerivce: UserService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    
    // this.model = this.eventService.event;
    // this.user = this.userSerivce.user;
    // console.log("in ngonit in event page..printing data " );
    // console.log(this.model._id);
    this.EID = {
      id: this.route.snapshot.params['id']
    }

    this.eventService.getEventByEID(this.EID).then((event: Event) => {
      this.model = event;
    }).then(() =>{
      this.userSerivce.getUserByID(this.model.hostUID).then((user:User) => {
        this.user = user;
      });
    });
  }

}
