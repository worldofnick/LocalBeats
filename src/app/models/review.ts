import { User } from 'app/models/user';
import { Event } from 'app/models/event';



export class Review{
    constructor(
        public _id: string,
        public text: string,
        public rating: number,
        public fromUser: User,
        public toUser: User,
        public event: Event,
        public date: Date,
        public flagCount: number
        
    ){ }
}


/**
 * 
 * 
 * 
 *     title           : {type: String, required: true},
    text            : {type: String, required: true},
    rating          : {type: Number, required: true},
    fromUser        : {type: String, required: true},
    toUser          : {type: Schema.Types.ObjectId, ref: 'User' },
    toUser          : {type: Schema.Types.ObjectId, ref: 'User' },
    event           : {type: Schema.Types.ObjectId, ref: 'Events' },
    date            : {type: Date, default: Date.now},
    flagCount       : {type: Number, default: 0}
 */