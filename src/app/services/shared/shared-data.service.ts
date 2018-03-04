import { Injectable } from '@angular/core';
import { User } from '../../models/user';

@Injectable()
export class SharedDataService {

  profileButtonChatRecipient: User = new User();
  isProfileUserRequestPending = false;

  constructor() { }

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

}
