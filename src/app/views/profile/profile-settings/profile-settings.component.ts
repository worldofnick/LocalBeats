import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { FileUploader } from 'ng2-file-upload';
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { ImgurService } from 'app/services/image/imgur.service';
import { MatTabChangeEvent } from '@angular/material';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { SocketService } from '../../../services/chats/socket.service';
import { StripeService } from '../../../services/payments/stripe.service';
import { Action } from '../../../services/chats/model/action';
import { Message } from '../../../services/chats/model/message';
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
  genresList: string[] = ['rock', 'country', 'jazz', 'blues', 'rap'];
  eventsList: string[] = ['wedding', 'birthday', 'business'];
  settingsForm: FormGroup;
  nowArtist = false;
  public uploader: FileUploader = new FileUploader({ url: 'upload_url' });
  public hasBaseDropZoneOver: boolean = false;
  constructor(private route: ActivatedRoute, private userService: UserService, private router : Router,
              private imgurService: ImgurService, private formBuilder: FormBuilder,
              private _socketService: SocketService, public snackBar: MatSnackBar, private stripeService: StripeService) { 

                this.showSnackBarIfNeeded();
              }


  ngOnInit() {
    this.user = this.userService.user;
    this.nowArtist = this.user.isArtist;
    this.createForm();
  }

  createForm(){
    this.settingsForm = this.formBuilder.group({
      firstName: new FormControl(this.user.firstName, [
        Validators.required
      ]),
      lastName: new FormControl(this.user.lastName, [
        Validators.required
      ]),
      email: new FormControl(this.user.email, [
        Validators.email,
        Validators.required
      ]),
      isArtist: new FormControl(this.user.isArtist, [
      ]),
      genres: new FormControl(this.user.genres,[]),
      eventTypes: new FormControl(this.user.eventTypes,[])  
    })
  }

  onArtist(){
    this.nowArtist = !this.nowArtist;
  }

  private showSnackBarIfNeeded() {
    if (this.router.url.indexOf('success=true') >= 0) {
      let snackBarRef = this.snackBar.open('Stripe Account Linked!', "", {
        duration: 1500,
      });
    } else if (this.router.url.indexOf('success=false') >= 0) {
      // failure
      let snackBarRef = this.snackBar.open("Failed to Link Account", "", {
        duration: 1500,
      });
    } else if (this.router.url.indexOf('updated=true') >= 0) {
      // failure
      let snackBarRef = this.snackBar.open("Stripe Details Updated", "", {
        duration: 1500,
      });
    } else if (this.router.url.indexOf('updated=false') >= 0) {
      // failure
      let snackBarRef = this.snackBar.open("Failed to Update Stripe Details", "", {
        duration: 1500,
      });
  }
}

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  onEditProfile(form: NgForm){
    this.user.firstName = this.settingsForm.get('firstName').value;
    this.user.lastName = this.settingsForm.get('lastName').value;
    this.user.email = this.settingsForm.get('email').value;

    this.user.genres = this.settingsForm.get('genres').value;
    this.user.eventTypes = this.settingsForm.get('eventTypes').value;
    this.user.isArtist = this.settingsForm.get('isArtist').value;

    //lower case genres for serachability
    for (var _i = 0; _i < this.user.genres.length; _i++) {
      this.user.genres[_i] = this.user.genres[_i].toLowerCase()
    }

    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;
      this.userService.user = user;
      this._socketService.sendToProfile('updateProfile', this.user);
    });
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
            this.userService.user = this.user;
            this.progressBar.mode = 'determinate';
            this._socketService.sendToProfile('updateProfile', this.user);
          });
        }).catch(err => {
          console.log(err);
          this.progressBar.mode = 'determinate';
          //this.router.navigate(['/profile']); //this will go back to my events.
      });
  }

   // STRIPE
   authorizeStripe() {
    this.stripeService.authorizeStripe(this.user).then((url: string) => {
      window.location.href = url;
    });

  }

  viewStripeTransfers() {
    this.stripeService.authorizeStripe(this.user).then((url: string) => {
      window.open(url);
    });
  }

  requestPayout() {
    this.stripeService.payoutUser(this.user).then((success: boolean) => {
      if (success) {
        let snackBarRef = this.snackBar.open('Payout Request Successful!', "", {
          duration: 1500,
        });
      } else {
        let snackBarRef = this.snackBar.open('Payout Request Failed.', "", {
          duration: 1500,
        });
      }
    });
  }

  unlinkStripe() {
    console.log("unlink stripe");
    this.user.stripeAccountId = null;
    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;
      this.userService.user = this.user
      let snackBarRef = this.snackBar.open('Stripe Account Unlinked', "", {
        duration: 1500,
      });
    });
  }

}
