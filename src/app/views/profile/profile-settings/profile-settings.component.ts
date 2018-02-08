import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { FileUploader } from 'ng2-file-upload';
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { ImgurService } from 'app/services/image/imgur.service';
import { MatTabChangeEvent } from '@angular/material';

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
  constructor(private router: ActivatedRoute, private userService: UserService, private imgurService: ImgurService) { }


  ngOnInit() {
    this.user = this.userService.user;
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  onEditProfile(form: NgForm){
    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;
      this.userService.user = user;
    });
  }

  onTabChange(event: MatTabChangeEvent) {
    // TODO fix editing bug, leftover from then
    // this.user = Object.assign({}, this.userService.user);
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
            
          });
        }).catch(err => {
          console.log(err);
          this.progressBar.mode = 'determinate';
          //this.router.navigate(['/profile']); //this will go back to my events.
      });
  }

}
