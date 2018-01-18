import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { ImgurService } from 'app/services/image/imgur.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
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
    console.log("sending \n" );
    console.log(this.user);

    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;      
      this.userService.user = this.user; 
      // this.router.navigate(['/profile']);
    });
  }

  onChange(event: EventTarget) {
      let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
      let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
      let files: FileList = target.files;
      let file: File = files[0];
      let blob = file as Blob;

      this.imgurService.uploadToImgur(file).then(link => {
        this.user.profilePicUrl = link as string;
      }).then(link => {
          // update the image view

        }).catch(err => {
          console.log(err);
          //this.router.navigate(['/profile']); //this will go back to my events.
      });
  }

}
