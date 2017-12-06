import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/services/user.service';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { User } from 'app/models/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private user: User;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
  }

}
