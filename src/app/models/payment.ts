import { User } from 'app/models/user';
import { Booking } from 'app/models/booking';

export class Payment {
  public _id: string
  public hostUser: User
  public performerUser: User
  public booking: Booking
  public eid: string
  public date: Date
  public amount: number
  public stripeChargeId: string
  public type: string // {"payment", "refund"}
}
