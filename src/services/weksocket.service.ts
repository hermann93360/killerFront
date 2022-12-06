import { Injectable } from '@angular/core';
import {Room} from "../model/Room";
import {UserService} from "./user.service";
import {environment} from "../environments/environment";
declare var SockJS: new (arg0: string) => any;
declare var Stomp: { over: (arg0: any) => any; };

@Injectable({
  providedIn: 'root'
})
export class WeksocketService {

  private serverUrl = environment.url + "/socket";
  private stompClient: any;
  public mapEndpointSubscription: Map<string, any> = new Map();

  constructor() {
  }

  public async initWebSocket() {
    return new Promise<void>((resolve) => {
      if (!this.stompClient) {
        const ws = new SockJS(this.serverUrl);
        this.stompClient = Stomp.over(ws);
        this.stompClient.connect({}, resolve);
      } else {
        resolve();
      }
    })
  }

  public async subscribe(name: string, fnc: (event: any) => void) {
    const subscription = this.stompClient.subscribe(`/${name}`, (event: any) => {
      fnc({...event, body: JSON.parse(event.body)})
    });
    this.mapEndpointSubscription.set(name, subscription);
  }

  public unsubscribeToWebSocketEvent(name: string) {
    const subscription = this.mapEndpointSubscription.get(name);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  public send(name: string, body: any) {
    this.stompClient.send(`/app/socket/${name}`, {}, JSON.stringify(body));
  }

  public disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
  }


}
