import { User } from 'app/models/user';
import { Event } from 'app/models/event';

export class Payment {
  public _id: string
  public hostUser: User
  public performerUser: User
  public date: Date
  public amount: number
  public stripeChargeId: string
  public type: string // {"payment", "refund"}
}
