import { User } from 'app/models/user';
import { Event } from 'app/models/event';

export class Booking {
    constructor(
    public _id: string,
    public bookingType: BookingType,
    public hostUser: User,
    public performerUser: User,
    public eventEID: Event,
    public approved: boolean,
    public artViewed: boolean,
    public hostViewed: boolean,
    public hostStatusMessage: StatusMessages,
    public artistStatusMessage: StatusMessages,
    public artistApproved: boolean,
    public hostApproved: boolean, 
    public currentPrice: number,
    public hostVerified: boolean,
    public artistVerified: boolean
    ) {  
        this.verifyComment = '';
        this.cancelled = false;
        this.completed = false;
    }

    public verifyComment: string;
    public cancelled: boolean;
    public completed: boolean;
}

export enum BookingType {
    artistApply = "artist-apply",
    hostRequest = "host-request"
}

export enum StatusMessages {
    artistBid = "New Bid",
    artistApplication = "New Application",
    hostOffer = "New Offer",
    waitingOnHost = "Waiting for response from Host",
    waitingOnArtist = "Waiting for response from Artist",
    bookingConfirmed = "Booking Confirmed",
    artistVerified = "Artist Verified",
    hostVerified = "Host Verified",
    verified = "Booking Verified",
    artistRejected = "Artist Rejected",
    hostRejected = "Host Rejected",
    completed = "Booking Completed",
    cancelled = "Booking Cancelled",
}

export enum NegotiationResponses {
    new = 0, // New offer/bid/application/request
    accept = 1, // Accepting the current offer/bid/application/request
    decline = 2, // Decline the current offer/bid/application/request
    nochange = 3, // No change on the user's current offer/bid/application/request
    cancel = 4, // Cancellation of a confirmed booking
    payment = 5, // Payment
    complete = 6, // A confirmed booking has been completed
    verification = 7, // A booking has been verified
}

export enum VerificationResponse {
    reject = 0,
    verify = 1
}
