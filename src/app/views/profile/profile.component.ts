import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../../services/auth/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  activeView : string = 'overview';
  user: User = null;
  onOwnProfile: boolean = null;
  userID: any = null;

  // Doughnut
  doughnutChartColors: any[] = [{
    backgroundColor: ['#fff', 'rgba(0, 0, 0, .24)',]
  }];
  
  total1: number = 500;
  data1: number = 200;
  doughnutChartData1: number[] = [this.data1, (this.total1 - this.data1)];

  total2: number = 1000;
  data2: number = 400;
  doughnutChartData2: number[] = [this.data2, (this.total2 - this.data2)];

  doughnutChartType = 'doughnut';
  doughnutOptions: any = {
    cutoutPercentage: 85,
    responsive: true,
    maintainAspectRatio: true,
    legend: {
      display: false,
      position: 'bottom'
    },
    elements: {
      arc: {
        borderWidth: 0,
      }
    },
    tooltips: {
      enabled: false
    }
  };

  constructor(private route: ActivatedRoute, private userService: UserService) { 
    console.log("in profile component constructor");
  }

  ngOnInit() {
    this.activeView = this.route.snapshot.params['view']
    this.user = this.userService.user;

    //snapshot params returns a javascript object. index into it with the property field to get a property.
    this.userID = {
      id: this.route.snapshot.params['id']
    }

    console.log("id from url");
    console.log(this.userID["id"]);
    if (this.userID["id"] == null) {
      //nothing in url.
      console.log('on own profile')
      console.log(this.userService.user)
      this.onOwnProfile = true;
      this.user = this.userService.user;
    } else {
      //on another perons profile.
      this.onOwnProfile = false;
      let ID:String = this.userID["id"];
      console.log("on another perosns profile");
      console.log(ID);
      this.userService.getUserByID(ID).then((gottenUser: User) => {
        this.user = gottenUser;
        // console.log("other user")
        // console.log(this.user)
        // }).then(() => this.hasRequested());
      })
    }
  }

}