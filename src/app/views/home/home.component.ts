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

  constructor(    private notificationService: NotificationService,
                  private userService: UserService,
  ) { }

  io:any;

  ngOnInit() {
      //connect and listen w/ socket
      // this.notificationService.getNotificationsCountForUser(555);
      
  }

}
