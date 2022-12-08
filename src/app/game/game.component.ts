import {Component, OnInit} from '@angular/core';
import {Room} from "../../model/Room";
import {UserService} from "../../services/user.service";
import {User} from "../../model/User";
import {PlayerInTable} from "../../model/PlayerInTable";
import {Form, FormBuilder, FormGroup} from "@angular/forms";
import {Chat} from "../../model/Chat";
import {Discussions} from "../../model/Discussions";
import {PlayComponent} from "../play/play.component";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  public pathIconsPlayer: string[] = [];
  public userInRoom: User[] = [];
  public playerInTable: PlayerInTable[] = [];
  public discussions: Discussions[] = [];

  public displayChatBoxPublic: boolean = false;

  public displayChatBoxPrivate: boolean = false;
  public nameBoxPrivateChat: string = "";
  public idBoxPrivateChat: number = -1;
  // @ts-ignore
  public currentDiscussion: Discussions | undefined = undefined
  public currentLlistChat: Chat[] | undefined = undefined
  public listChatNotification: Chat[] = [];
  public alive: boolean = true;


  public idUser = UserService.idCurrentUser;

  public chatInRoom: Chat[] = [];

  public timer: number = 45;
  public start: boolean = false;
  public state: boolean = true;
  public introduce: boolean = false;
  public displayDay: boolean = false;
  public displayNight: boolean = false;
  public displayTime: boolean = false;

  sendChatForm: FormGroup;
  displayNotification: boolean[] = [];

  constructor(private userService: UserService,
              private formBuilder: FormBuilder) {

    this.sendChatForm = this.formBuilder.group({
      message: ''
    })


    //subscribe to live message
    this.userService.chatInMyRoomShared.subscribe((chat) => {
      this.chatInRoom = chat;
    })

    //subscribe to live private messga
    this.userService.discussionsInMyRoomShared.subscribe( (discussions: Discussions[]) => {
      this.discussions = discussions;
      console.log(this.currentDiscussion);
      console.log(this.discussions)
      if(this.currentLlistChat == undefined) {
        this.currentDiscussion = this.discussions.find((d) => d.equal(this.idBoxPrivateChat, UserService.idCurrentUser));
        this.currentLlistChat = this.discussions.find((d) => d.equal(this.idBoxPrivateChat, UserService.idCurrentUser))?.listChat


      }else{
        //@ts-ignore
        this.currentLlistChat = this.discussions.find((d) => d.equal(this.idBoxPrivateChat, UserService.idCurrentUser))?.listChat
      }
    })

  }

  killUser(id: number) {

  }

  displayNightDescription() {
    this.displayNight = true;
    this.displayTime = false;

    setTimeout(() => {
      this.displayNight = false;
      this.displayTime = true
    }, 4000)
  }

  displayDayDescription() {
    this.displayDay = true;
    this.displayTime = false;

    setTimeout(() => {
      this.displayDay = false;
      this.displayTime = true
    }, 4000)
  }

  ngOnInit(): void {

    //counter
    this.userService.start.subscribe((s) => {

      //we find a user kill
      this.userService.idUserCurrentKill.subscribe((i) => {
        this.killPlayerInTable(i);
      })

      if(s) {
        this.start = s;
        this.introduce = true;
        setTimeout(() => {
          this.introduce = false;
        }, 3500)
      }
      this.userService.counter.subscribe((t) => {
        this.timer = t;
      })
      this.userService.state.subscribe((st) => {
        this.state = st;
        if(this.start) {
          if(st) {
            this.displayDayDescription();
            this.playerInTable.forEach((p) => p.resetVote())
            this.alive = <boolean>this.searchPlayerInTable(UserService.idCurrentUser)?.alive
          } else {
            this.displayNightDescription();
          }
        }
      })

      this.userService.votes.subscribe((v) => {
        this.addVoteForPlayerInTable(v.idTargetUser, <number>v.numberOfVoteTargetUser);
      })
    })


    this.userService.lastChat.subscribe((c: Chat) => {
      let index = this.playerInTable.indexOf(<PlayerInTable>this.playerInTable.find((p) => p.id == c.idSender));
      this.listChatNotification[index] = c;
      this.displayNotification[index] = true;
      setTimeout(() => {
        this.displayNotification[index] = false;
      }, 2000);

    })
    this.userService.currentRoom.subscribe((room: Room) => {
      this.pathIconsPlayer = room.icons || [];
    })
    this.userService.userInMyRoomShared.subscribe((users: User[]) => {
      this.userInRoom = users;

      if(users.length > 0) {
        const path = users[users.length-1].pathPlayerImg;

        if (this.playerInTable.length == 0) {
          this.pathIconsPlayer.forEach((value, index, array) => {
            const user = this.userInRoom.find((user) => user.pathPlayerImg == value);
            let player = new PlayerInTable(value, user?.name || '', user?.id || -1);
            this.playerInTable.push(player)

            if(index == 5 && player.id != UserService.idCurrentUser) {
              this.playerInTable.forEach((v) => {
                if(v.id == UserService.idCurrentUser){
                  let temp: PlayerInTable = new PlayerInTable('', '', -1);
                  temp.id = this.playerInTable[5].id;
                  temp.name = this.playerInTable[5].name;
                  temp.pathIcon = this.playerInTable[5].pathIcon;
                  this.playerInTable[5].id = v.id ;
                  this.playerInTable[5].name = v.name;
                  this.playerInTable[5].pathIcon = v.pathIcon;
                  v.id = temp.id;
                  v.name = temp.name;
                  v.pathIcon = temp.pathIcon;
                }
              })
            }

          })
        } else {
          let player: any = this.playerInTable.find((value) =>
            value.pathIcon == path
          )

          player.name = users[users.length-1].name;
          player.id = users[users.length-1].id;



        }
        console.log(this.playerInTable)
      }

    })
  }

  manageDisplayBoxPublicChat() {
      this.displayChatBoxPublic = !this.displayChatBoxPublic;
  }

  sendPublicChat() {
    const formValue = this.sendChatForm.value;

    this.userService.sendChatPublic(formValue.message);
  }

  sendPrivateChat() {
    const formValue = this.sendChatForm.value;

    this.userService.sendChatPrivate(formValue.message, this.idBoxPrivateChat);
    this.sendChatForm.reset();
  }

  privateChat(id: number, name: string) {
    console.log("i want send a msg to : " + id);
    this.displayChatBoxPrivate = true;
    this.nameBoxPrivateChat = name;
    this.idBoxPrivateChat = id;
    console.log(this.currentLlistChat);
    this.currentLlistChat = this.searchCurrentDiscussion(id)?.listChat || [];
    console.log(this.currentLlistChat);
    let el = document.getElementsByClassName('chat-private-messages');
    el[0].scrollTop = el[0].scrollHeight;
  }
  UnDisplayPrivateChat(){
    this.displayChatBoxPrivate = false;
    this.nameBoxPrivateChat = '';
    this.idBoxPrivateChat = -1;
    this.currentLlistChat = [];
    console.log(this.currentLlistChat);

  }

  addVoteForPlayerInTable(id: number, vote: number) {
    this.searchPlayerInTable(id)?.addVote(vote);
  }
  killPlayerInTable(id: number) {
    this.searchPlayerInTable(id)?.kill();
  }

  searchPlayerInTable(id: number) {
    return this.playerInTable.find((p) => p.id == id)
  }

  searchCurrentDiscussion(idUser: number): Discussions | undefined{
    console.log(idUser + ' ' + UserService.idCurrentUser)
    console.log(this.discussions)
    console.log(this.discussions.find((d) => d.equal(UserService.idCurrentUser, idUser)));

    return this.discussions.find((d) => d.equal(UserService.idCurrentUser, idUser));
  }

  classChat(id: number) {
    return (id == this.idBoxPrivateChat) ? "chatRight" : "chatLeft";
  }


  vote(idTarget: number) {
    this.userService.vote(idTarget);
  }
}
