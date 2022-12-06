import {Component, HostListener, OnDestroy} from '@angular/core';
import {WeksocketService} from "../services/weksocket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{

  ngOnDestroy(): void {
  }
}
