import { Action } from './action';
import { User } from '../../../models/user';

export interface Message {
    from?: User;
    content?: any;
    action?: Action;
}
