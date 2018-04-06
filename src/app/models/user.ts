import { Notification } from 'app/models/notification';
import * as io from 'socket.io';


export class User {
    public _id: string;
    public firstName: string;
    public lastName: string;
    public fullName: string;
    public email: string;
    public password: string;
    public genres: string[];
    public isArtist: boolean;
    public profilePicUrl: string;
    public eventTypes: string[];
    public socket: io.socket;
    public city: string;
    public averageRating: number;
    public state: string;
    public location: number[];
    public stripeAccountId: string;

    // Music properties
    public spotify?: {              // TODO: turn it into a spotyf object and have only 1 entry in user
        email?: string,
        id?: string,
        uri?: string,
        href?: string,
        accessToken?: string,
        refreshToken?: string,
        albums?: any[]
    };

    public soundcloud?: {
        id?: string,
        username?: string,
        avatar_url?: string
    };

    // Chat properties
    public isOnline?: boolean = false;
}

