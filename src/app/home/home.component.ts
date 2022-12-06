import { Component, OnInit } from '@angular/core';
import {WeksocketService} from "../../services/weksocket.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {User} from "../../model/User";
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private currentUser: any;

  public newUserForm: FormGroup;

  constructor(private websocketService: WeksocketService,
              private formBuilder: FormBuilder,
              private userService: UserService,
              private router: Router) {

    this.newUserForm = this.formBuilder.group({
      name: '',
    });

  }

  addUser() {
    const formValue = this.newUserForm.value;
    let user: User = new User(
      formValue.name
    );
    this.init(user);
  }

  addUserToList(user: User): void {
    this.userService.addUser(user);
  }



  init(user: User): void {
    this.userService.initConnectionToServer(user).then(() => {
      this.router.navigate(['/play'])
    });
  }

  ngOnInit(): void {
  }

}
