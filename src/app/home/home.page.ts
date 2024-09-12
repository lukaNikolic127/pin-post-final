import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {UserRoleEnum, UsersService, UserStatusEnum} from "../services/users.service";
import {Router} from "@angular/router";
import {AlertController} from "@ionic/angular";
import {Subscription} from "rxjs";
import {ToastService} from "../services/toast.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @Input() usersMenuItemVisible = true;

  constructor(private usersService: UsersService, private authService: AuthService, private router: Router,
              private alertCtrl: AlertController, private toastService: ToastService) {
  }

  role: string | undefined = '';
  status: string | undefined = '';
  roleChangeSubscription: Subscription;

  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.roleChangeSubscription.unsubscribe();
          }
        }
      ]
    });
    alert.present();
  }

  ngOnInit(): void {
    const userAuthId = this.authService.currentUserAuthId;
    let currentUserRole = this.authService.currentUserRole;
    let currentUserStatus = this.authService.currentUserStatus;
    this.roleChangeSubscription = this.usersService.getUserByAuthIdObservable(userAuthId).pipe().subscribe(res => {
      const currentUser = res.pop();

      if (currentUser?.lastModifiedBy.length != 0 && currentUser?.loggedInAs.length != 0 && userAuthId === currentUser?.authId && (currentUserRole !== currentUser?.role || currentUserStatus !== currentUser?.status)) {
        if (currentUser?.status === UserStatusEnum.Banned) {
          this.router.navigateByUrl('/banned', {replaceUrl: true})
        }
        if (currentUser?.role) {
          currentUserRole = currentUser?.role;
        }
        if (currentUser?.status) {
          currentUserStatus = currentUser?.status;
        }
        this.toastService.presentToast("Permissions changed by admin.");
      }
      if (currentUser?.role === UserRoleEnum.Admin && currentUser.loggedInAs === UserRoleEnum.Admin) {
        this.usersMenuItemVisible = true;
      } else {
        this.usersMenuItemVisible = false;
      }
    });
  }
}
