import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  submitted = false;
  // model = new UserComponent(1238, 'Adam', 'adam@gmail.com');
  constructor() { }

  ngOnInit() {
  }
  
    onSubmit() { 
      this.submitted = true; 
    }
  
    // TODO: Remove this when we're done
    // get diagnostic() { return JSON.stringify(this.model); }
  
    newHero() {
      // this.model = new UserComponent(42, '', '');
    }
  
    showFormControls(form: any) {
      return form && form.controls['name'] &&
      form.controls['name'].value; 
    }

}
