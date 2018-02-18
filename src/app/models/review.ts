import { User } from 'app/models/user';
import { Event } from 'app/models/event';

export class Review {
    constructor(
        public _id: string,
        public text: string,
        public rating: number,
        public fromUser: User,
        public toUser: User,
        public event: Event,
        public date: Date,
        public flagCount: number
    ) { }
}
