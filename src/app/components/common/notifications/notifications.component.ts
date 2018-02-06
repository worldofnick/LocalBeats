import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { Notification } from 'app/models/notification'
import { NotificationService } from '../../../services/notification/notification.service';
import { UserService } from '../../../services/auth/user.service';
import { SocketService } from '../../../services/chats/socket.service';
import { SocketEvent } from         '../../../services/chats/model/event';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  @Input() notificPanel;

  //get notification data.

  // Dummy notifications
  notifications:Notification[] = [];


  constructor(private router: Router,
              private notificationService: NotificationService,
              private userService: UserService,
              private _socketService: SocketService) {}

  ngOnInit
  () {

    //listening for real time notification
    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((notification: Notification) => {
        console.log('Notification form servre: ', notification);
        const temp: Notification = notification as Notification;

        let newNotification:Notification = new Notification();
        newNotification.message = temp.message;
        newNotification.color = "blue";
        newNotification.icon = temp.icon;
        newNotification.eventID = temp.eventID;
        newNotification.route = temp.route;
        this.notifications.push(newNotification);
    });

    //initial getting of notifications
    this._socketService.onEvent(SocketEvent.REQUEST_NOTIFICATIONS).subscribe((notificationsList: Notification[])=>{
      console.log("getting notifications..");
      // this.notifications = notificationsList;

      this.notifications = [];
      for(let notification of notificationsList){
        console.log(this.notifications.length);
        let newNotification:Notification = new Notification();
        newNotification.message = notification.message;
        newNotification.color = "blue";
        newNotification.icon = notification.icon;
        newNotification.route = notification.route;
        this.notifications.push(newNotification);
      }
      console.log(notificationsList);
      console.log(this.notifications);
    });
    


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

  selectNotification(notification:Notification){
    console.log("selectd notification:");
    console.log(notification);
    this.router.navigate(notification.route); //this will go to the page about the event
  }
}
