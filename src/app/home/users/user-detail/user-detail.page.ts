import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {User, UserRole, UsersService, UserStatus} from "../../../services/users.service";
import {LoadingController, ToastController} from "@ionic/angular";

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {

  @Input() role = "test";
  @Input() status = "test";
  @Input() email = "test";

  userAuthId: any;
  userDocId: any;
  user: User;
  userRoles: UserRole[] = [];
  userStatuses: UserStatus[] = [];
  currentUserAuthId = '';

  constructor(private activatedRoute: ActivatedRoute, private usersService: UsersService, private authService: AuthService,
              private router: Router, private loadingController: LoadingController, private toastController: ToastController) {

    this.currentUserAuthId = this.authService.currentUserAuthId;

    this.usersService.getAllUserRoles().then(roles => {
      this.userRoles = [];
      roles.forEach(({id, data}) => {
        const role: UserRole = {...data, id};
        this.userRoles.push(role);
      })
    })

    this.usersService.getAllUserStatuses().then(statuses => {
      this.userStatuses = [];
      statuses.forEach(({id, data}) => {
        const status: UserStatus = {...data, id};
        this.userStatuses.push(status);
      })
    })

    this.activatedRoute.paramMap.subscribe(params => {
      this.userAuthId = params.get('userAuthId');
      this.userDocId = params.get('userDocId');


      this.usersService.getUserByDocumentId(this.userDocId).pipe().subscribe(user => {
        this.user = user;
        this.role = user.role;
        this.status = user.status;
        this.email = user.email;
      })
    })
  }

  ngOnInit() {

  }

  async logout() {
    this.usersService.userRole = '';
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }

  async updateUser() {
    this.user.status = this.status;
    this.user.role = this.role;
    this.user.lastModifiedBy = this.authService.currentUserAuthId;
    const loading = await this.loadingController.create({message: 'Updating...'});

    try {
      await loading.present();
      await this.usersService.updateUserRoleAndStatusAndLastModifiedBy(this.user);
      const toast = await this.toastController.create({message: 'Done!', duration: 2000, color: 'success'});
      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Updating user failed!',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
      this.router.navigateByUrl('/home/tabs/users', {replaceUrl: true});
    }
  }
}
