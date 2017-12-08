import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from "app/home/home.component";
import { ProfileDetailsComponent } from "./profile/profile-details/profile-details.component"
import { ProfileEditComponent } from "./profile/profile-edit/profile-edit.component"
import { SearchResultComponent } from "./search/search-result/search-result.component"
import { CreateEventComponent } from "./events/create-event/create-event.component"
import { EventPageComponent } from "app/events/event-page/event-page.component";
import { MyEventsComponent} from "app/events/my-events/my-events.component";
import { ApplicantListComponent} from "app/events/applicant-list/applicant-list.component";
import { PickEventComponent} from "app/events/pick-event/pick-event.component";

const appRoutes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: 'home', component: HomeComponent },
    { path: 'event-page/:id', component: EventPageComponent },
    { path: 'create-event', component: CreateEventComponent },
    { path: 'my-events', component: MyEventsComponent},
    { path: 'pick-event/:id', component: PickEventComponent},
    { path: 'profile/:id', component: ProfileDetailsComponent },
    { path: 'profile', component: ProfileDetailsComponent },
    { path: 'applicant-list/:id', component: ApplicantListComponent},
    { path: 'profile-edit', component: ProfileEditComponent },
    { path: 'search-result', component: SearchResultComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
    
}