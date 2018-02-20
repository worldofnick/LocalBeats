import { User } from 'app/models/user';
import { Event } from 'app/models/event';

export class Review {
    public _id: string;
    public title: string;
    public text: string;
    public rating: number;
    public fromUser: User;
    public toUser: User;
    public date: Date;
    public flagCount: number;

    // constructor(
    //     _id,
    //     title,
    //     text,
    //     rating,
    //     fromUser,
    //     toUser,
    //     date,
    //     flagCount
    // ) {}

}
