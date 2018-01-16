import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { User } from '../../../models/user';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';


@Component({
  selector: 'app-profile-events',
  templateUrl: './profile-events.component.html',
  styleUrls: ['./profile-events.component.css']
})
export class ProfileEventsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
