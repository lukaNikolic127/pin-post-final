import {Component, OnInit} from '@angular/core';
import {AlertController, LoadingController} from "@ionic/angular";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FirebaseError} from "firebase/app";
import {UsersService} from "../../services/users.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  private AUTH_ERROR_CODE_EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use';

  email: string = '';
  password: string = '';
  registerForm: FormGroup;

  constructor(private alertCtrl: AlertController, private loadingCtrl: LoadingController, private authService: AuthService,
              private router: Router, private formBuilder: FormBuilder, private usersService: UsersService) {
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/),
        Validators.pattern(/^\S*$/)]]
    });
  }

  async register() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    const result = await this.authService.register(this.registerForm.value);
    await this.loadingCtrl.dismiss();

    if (result instanceof FirebaseError) {
      if (result.code === this.AUTH_ERROR_CODE_EMAIL_ALREADY_IN_USE) {
        await this.showAlert('User already exists!', 'Please try with another email.')
      } else {
        await this.showAlert('Registration failed!', 'Please try again.');
      }
    } else {
      this.router.navigateByUrl('/home', {replaceUrl: true});
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

}
