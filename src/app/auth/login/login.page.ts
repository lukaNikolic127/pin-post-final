import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertController, LoadingController} from "@ionic/angular";
import {Router} from "@angular/router";
import {FirebaseError} from "firebase/app";
import {AuthService} from "../../services/auth.service";
import {UserRole, UserRoleEnum, UsersService, UserStatusEnum} from "../../services/users.service";
import {take} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private AUTH_ERROR_INVALID_CREDENTIALS = 'auth/invalid-credential';

  @Input() selectedRole = '';
  loginForm: FormGroup;
  email: string = '';
  password: string = '';
  userRoles: UserRole[] = [];

  constructor(private alertCtrl: AlertController, private loadingCtrl: LoadingController, private authService: AuthService,
              private router: Router, private formBuilder: FormBuilder, private usersService: UsersService) {

    this.usersService.getAllUserRoles().then(roles => {
      this.userRoles = [];
      roles.forEach(({id, data}) => {
        const role: UserRole = {...data, id};
        this.userRoles.push(role);
      })
      this.selectedRole = this.userRoles[1].name;
    })

  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: ['', [Validators.required]]
    });
  }

  async login() {
    const value = this.loginForm.value;
    const email = value.email;
    const selectedRole = value.role;

    const user = await this.usersService.getUserByEmail(email);
    const loading = await this.loadingCtrl.create();
    await loading.present();

    const result = await this.authService.login(this.loginForm.value);
    await this.loadingCtrl.dismiss();

    if (result instanceof FirebaseError) {
      if (result.code === this.AUTH_ERROR_INVALID_CREDENTIALS) {
        await this.showAlert('Invalid credentials!', 'Please try with valid credentials.')
      } else {
        await this.showAlert('Login failed!', 'Please try again later.');
      }
    } else {
      if (user?.loggedInAs) {
        await this.showAlert("Login failed", "The user is already logged in!")
      } else {
        if (user?.status === UserStatusEnum.Banned) {
          await this.showAlert("Login failed", "The user is banned!")
        } else {
          if (selectedRole === UserRoleEnum.Admin && user?.role !== UserRoleEnum.Admin) {
            await this.showAlert("Login failed", "The user does not have admin permissions!")
          } else {
            if (user?.authId) {
              this.usersService.getUserByAuthIdObservable(user?.authId).pipe(take(1)).subscribe(users => {
                const userWithId = users.pop();
                if (userWithId) {
                  userWithId.loggedInAs = selectedRole;
                  this.usersService.updateUserLoggedInAs(userWithId).then(res => {
                    this.router.navigateByUrl('/home', {replaceUrl: true});
                  })
                }
              })
            }
          }
        }
      }
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [{text: 'OK', role: 'cancel'}],
    });
    await alert.present();
  }
}
