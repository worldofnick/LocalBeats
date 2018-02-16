import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { ImageUtilService } from './imageutil.service';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ImgurUploadOptions = {
    clientId: string,
    imageData: Blob | string,
    title?: string
};

export type ImgurUploadResponse = {
    data?: {
        link: string,
        deleteHash: string
    },
    success: boolean
};


@Injectable()
export class ImgurService {
  constructor(private http: Http) { }

  uploadToImgur(image: Blob | string): Promise<string> {
    let up = new Ng2ImgurUploader(this.http);
    let op: ImgurUploadOptions = {
        clientId: "6b131e4303f1d89",
        title: 'title',
        imageData: image
    };
    return up.upload(op).toPromise().then(resp => resp.data.link);
  }

  getDefaultPic(eventType: string): Promise<string> {
    let current = environment.apiURL + 'api/eventsDefault/?eventType=' + eventType;
    return this.http.get(current, { headers: new Headers({ 'Content-Type': 'application/json' }) })
        .toPromise()
        .then((response: Response) => {
            const data = response.json();
            const url = data["url"];
            return url;
        })
        .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
      let errMsg = (error.message) ? error.message :
          error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console
      return Promise.reject(errMsg);
  }

}

@Injectable()
export class Ng2ImgurUploader {
    constructor(
        private http: Http
    ) { }

    upload(uploadOptions: ImgurUploadOptions) {
        let result = new Subject<ImgurUploadResponse>();
        if(typeof uploadOptions.imageData === 'string'){
            this.sendImgurRequest(uploadOptions.imageData, uploadOptions, result);
        }
        else{
        ImageUtilService.imageDataToBase64(uploadOptions.imageData as Blob)
            .subscribe(
                (imageBase64: string) => {
                    this.sendImgurRequest(imageBase64, uploadOptions, result);
                },
                (error: string) => {
                    result.error(error);
                }
            );
        }

        return result;
    }

    delete(clientId: string, deleteHash: string): Observable<string> {
        let options = this.buildRequestOptions(clientId);
        return this.http.delete(`https://api.imgur.com/3/image/${deleteHash}`, options)
            .map((res: Response) => res.text());
    }

    private buildRequestOptions(clientId) {
        let headers = new Headers({
            Authorization: 'Client-ID ' + clientId,
            Accept: 'application/json'
        });
        return new RequestOptions({headers: headers});
    }

    private sendImgurRequest(
        imageBase64: string,
        uploadOptions: ImgurUploadOptions,
        result: Subject<ImgurUploadResponse>
    ): Observable<ImgurUploadResponse> {
        let options = this.buildRequestOptions(uploadOptions.clientId);
        let body = {
            image: imageBase64,
            title: uploadOptions.title,
            type: 'base64'
        };

        this.http.post('https://api.imgur.com/3/image', body, options)
            .subscribe(
                (res: Response) => {
                    let responseData = res.json().data;

                    result.next({
                        data: {
                            link: responseData.link,
                            deleteHash: responseData.deletehash
                        },
                        success: true
                    });
                    result.complete();
                },
                (err: Response) => {
                    result.error('error uploading image: ' + err.text());
                }
            );

        return result;
    }
}
