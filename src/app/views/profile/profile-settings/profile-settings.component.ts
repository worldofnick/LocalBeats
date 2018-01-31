import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { FileUploader } from 'ng2-file-upload';
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { ImgurService } from 'app/services/image/imgur.service';
import { MatTabChangeEvent } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  user: User;

  public uploader: FileUploader = new FileUploader({ url: 'upload_url' });
  public hasBaseDropZoneOver: boolean = false;
  constructor(private route: ActivatedRoute, private router : Router, private userService: UserService, private imgurService: ImgurService, public snackBar: MatSnackBar) {

    console.log(router.url);

    if (router.url.indexOf('success=true') >= 0) {
      let snackBarRef = this.snackBar.open('Stripe Account Linked!', "", {
        duration: 1500,
      });
    } else {
      // failure
      let snackBarRef = this.snackBar.open("Failed to Link Account", "", {
        duration: 1500,
      });
    }

  }


  ngOnInit() {
    this.user = Object.assign({}, this.userService.user); // deep copy
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  onEditProfile(form: NgForm){
    console.log("sending \n" );
    console.log(this.user);
    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;
      this.userService.user = Object.assign({}, this.user); // deep copy
      //this.router.navigate(['/profile']);
    });
  }

  onTabChange(event: MatTabChangeEvent) {
    this.user = Object.assign({}, this.userService.user);
  }

  onChange(event: EventTarget) {
      this.progressBar.mode = 'indeterminate';
      let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
      let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
      let files: FileList = target.files;
      let file: File = files[0];
      let blob = file as Blob;

      this.imgurService.uploadToImgur(file).then(link => {
        this.user.profilePicUrl = link as string;
      }).then(link => {
          // update the image view
          this.userService.onEditProfile(this.user).then((user: User) => {
            this.user = user;
            this.userService.user = Object.assign({}, this.user); // deep copy
            this.progressBar.mode = 'determinate';
            // this.router.navigate(['/profile']);
          });
        }).catch(err => {
          console.log(err);
          this.progressBar.mode = 'determinate';
          //this.router.navigate(['/profile']); //this will go back to my events.
      });
  }

  unlinkStripe() {
    console.log("unlink stripe");
    this.user.stripeUserId = null;
    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;
      this.userService.user = this.user
      let snackBarRef = this.snackBar.open('Stripe Account Unlinked', "", {
        duration: 1500,
      });
    });
  }

}
