export class Booking { 
    constructor(
    public bookingType: string,
    public hostUID: string,
    public performerUID: string,
    public eventEID: string,
    public approved: boolean,
    public completed: boolean
    ) {  }
}