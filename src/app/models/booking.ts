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
    public hostStatusMessage: string,
    public artistStatusMessage: string,
    public completed: boolean,
    public artistApproved: boolean,
    public hostApproved: boolean, 
    public currentPrice: number
    ) {  }
}

export enum StatusMessages {
    artistBid = "New Bid - waiting for your response",
    artistApplication = "New Application - waiting for your response",
    hostOffer = "New Offer - waiting for your response",
    waitingOnHost = "Waiting for response from host",
    waitingOnArtist = "Waiting for response from artist",
    bookingConfirmed = "Booking Confirmed",
}