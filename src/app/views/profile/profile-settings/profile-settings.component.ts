import { Component, OnInit, Input,ViewChild, OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
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
import { SpotifyClientService } from '../../../services/music/spotify-client.service';
import { Action } from '../../../services/chats/model/action';
import { Message } from '../../../services/chats/model/message';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search/search.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @Input() user: User;
  // user: User = null;
  private userSubscription: ISubscription;
  genresList: string[] = ['rock', 'country', 'jazz', 'blues', 'rap'];
  eventsList: string[] = ['wedding', 'birthday', 'business'];
  settingsForm: FormGroup;
  nowArtist = false;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper: boolean = false;

  selectedTabIndex = 0;

  public uploader: FileUploader = new FileUploader({ url: 'upload_url' });
  public hasBaseDropZoneOver: boolean = false;
  constructor(private route: ActivatedRoute, private userService: UserService, private router : Router,
              private imgurService: ImgurService, private formBuilder: FormBuilder,
              private _socketService: SocketService, public snackBar: MatSnackBar, private stripeService: StripeService,
            private _spotifyClientService: SpotifyClientService, private searchService: SearchService) { 
              }


  ngOnInit() {
    this.createForm();
    this.searchService.eventTypes().then((types: string[]) => {
      this.eventsList = types;
    }).then(() => this.searchService.genres().then((types: string[]) => {
      this.genresList = types;
    }));
    this.userSubscription = this.userService.userResult.subscribe(user => 
      {
        this.user = user;
        this.nowArtist = this.user.isArtist;
        this.settingsForm.patchValue({
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          isArtist: this.user.isArtist,
          genres: this.user.genres,
          eventTypes: this.user.eventTypes,
        });
      });
    
    this.route.queryParams.subscribe(params => {
      if (params['stripe']) {
        this.userService.getUserByID(this.userService.user._id).then((user: User) => {
          this.user = user;
          this.userService.user = user;
          // this.userService.user = user;
        }).then(() => this.selectedTabIndex = 2);
        
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  createForm(){
    this.settingsForm = this.formBuilder.group({
      firstName: new FormControl('', [
        Validators.required
      ]),
      lastName: new FormControl('', [
        Validators.required
      ]),
      email: new FormControl('', [
        Validators.email,
        Validators.required
      ]),
      isArtist: new FormControl('', [
      ]),
      genres: new FormControl([],[]),
      eventTypes: new FormControl([],[])  
    })
  }

  onArtist(){
    this.nowArtist = !this.nowArtist;
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

  private prepareBlob() {
    fetch(this.croppedImage).then(res => res.blob()).then(blob => this.uploadImage(blob));
  }
 
  uploadImage(blob: Blob) {
      this.progressBar.mode = 'indeterminate';
      this.imgurService.uploadToImgur(blob).then(link => {
        this.user.profilePicUrl = link as string;
      }).then(link => {
          // update the image view
          this.userService.onEditProfile(this.user).then((user: User) => {
            this.user = user;
            this.userService.user = user;
            this.progressBar.mode = 'determinate';
            this.showCropper = false;
            this.croppedImage = null;
            this._socketService.sendToProfile('updateProfile', this.user);
          });
        }).catch(err => {
          // console.log(err);
          this.progressBar.mode = 'determinate';
          this.showCropper = false;
          this.croppedImage = null;
      });
  }

  fileChangeEvent(event: EventTarget) {
    this.showCropper = true;
    this.imageChangedEvent = event;
  }

  imageCropped(image: String) {
    this.croppedImage = image;
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
    this.user.stripeAccountId = null;
    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;
      this.userService.user = user;
      let snackBarRef = this.snackBar.open('Stripe Account Unlinked', '', {
        duration: 1500,
      });
    });
  }
}
