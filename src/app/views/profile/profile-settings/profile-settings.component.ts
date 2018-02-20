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
import { Action } from '../../../services/chats/model/action';
import { Message } from '../../../services/chats/model/message';

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
  constructor(private router: ActivatedRoute, private userService: UserService, 
              private imgurService: ImgurService, private formBuilder: FormBuilder,
              private _socketService: SocketService) { }


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
      let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
      let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
      let files: FileList = target.files;
      let file: File = files[0];
      let blob = file as Blob;
      if (!blob) {
        return;
      }
      this.progressBar.mode = 'indeterminate';
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

}
