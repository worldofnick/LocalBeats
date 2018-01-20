import { User } from 'app/models/user';

export class Event {
    public _id: string
    public eventName:string
    public eventType:string
    public eventGenres: string[]
    public hostUser: User
    public hostEmail: string
    public performerUser: User
    public performerEmail: string
    public address: string
    public zip: string
    public city: string
    public state: string
    public fromDate: Date
    public toDate: Date
    public description: string
    public fixedPrice: string
    public hourlyRate: string
    public deposit: string
    public isBooked: string
    public location: number[]
    public eventPicUrl: string
}
