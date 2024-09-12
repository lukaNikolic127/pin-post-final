import {Component, OnInit} from '@angular/core';
import {UsersService} from "../services/users.service";
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-banned',
  templateUrl: './banned.page.html',
  styleUrls: ['./banned.page.scss'],
})
export class BannedPage implements OnInit {

  constructor(private usersService: UsersService, private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }
}
