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
    console.log('>>> IN SHARED SERVICE SET');
    this.profileButtonChatRecipient = recipient;
    this.isProfileUserRequestPending = true;
  }

  public resetProfileMessageSharedProperties() {
    console.log('>>> IN SHARED SERVICE RESET');
    this.profileButtonChatRecipient = new User();
    this.isProfileUserRequestPending = false;
  }

  // Snack bar go to chat message button
  public setSnackBarMessageSharedProperties(recipient: User) {
    console.log('>>> IN SHARED SERVICE SET');
    this.snackBarMessageRecipient = recipient;
    this.isSnackBarMessageRequestPending = true;
  }

  public resetSnackBarMessageSharedProperties() {
    console.log('>>> IN SHARED SERVICE RESET');
    this.snackBarMessageRecipient = new User();
    this.isSnackBarMessageRequestPending = false;
  }

  public setOverallUnreadCountForThisUser(loggedInUser: User) {
    const url = this.SERVER_URL + 'api/messages/counts/' + loggedInUser._id;
    console.log('> Overall count URL: ', url);
    return this.http.get(url);
  }

  // TODO: keep or remove later
  public resetUnreadChatCountForThisUser() {
    this.overallUnreadChatCountForThisUser = 0;
  }
}
