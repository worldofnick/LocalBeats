
# LocalBeats

## Prototype Feature List 
1. Basic Authentication
   - The ability to sign into one’s account or sign up by providing some default credentials like email, password, name, etc.

2. Profile Editing
   - Ability to customize the user profile with profile pictures, an availability schedule, descriptions, user reviews system, etc.

3. Search and Filtering
   - Search algorithm which takes into account the filters that are selected ad returns a page of results that are managed in the backend. Clicking on any of the results will take one to the respective profile page.

4.  Basic Event Booking System
    - Allow artists to book for an event (from the profile page) or create an event. It does not include payment or contracts.

5.  Basic Spotify Playlist Integration
    - The ability for artists to optionally integrate their Spotify profiles into a music feed on their profile, using the Spotify API.

6.  Backend relationships & Heroku
    - Heroku will be used to host our mongoDB database. It will also host our backend and front end. 

7.  Mobile Web UI
    - Allow for a flexible UI for different screen sizes and devices

8. CSS Style Specifications
   - Create uniform CSS templates that all page design will refer to

## Work Done...

### Brandon Koch
- Angular Project Architecture
- Basic Landing Page and Authentication in Angular
- Navigation Bar with Search and Filtering of Events/Musicians in Angular
- Base Searching with Near You Google Maps functionality in Angular
- Designed UI for Landing Page, Booking Pages, and Search Reults
- Create TypeScript models for User, Booking, and Search
- Angular Services to interact with backend API
- Design the logic and UI for creating, accepting, and declining a booking request.

### Snehashish Mishra
- Modified Server to run locally, added MongoDB via Mongoose
- Setup the model, routes, controller architecture for the Express server
- Basic Authentication and Authorization using JWT
- REST API for authentication, authorization, and User Routes
- Basic Spotify authentication
- REST API to interface Spotify API for authentication, authorization and the retrieval of playlists.
- Made a messaging prototype _(unused in the demo)_
- Documentation

### Nick Porter
- Configure initial project setup
- Get Project building and hosted on Heroku
- Created models for Users, Events, Bookings, and Reviews
- All backend work excluding authenitcation and Spotify and refactorization
- Backend routes for Events, Bookings, Searching, Users, Profile, and Reviews
- Searching and filtering with filters, location, and other parmeters for users and events
- Backend REST API for revewing a user
- Backend REST API for creating and editing an event and accepting/declining booking
- Reviews model and serviews in Angular TypeScript
- Uploading and storing images

### Adam Rosenberg
- Profile page and profile editing form for the frontend in Angular 
- Frontend for the events page / create events / edit events
- Integrated Spotify widget for frontend use
- Create TypeScript models for Event, Profile, and Biiking
- Designed UI for Profile, Event, and Bookings
- Angular Services to interact with backend API
- Help Brandon develp and design the logic and UI for creating, accepting, and declining a booking request.

## Future Features Backlog
1. Advanced Authentication
   - Utilizing the Google and Facebook APIs to allow OAuth on the platform, so they can sign in with their Google and Facebook credentials.

2. Notification System
   - This includes email notifications along with live notifications on the site.

3. Advanced Event Booking System
   - Service Agreement
      - When an event is being booked, provides an agreement for both parties to acknowledge which includes the event details like price, event date and location, etc.

4. Payments System
   - Integration with the Stripe API into our platform to facilitate monetary transactions.

5. Complete Music Integration
   - The ability for artists to optionally integrate their SoundCloud and Spotify profiles into a music feed on their profile, using the Spotify and SoundCloud API.

6. 2-Step Event Verification System
   - A feature that will allow an event host and an artist to confirm an appearance to an event. This feature is intended to reduce fraud.

7. Google Maps Integration
   - Pin events that are upcoming onto a map of the area that the user is in. 

8. Private Messaging
   - Provide the ability for a user to message any other user.

9. Event Problem Arbitration System
   - A feature that will handle when issues are reported during in-person event verification and any emails that are sent to us.  For example, if a musician is reported multiple times during event verification, we will ban them as fraudulent.

10. Recommendation Algorithm
    - An algorithm that will recommend events or artists to a user based on criteria that might include, but not limited to: location, previous booking history, genre. This feature is dependent on having enough data to provide good recommendations, therefore it may not be reasonable in the early stages of our platform.

11. Sponsor Yourself
    - Pay localBeats to advertise the event / artist to the top on the landing page.
