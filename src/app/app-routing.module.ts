import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from "app/home/home.component";
import { ProfileDetailsComponent } from "./profile/profile-details/profile-details.component"
import { ProfileEditComponent } from "./profile/profile-edit/profile-edit.component"
import { SearchResultComponent } from "./search/search-result/search-result.component"
import { EventsComponent } from "./events/events.component"
import { CreateEventComponent } from "./events/create-event/create-event.component"
import { EventPageComponent } from "app/events/event-page/event-page.component";

const appRoutes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: 'home', component: HomeComponent },
    { path: 'events', component: EventsComponent },
    { path: 'event-page', component: EventsComponent },
    { path: 'create-event', component: CreateEventComponent },
    { path: 'profile', component: ProfileDetailsComponent },
    { path: 'profile-edit', component: ProfileEditComponent },
    { path: 'search-result', component: SearchResultComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
    
}