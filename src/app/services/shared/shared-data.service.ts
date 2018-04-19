import { Injectable } from '@angular/core';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SharedDataService {

  SERVER_URL = environment.apiURL;

  // Profile button chat message
  profileButtonChatRecipient: User = new User();
  isProfileUserRequestPending = false;

  // Snack bar go to chat message button
  snackBarMessageRecipient: User = new User();
  isSnackBarMessageRequestPending = false;

  // Unread chat messages counts
  overallUnreadChatCountForThisUser = 0;

  constructor(private http: HttpClient) { }

  // Profile button chat message
  public setProfileMessageSharedProperties(recipient: User) {
    this.profileButtonChatRecipient = recipient;
    this.isProfileUserRequestPending = true;
  }

  public resetProfileMessageSharedProperties() {
    this.profileButtonChatRecipient = new User();
    this.isProfileUserRequestPending = false;
  }

  // Snack bar go to chat message button
  public setSnackBarMessageSharedProperties(recipient: User) {
    this.snackBarMessageRecipient = recipient;
    this.isSnackBarMessageRequestPending = true;
  }

  public resetSnackBarMessageSharedProperties() {
    this.snackBarMessageRecipient = new User();
    this.isSnackBarMessageRequestPending = false;
  }

  public setOverallChatUnreadCount(loggedInUser: User) {
    const url = this.SERVER_URL + 'api/messages/counts/' + loggedInUser._id;
    this.http.get(url).subscribe(
      (payload: any) => {
        if (payload !== undefined && payload !== null) {
          this.overallUnreadChatCountForThisUser = payload.unreadMessagesCount as number;
        }
      },
      err => {
        console.error(err);
      });
  }

  // TODO: keep or remove later
  public resetUnreadChatCountForThisUser() {
    this.overallUnreadChatCountForThisUser = 0;
  }
}
