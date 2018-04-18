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
    public fixedPrice: number
    public negotiable: boolean
    public hourlyRate: string
    public deposit: string
    public isBooked: string
    public location: number[]
    public eventPicUrl: string
    public cancellationPolicy: CancellationPolicy
    public open: boolean
}

export enum CancellationPolicy {
    flexible = "flexible", // 15% charged to either host or artist if cancelled within 7 days of event
    strict = "strict", // 15% charged to either host or artist if cancelled within 30 days of event
}

export enum EventSortType {
    fromDateAsc = "Ascending Date",
    fromDateDes = "Descending Date",
    priceAsc = "Ascending Price",
    priceDes = "Descending Price",
    notificationCount = "Most Notifications"
}
