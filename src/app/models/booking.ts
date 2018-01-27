import { User } from 'app/models/user';
import { Event } from 'app/models/event';

export class Booking { 
    constructor(
    public _id: string,
    public bookingType: string,
    public hostUser: User,
    public performerUser: User,
    public eventEID: Event,
    public approved: boolean,
    public completed: boolean,
    public artistApproved: boolean,
    public hostApproved: boolean, 
    public currentPrice: number
    ) {  }
}