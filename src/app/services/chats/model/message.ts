import { Action } from './action';
import { User } from '../../../models/user';

export interface Message {
    from?: User;
    to?: User;
    content?: any;
    action?: Action;
    isRead?: boolean;
    sentAt?: Date;
    typeIsAttachment?: boolean;
    attachmentURL?: string;
    serverMessage?: any;
    serverPayload?: any;
}