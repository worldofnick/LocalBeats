export class SearchTerms {
    
      constructor(
        public searchType: string,
        public text: string,
        public location: Location,
        public genres: string[],
        public event_types: string[],
        public uid: string,
        public from_date: Date,
        public to_date: Date, 
        public sort: string
      ) {  }
    }

export class Location {
  latitude: Number;
  longitude: Number;
}