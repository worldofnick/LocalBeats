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
    public artViewed: boolean,
    public hostViewed: boolean,
    public hostStatusMessage: StatusMessages,
    public artistStatusMessage: StatusMessages,
    public completed: boolean,
    public artistApproved: boolean,
    public hostApproved: boolean, 
    public currentPrice: number,
    public hostVerified: boolean,
    public artistVerified: boolean
    ) {  }
}

export enum StatusMessages {
    artistBid = "New Bid",
    artistApplication = "New Application",
    hostOffer = "New Offer",
    waitingOnHost = "Waiting for response from Host",
    waitingOnArtist = "Waiting for response from Artist",
    bookingConfirmed = "Booking Confirmed",
}

export enum NegotiationResponses {
    new = 0, // New offer/bid/application/request
    accept = 1, // Accepting the current offer/bid/application/request
    decline = 2, // Decline the current offer/bid/application/request
    nochange = 3, // No change on the user's current offer/bid/application/request
    cancel = 4, // Cancellation of a confirmed booking
}

export enum VerificationResponse {
    reject = 0,
    verify = 1
}
