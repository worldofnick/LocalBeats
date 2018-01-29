import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { Notification } from 'app/models/notification'
import { NotificationService } from '../../../services/notification/notification.service';
import { UserService } from '../../../services/auth/user.service'
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  @Input() notificPanel;

  //get notification data.

  // Dummy notifications
  notifications:Notification[]


  constructor(private router: Router,
              private notificationService: NotificationService,
              private userService: UserService) {}

  ngOnInit
  () {

    this.notificationService.io.on('notifications', notificationsList=>{
      console.log(notificationsList)
      this.notifications = notificationsList;
    });
    

    // if(this.userService.isAuthenticated()){

    //   this.notificationService.getNotificationsForUser(this.userService.user).then((
    //     notificationsList: Notification[]) => {
    //     this.notifications = notificationsList;
    //   }); 
    // }

    this.router.events.subscribe((routeChange) => {
        if (routeChange instanceof NavigationEnd) {
          this.notificPanel.close();
        }
    });
  }


  //add service call to delete those notifications.
  clearAll(e) {
    e.preventDefault();
    this.notifications = [];
  }
}
