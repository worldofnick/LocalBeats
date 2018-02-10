**LocalBeats API**
----
### Headers
All requests must have the following properties set in the request header.

`Content-Type` = `application/json` 



## Users 

### Route: `/api/user/:uid`

  `GET` | `POST` | `DELETE` | `PUT`

* **Method:**
  
 Supports getting a users info, creating a user, updating, and deleting a user.

  
*  **URL Params**

	*  **Required**:
 
		* `uid=integer`

	* **Body Params   `POST` | `PUT`**

		`{ user: { user } }`

* **Success Response:**
  
 	 * **Code:** 200 if successful<br />
	 	**Content:** `{ user : user }`
 
* **Error Response:**

  * **Code:** 500 Bad Request <br />
    **Content:** `{ “message” : “error message“ }`


* **Sample Call:**

`http://localbeats.com/api/user/23499b99s`

## Search Users 

### Route: `/api/searchUsers/`

  `GET`

* **Method:**
  
 Supports searching users in our userbase

  
*  **URL Params**

	*  **Optional**:
		* `uid=integer`: ID of user making the query
		* `name=string`: Query search name
		* `artist=boolean`: True if only return artists, false return all
		* `lat` & `lon`: Returns all users within 60 miles of the coordinates
		* `genres=[string]`: Return only users which have at least one of the geners
		* `event_types=[string]`: Return only users which have at least one of the event types
		* `limit=integer`: Number of results to return, defaults to 15.
		* `skip=inteter`: Number of results to skip, defaults to 0. Used for pagination. 


* **Success Response:**
  
 	 * **Code:** 200 if successful<br />
	 	**Content:** `{ users : users }`
 
* **Error Response:**

  * **Code:** 500 Bad Request <br />
    **Content:** `{ “message” : “error message“ }`


* **Sample Call:**

`http://localbeats.com/api/searchUsers/?uid=someUid&lat=40&lon=-111`
