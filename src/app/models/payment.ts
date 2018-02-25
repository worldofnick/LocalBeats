import { User } from 'app/models/user';
import { Booking } from 'app/models/booking';

export class Payment {
  public _id: string
  public hostUser: User
  public performerUser: User
  public booking: Booking
  public date: Date
  public amount: number
  public stripeChargeId: string
  public type: PaymentStatus // {"payment", "refund", "cancellation"}
}

export enum PaymentStatus {
  charge = "charge",
  refund = "refund",
  host_cancel = "host_cancel",
  artist_cancel = "artist_cancel",
}