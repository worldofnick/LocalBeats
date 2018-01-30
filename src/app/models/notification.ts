import { User } from 'app/models/user';
import { Event } from 'app/models/event';

export class Notification {
    senderID: string
    receiverID:string
    eventID:string
    message: string
    icon: string
    sentTime: Date;
    route: string[]
    color: string
}