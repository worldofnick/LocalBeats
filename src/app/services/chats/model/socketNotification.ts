import { Action } from './action';
import { User } from '../../../models/user';

export interface SocketNotification {

    serverMessage?: any;
    serverPayload?: any;

    senderID?: User
    receiverID?: User
    eventID?:string
    message?: string
    icon?: string
    sentTime?: Date;
    route?: string[]
    color?: string
}