import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.css']
})
export class ProfileOverviewComponent implements OnInit {

  @Input() user: User;  

  // user:User;

  onOwnProfile: boolean = null;
  userID: any = null;

  
  activityData = [{
    month: 'January',
    spent: 240,
    opened: 8,
    closed: 30
  }, {
    month: 'February',
    spent: 140,
    opened: 6,
    closed: 20
  }, {
    month: 'March',
    spent: 220,
    opened: 10,
    closed: 20
  }, {
    month: 'April',
    spent: 440,
    opened: 40,
    closed: 60
  }, {
    month: 'May',
    spent: 340,
    opened: 40,
    closed: 60
  }];

  tasks = [{
    text: 'Lorem, ipsum dolor sit amet',
    status: 0
  }, {
    text: 'Lorem, ipsum dolor sit amet',
    status: 0
  }, {
    text: 'Lorem, ipsum dolor sit amet',
    status: 1
  }, {
    text: 'Lorem, ipsum dolor sit amet',
    status: 1
  }, {
    text: 'Lorem, ipsum dolor sit amet',
    status: 1
  }]

  tickets = [{
    img: 'assets/images/face-1.jpg',
    name: 'Mike Dake',
    text: 'Excerpt pipe is used.',
    date: new Date('07/12/2017'),
    isOpen: true
  }, {
    img: 'assets/images/face-5.jpg',
    name: 'Jhone Doe',
    text: 'My dashboard is not working.',
    date: new Date('07/7/2017'),
    isOpen: false
  }, {
    img: 'assets/images/face-3.jpg',
    name: 'Jhonson lee',
    text: 'Fix stock issue',
    date: new Date('04/10/2017'),
    isOpen: false
  }, {
    img: 'assets/images/face-4.jpg',
    name: 'Mikie Jyni',
    text: 'Renew my subscription.',
    date: new Date('07/7/2017'),
    isOpen: false
  }, {
    img: 'assets/images/face-5.jpg',
    name: 'Jhone Dake',
    text: 'Payment confirmation.',
    date: new Date('04/10/2017'),
    isOpen: false
  }]

  photos = [{
    name: 'Photo 1',
    url: 'assets/images/sq-15.jpg'
  }, {
    name: 'Photo 2',
    url: 'assets/images/sq-8.jpg'
  }, {
    name: 'Photo 3',
    url: 'assets/images/sq-9.jpg'
  }, {
    name: 'Photo 4',
    url: 'assets/images/sq-10.jpg'
  }, {
    name: 'Photo 5',
    url: 'assets/images/sq-11.jpg'
  }, {
    name: 'Photo 6',
    url: 'assets/images/sq-12.jpg'
  }]

  constructor(private route: ActivatedRoute, private userService: UserService) { }
  
  ngOnInit() {
    console.log("in profile overview..user = ");
    // this.user = this.userService.user;
    console.log(this.user);

     //snapshot params returns a javascript object. index into it with the property field to get a property.
    //  this.userID = {
    //   id: this.route.snapshot.params['id']
    // }

    // console.log("id from url");
    // console.log(this.userID["id"]);
    // if (this.userID["id"] == null) {
    //   //nothing in url.
    //   console.log('on own profile')
    //   console.log(this.userService.user)
    //   this.onOwnProfile = true;
    //   this.user = this.userService.user;
    // } else {
    //   //on another perons profile.
    //   console.log("ON ANOTHER PERSONS PROFILE");
    //   this.onOwnProfile = false;
    //   let ID:String = this.userID["id"];
    //   console.log("on another perosns profile");
    //   console.log(ID);
    //   this.userService.getUserByID(ID).then((gottenUser: User) => {
    //     this.user = gottenUser;
    //     // console.log("other user")
    //     // console.log(this.user)
    //     // }).then(() => this.hasRequested());
    //   })
    // }
  }

}
