import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {WeksocketService} from "../../services/weksocket.service";
import {Room} from "../../model/Room";
import {User} from "../../model/User";
import {UserService} from "../../services/user.service";
import {JoinRoom} from "../../model/JoinRoom";
import {Router} from "@angular/router";

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {

  displayBoxCreateRoom: boolean = false;
  addRoomForm: FormGroup;
  roomsList: Room[] = [];
  private numberOfJoinRoom: number = 0;

  constructor(private formBuilder: FormBuilder,
              private socketService: WeksocketService,
              private userService: UserService,
              private router: Router) {

    this.addRoomForm = this.formBuilder.group({
      name: ''
    })

    this.listenNewRoom()
  }

  listenNewRoom(): void {
    this.userService.roomShared.subscribe((value) => {
      console.log(value);
      this.roomsList = value.map((value: Room) => {
        return {name: value.name, id: value.id, numberOfUser: value.numberOfUser, icons: value.icons}
      })
    })
  }

  ngOnInit(): void {
  }

  manageBoxCreateRoomBtn() {
    this.displayBoxCreateRoom = !this.displayBoxCreateRoom;
  }

  addRoom() {
    const formValue = this.addRoomForm.value;
    console.log(formValue)

    const room: Room = new Room(formValue.name);

    this.socketService.send("/newRoom", room);
    this.manageBoxCreateRoomBtn();
  }

  joinRoom(idRoom: number) {
    if(idRoom != 0) {
      this.userService.joinRoom(idRoom).then(() => {
        this.router.navigate(['/game']);
      });
    }
  }


}
