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
        const temp: Notification = notification as Notification;

        let newNotification: Notification = new Notification(null, temp.senderID, temp.receiverID, 
          temp.eventID, temp.booking, temp.response, temp.message, temp.icon, temp.route);
        this.notifications.push(newNotification);
    });

    //initial getting of notifications
    this._socketService.onEvent(SocketEvent.REQUEST_NOTIFICATIONS).subscribe((notificationsList: Notification[])=>{

      this.notifications = [];
      for(let notification of notificationsList){
        let newNotification:Notification = new Notification(null, notification.senderID, notification.receiverID,
          notification.eventID, notification.booking, notification.response, notification.message, notification.icon,
          notification.route);
        this.notifications.push(newNotification);
      }
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



      this.notificationService.deleteNotificationById(this.notifications[0].receiverID._id).then((status: number)=>{
        // Success
      });


    this.notifications = [];
    
  }

  deleteNotification(notification: Notification) {
    console.log(notification);
  }

  selectNotification(notification:Notification){
    this.router.navigate(notification.route); //this will go to the page about the event
  }
}
