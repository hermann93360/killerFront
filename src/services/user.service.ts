import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {User} from "../model/User";
import {Room} from "../model/Room";
import {WeksocketService} from "./weksocket.service";
import {JoinRoom} from "../model/JoinRoom";
import {Router, UrlSegment} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {Chat} from "../model/Chat";
import {Discussions} from "../model/Discussions";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private URL = environment.url;

  public static idCurrentUser: number = 0;

  public currentUser: BehaviorSubject<User> = new BehaviorSubject<any>('');
  public currentRoom: BehaviorSubject<Room> = new BehaviorSubject<any>('');

  public userInMyRoomShared: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([])
  public userInMyRoom: User[] = [];

  public chatInMyRoomShared: BehaviorSubject<Chat[]> = new BehaviorSubject<Chat[]>([])
  public chatInMyRoom: Chat[] = [];

  public lastChat: BehaviorSubject<Chat> = new BehaviorSubject<any>('');

  public discussionsInMyRoomShared: BehaviorSubject<Discussions[]> = new BehaviorSubject<Discussions[]>([])
  public discussionsInMyRoom: Discussions[] = [];


  public roomShared: BehaviorSubject<Room[]> = new BehaviorSubject<Room[]>([])
  public room: Room[] = [];

  public userShared: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([])
  public user: User[] = [];

  public numberOfUserInCurrentRoom: number = 0;
  public numberOfUser: number = 0;


  constructor(private webSocketService: WeksocketService,
              private router: Router,
              private http: HttpClient) {

    window.addEventListener('beforeunload', function (e) {
      webSocketService.send("disconnect", new User("unknow", UserService.idCurrentUser));
    });

  }


  initConnectionToServer(user: User) {
    // recovery data like users rooms etc..
    this.initInitialData();

    return this.webSocketService.initWebSocket()
      .then(() => {
        this.webSocketService.subscribe("socket/newRoom", (event) => {
          const room: Room = new Room(event.body.name, event.body.numberOfUser, event.body.icons, event.body.id);
          this.addRoom(room);
          console.log(room)
        })
      })
      .then(() => {
        this.webSocketService.subscribe("socket/newUser", (event) => {

          const user: User = new User(event.body.name, event.body.id);
          if(this.numberOfUser == 0){
            this.defineIdCurrentUser(event.body.id);
            this.currentUser.next(user);
          }

          this.addUser(user);
          this.numberOfUser++;
        }).then(() => {
          this.webSocketService.send("newUser", user);
        });
      })
      .then(() => {
        this.webSocketService.subscribe("socket/someoneJoinAnyRoom", (event) => {
          this.updateNumberOfUserInRoom(event.body.idRoom, event.body.numberOfUser);
        })
      })
      .then(() => {
        this.webSocketService.subscribe("socket/someoneLeaveAnyRoom", (event) => {
          this.updateNumberOfUserInRoom(event.body.idRoom, event.body.numberOfUser);
        })
      });
  }

  joinRoom(idRoom: number) {
    const joinRoom: JoinRoom = new JoinRoom(idRoom, UserService.idCurrentUser);

    //get users initial in room
    this.getUsersByRoom(idRoom).subscribe((users) => {
      users.forEach((u: any) => {
        this.userInMyRoom.push(u);
        this.userInMyRoomShared.next(this.userInMyRoom);
      })
    })

    //get chat initial in room
    this.getChatsByRoom(idRoom).subscribe((chat) => {
      chat.forEach((u: any) => {
        this.chatInMyRoom.push(u);
        this.chatInMyRoomShared.next(this.chatInMyRoom);
      })
    })

    return this.webSocketService.subscribe("socket/someoneJoined/" + idRoom, (event) => {
      console.log("someone JOIN ROOM !!!")

      if(this.numberOfUserInCurrentRoom == 0) {
        this.currentRoom.next(this.searchRoom(event.body.idRoom));
      }

      let user: User = this.searchUser(event.body.idUser);
      user.pathPlayerImg = event.body.pathPlayerImg;

      this.userInMyRoom.push(user);
      this.userInMyRoomShared.next(this.userInMyRoom);
      this.numberOfUserInCurrentRoom++;


    }).then(() => {
      this.webSocketService.subscribe("socket/publicChat/" + idRoom, (event) => {
        const chat = new Chat(event.body.message, event.body.nameSender);

        this.chatInMyRoom.push(chat);
        this.chatInMyRoomShared.next(this.chatInMyRoom);
      })
    }).then(() => {
      this.webSocketService.subscribe("socket/privateChat/" + UserService.idCurrentUser, (event) => {
        const discussion = new Discussions(event.body.listChat, event.body.idUser1, event.body.idUser2)

        this.addOrReplaceDiscussion(discussion);
      })
    }).then(() => {
      this.webSocketService.subscribe("socket/privateChatNotif/" + UserService.idCurrentUser, (event) => {
        const chat = new Chat(event.body.message, event.body.nameSender, event.body.idSender);
        this.lastChat.next(chat);

      })
    })
      .then(() => {
      this.webSocketService.send("/joinRoom", joinRoom);
    })
  }

  addOrReplaceDiscussion(discussion: Discussions) {
    for(let i = 0; i < this.discussionsInMyRoom.length; i++) {
      if(this.discussionsInMyRoom[i].equal(discussion.idUser2, discussion.idUser1)){
        this.discussionsInMyRoom[i].replace(discussion.listChat);
        this.discussionsInMyRoomShared.next(this.discussionsInMyRoom);
        return;
      }
    }
    this.discussionsInMyRoom.push(discussion);
    this.discussionsInMyRoomShared.next(this.discussionsInMyRoom);
  }

  defineIdCurrentUser(id: number): void {
    UserService.idCurrentUser = id;
  }

  addUser(user: User): void {
    this.user.push(user);
    this.userShared.next(this.user);
    console.log(this.user);
  }

  addRoom(room: Room) {
    this.room.push(room);
    this.roomShared.next(this.room);
  }

  updateNumberOfUserInRoom(idRoom: number, size: number) {
    this.room
      .filter((room: Room) => room.id == idRoom)
      .map((room: Room) => room.numberOfUser = size);

    console.log(this.room)
    this.roomShared.next(this.room);
  }

  initInitialData() {
    this.getAllUser().subscribe((users) => {
      users.forEach((u: any) => {
        this.addUser(new User(u.name, u.id, u.pathPlayerImg));
      })
    })

    this.getAllRoom().subscribe((rooms: Room[]) => {
      rooms.forEach((r) => {
        this.addRoom(new Room(r.name, r.numberOfUser, r.icons, r.id));
      })
    })
  }

  initDataCurrentRoom(idRoom: number) {
    this.getUsersByRoom(idRoom).subscribe((users) => {
      users.forEach((u: any) => {
        this.addUser(new User(u.name, u.id, u.pathPlayerImg));
      })
    })
  }

  getAllUser(): Observable<any>{
    return this.http.get<User[]>(this.URL + "/get/users");
  }

  getUsersByRoom(idRoom: number): Observable<any>{
    return this.http.get<User[]>(this.URL + "/get/users/" + idRoom);
  }

  getChatsByRoom(idRoom: number): Observable<any>{
    return this.http.get<Chat[]>(this.URL + "/get/chats/" + idRoom);
  }

  getAllRoom(): Observable<any>{
    return this.http.get<Room[]>(this.URL + "/get/rooms");
  }

  searchRoom(idRoom: number): Room {
    return this.room.find((room) => room.id == idRoom) || {};
  }

  searchUser(idUser: number): User {
    return this.user.find((user) => user.id == idUser) || {};
  }

  sendChatPublic(message: string) {
    const chat= new Chat(message, this.currentUser.value.name || '', UserService.idCurrentUser, this.currentRoom.value.id)
    this.webSocketService.send("sendPublicChat", chat);
  }

  sendChatPrivate(message: string, idBoxPrivateChat: number) {
    const chat= new Chat(message, this.currentUser.value.name || '', UserService.idCurrentUser, idBoxPrivateChat)
    this.webSocketService.send("sendPrivateChat", chat);
  }

  receiveNotification() {

  }
}
