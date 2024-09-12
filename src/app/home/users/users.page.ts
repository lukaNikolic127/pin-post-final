import {Component, OnInit} from '@angular/core';
import {User, UsersService} from "../../services/users.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  users: User[] = [];

  constructor(private usersService: UsersService, private authService: AuthService, private router: Router) {

  }

  ionViewWillEnter() {
    this.usersService.getAllUsers().then(res => {
      this.users = [];
      res.forEach(({id, data}) => {
        const user: User = {...data, id}
        this.users.push(user)
      })
    });
  }

  ngOnInit() {
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }
}
