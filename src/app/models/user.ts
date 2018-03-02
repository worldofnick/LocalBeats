import { Notification } from 'app/models/notification';
import * as io from 'socket.io';


export class User {
    public _id?: string;
    public firstName?: string;
    public lastName?: string;
    public email?: string;
    public spotifyID?: string;       //TODO: remove later. DEPRECATED
    public password?: string;
    public genres?: string[];
    public isArtist?: boolean;
    public profilePicUrl?: string;
    public eventTypes?: string[];
    public socket?: io.socket;
    public city?: string;
    public state?: string;
    public location?: number[];
    public stripeAccountId?: string;
    
    // Music properties
    public spotify?: {
        email?: string,
        id?: string,
        uri?: string,
        href?: string,
        accessToken?: string,
        refreshToken?: string,
        albums?: any[]
    };

    // Chat properties
    public isOnline?: boolean = false;
}

