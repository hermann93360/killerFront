import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import {RouterModule, Routes} from "@angular/router";
import { PlayComponent } from './play/play.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { GameComponent } from './game/game.component';
import {HttpClientModule} from "@angular/common/http";

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'play', component: PlayComponent },
  { path: 'game', component: GameComponent },
  { path: '', component: HomeComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlayComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
