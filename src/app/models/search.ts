export class SearchTerms {
    
      constructor(
        public searchType: string,
        public text: string,
        public location: Location,
        public genre: string
      ) {  }
    }

export class Location {
  latitude: Number;
  longitude: Number;
}