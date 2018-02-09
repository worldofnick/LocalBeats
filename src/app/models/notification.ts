import { User } from 'app/models/user';
import { Event } from 'app/models/event';
import { Booking, NegotiationResponses } from 'app/models/booking';

export class Notification {
    constructor(
    public senderID: User,
    public receiverID: User,
    public eventID:string,
    public booking: Booking,
    public response: NegotiationResponses,
    public message: string,
    public icon: string,
    public route: string[]
    ) {}
}