import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from "app/home/home.component";
import { ProfileDetailsComponent } from "./profile/profile-details/profile-details.component"
import { ProfileEditComponent } from "./profile/profile-edit/profile-edit.component"

const appRoutes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: 'home', component: HomeComponent },
    { path: 'profile', component: ProfileDetailsComponent },
    { path: 'profile-edit', component: ProfileEditComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
    
}