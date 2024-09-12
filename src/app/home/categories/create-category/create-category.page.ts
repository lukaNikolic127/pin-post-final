import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../../services/users.service";
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CategoriesService} from "../../../services/categories.service";
import {AlertController, LoadingController, ToastController} from "@ionic/angular";

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.page.html',
  styleUrls: ['./create-category.page.scss'],
})
export class CreateCategoryPage implements OnInit {

  categoryForm: FormGroup;

  constructor(private usersService: UsersService, private authService: AuthService, private router: Router,
              private formBuilder: FormBuilder, private categoriesService: CategoriesService, private alertCtrl: AlertController,
              private loadingController: LoadingController, private toastController: ToastController) {
  }

  ngOnInit() {
    this.categoryForm = this.formBuilder.group({
      categoryName: ['', Validators.required]
    })
  }

  async logout() {
    this.usersService.userRole = '';
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }
  async createCategory() {
    const value = this.categoryForm.value;
    const categoryName = value.categoryName;
    const categoryExists = await this.categoriesService.isCategoryExisting(categoryName);
    if (categoryExists) {
      await this.showCategoryAlreadyExistsAlert("Creation failed", "Category already exists.");
    } else {
      const loading = await this.loadingController.create({message: 'Updating...'});
      try {
        await this.categoriesService.createCategory(categoryName);
        const toast = await this.toastController.create({message: 'Done!', duration: 2000, color: 'success'});
        await toast.present();
      } catch (error) {
        const toast = await this.toastController.create({
          message: 'Category creation failed!',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        await loading.dismiss();
        this.router.navigateByUrl('/home/tabs/categories', {replaceUrl: true});
      }
    }
  }

  async showCategoryAlreadyExistsAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
