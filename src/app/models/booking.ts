import { User } from 'app/models/user';

export class Booking { 
    constructor(
    public _id: string,
    public bookingType: string,
    public hostUser: User,
    public performerUser: User,
    public eventEID: string,
    public approved: boolean,
    public completed: boolean
    ) {  }
}