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

        let newNotification: Notification = new Notification(temp._id, temp.senderID, temp.receiverID, 
          temp.eventID, temp.booking, temp.response, temp.message, temp.icon, temp.sentTime, temp.route);
        this.notifications.unshift(newNotification);
    });

    //initial getting of notifications
    this._socketService.onEvent(SocketEvent.REQUEST_NOTIFICATIONS).subscribe((notificationsList: Notification[])=>{
      // console.log('NotificationList got from server: ', notificationsList);
      this.notifications = [];
      for(let notification of notificationsList){
        let newNotification:Notification = new Notification(notification._id, notification.senderID, notification.receiverID,
          notification.eventID, notification.booking, notification.response, notification.message, notification.icon, notification.sentTime,
          notification.route);
        this.notifications.unshift(newNotification);
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

      for(let index = 0; index < this.notifications.length; index++) {
        // console.log('removing notifiaction : ', this.notifications[index].message);
        this.notificationService.deleteNotificationById(this.notifications[index]._id).then((status: number)=>{
          // Success or failure
          if (status === 200) {
            // Can remove it from this.notifications. Dont think will need a failure case? Cause if it fails, try again?
            // Can just it it along I guess.
          }
        });
      }

    this.notifications = [];
  }

  deleteNotification(notification: Notification, index:number) {
    this.notificationService.deleteNotificationById(notification._id).then((status: number)=>{
      // Success or failure
      if (status === 200) {
        // Can remove it from this.notifications. Dont think will need a failure case? Cause if it fails, try again?
        let newNotifications:Notification[] = [];
        let i = 0;
        for (let n of this.notifications){
          if(i != 0){
            newNotifications.push(n);
          }
          i++;
        }
        this.notifications = newNotifications;
      }
    });
  }

  selectNotification(notification:Notification){
    this.router.navigate(notification.route); //this will go to the page about the event
  }
}
