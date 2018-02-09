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

  tickets = [{
    img: '',
    name: 'Brad Pitt',
    text: 'Amazing artist!.',
    date: new Date('07/12/2017'),
    isOpen: true
  }, {
    img: '',
    name: 'Angelina Jolie',
    text: 'Would book again!',
    date: new Date('07/7/2017'),
    isOpen: false
  }, {
    img: '',
    name: 'Will Ferrell',
    text: 'Worst guitarist.',
    date: new Date('04/10/2017'),
    isOpen: false
  }, {
    img: '',
    name: 'Chris Pratt',
    text: 'They should call this guy starlord.',
    date: new Date('07/7/2017'),
    isOpen: false
  }]

  photos = [{
    name: 'Featured Restaurant',
    url: 'assets/images/coffee-shop-pic.jpg'
  }, {
    name: 'Featured Concert',
    url: 'assets/images/concert-pic.jpeg'
  }, {
    name: 'Featured Wedding',
    url: 'assets/images/wedding-pic.jpg'
  }]

  constructor(private route: ActivatedRoute, private userService: UserService) { }
  
  ngOnInit() {
  }

}
