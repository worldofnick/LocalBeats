import { User } from 'app/models/user';

export class Event {
    public _id: string
    public eventName:string
    public eventType:string
    public eventGenre: string
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




//   eventName       : {type: String, required: true},
//   eventType       : {type: String, required: true},
//   eventGenre      : {type: String, required: true},
//   hostUID         : {type: String, required: true},
//   hostEmail       : {type: String, lowercase: true, required: true},
//   performerUID    : {type: String},
//   performerEmail  : {type: String, lowercase: true},
//   address         : {type: String},
//   fromDate        : {type: Date, default: Date.now},
//   toDate          : {type: Date},
//   description     : {type: String},
//   fixedPrice      : {type: Number},
//   hourlyRate      : {type: Number},
//   deposit         : {type: Number},
//   isBooked        : {type: Boolean, default: false},
//   location: {
//     type: [Number],  // [<longitude>, <latitude>]
//     index: '2d'      // create the geospatial index
