import { User } from 'app/models/user';
import { Event } from 'app/models/event';

export class Notification {
    sender: User
    receiver:User
    event:Event
    message: string
    icon: string
    sentTime: Date;
    route: string[]
    color: string
}