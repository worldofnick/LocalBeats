import { Notification } from 'app/models/notification';
import * as io from 'socket.io';


export class User {
    public _id: string
    public firstName: string
    public lastName: string
    public email: string
    public spotifyID: string
    public password: string
    public genres: string[]
    public isArtist: boolean
    public profilePicUrl: string
    public eventTypes: string[]
    public socket: io.socket
    public stripeUserId: string
}
