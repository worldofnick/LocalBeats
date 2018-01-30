import { Action } from './action';
import { User } from '../../../models/user';

export interface Message {
    from?: User;
    to?: User;
    content?: any;
    action?: Action;
    serverMessage?: any;
    serverPayload?: any;
}
