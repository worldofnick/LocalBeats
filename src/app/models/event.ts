export class Event {
    
      constructor(
        public eventName: string,
        public eventType: string,
        public eventGenre: string,
        public hostUID: string,
        public hostEmail: string,
        public performerEmail: string,
        public address: string,
      ) {  }
    }