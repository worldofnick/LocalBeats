import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/auth/user.service';
import { NotificationService } from '../../services/notification/notification.service';
import * as socketIO from 'socket.io-client';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  artists = [{
    name: 'Featured Drummer',
    url: 'assets/images/drums-image.png'
  }, {
    name: 'Featured Trumpet',
    url: 'assets/images/trumpet-pic.png'
  }, {
    name: 'Featured Guitarist',
    url: 'assets/images/guitar-pic.jpg'
  }]

  events = [{
    name: 'Featured Restaurant',
    url: 'assets/images/coffee-shop-pic.jpg'
  }, {
    name: 'Featured Concert',
    url: 'assets/images/concert-pic.jpeg'
  }, {
    name: 'Featured Wedding',
    url: 'assets/images/wedding-pic.jpg'
  }]
  constructor() { }

  ngOnInit() {
      //connect and listen w/ socket
      // this.notificationService.getNotificationsCountForUser(555);
      
  }

}
