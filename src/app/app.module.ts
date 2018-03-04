import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { Http, HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { rootRouterConfig } from './app.routes';
import { AppCommonModule } from "./components/common/app-common.module";
import { NegotiateModule } from './views/negotiate/negotiate.module';
import { StripeModule } from './views/events/event-singleton/stripe.module';
import {MatDialogModule} from '@angular/material/dialog';
import { AppComponent } from './app.component';

import { RoutePartsService } from './services/route-parts/route-parts.service';
import { NavigationService } from "./services/navigation/navigation.service";
import { SearchService } from './services/search/search.service';
import { UserService } from './services/auth/user.service';
import { BookingService } from './services/booking/booking.service';
import { EventService } from './services/event/event.service';
import { UserGuard } from './services/auth/user-guard.service';
import { ImgurService } from './services/image/imgur.service';
import { NotificationService} from './services/notification/notification.service';
import { ChatsService} from './services/chats/chats.service';
import { SocketService } from './services/chats/socket.service';
import { DatePipe } from '@angular/common';
import { StripeService } from './services/payments/stripe.service';
import { SpotifyClientService } from './services/music/spotify-client.service';
import { SharedDataService } from './services/shared/shared-data.service';

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  imports: [
    BrowserModule,
    MatDialogModule,
    BrowserAnimationsModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyBCko4eEq6azFCzCXVXAF4_jylVNw4ZM7Q",
      libraries: ["places"]
    }),
    HttpClientModule,
    HttpModule,
    AppCommonModule,
    NegotiateModule,
    StripeModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    }),
    RouterModule.forRoot(rootRouterConfig, { useHash: false })
  ],
  declarations: [AppComponent],
  providers: [
    RoutePartsService, 
    NavigationService,
    SearchService,
    SocketService,
    UserService,
    ChatsService, 
    SpotifyClientService,
    SharedDataService,
    BookingService,
    EventService,
    UserGuard,
    DatePipe,
    ImgurService,
    StripeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}