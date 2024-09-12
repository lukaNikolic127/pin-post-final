import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../services/users.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {CategoriesService, Category} from "../../services/categories.service";
import {AlertController} from "@ionic/angular";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  categories: Category[] = [];

  constructor(private usersService: UsersService, private categoriesService: CategoriesService,
              private authService: AuthService, private router: Router, private alertCtrl: AlertController) {
  }

  ionViewWillEnter() {
    this.loadAllCategories();
  }

  loadAllCategories() {
    this.categoriesService.getAllCategories().then(res => {
      this.categories = [];
      res.forEach(({id, data}) => {
        const category: Category = {...data, id}
        this.categories.push(category)
      })
    });
  }

  ngOnInit() {
  }

  async logout() {
    this.usersService.userRole = '';
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }

  onDeleteCategory(id: string | undefined) {
    this.alertCtrl.create({
      header: 'Delete category',
      message: 'Are you sure you want to delete this category?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.categoriesService.deleteCategory(id).then(res => {
                this.loadAllCategories();
              });
            } catch (error) {
              const errorAlert = await this.alertCtrl.create({
                header: 'Category deletion failed',
                message: 'Category cannot be deleted since it is used by post(s).',
                buttons: ['Ok']
              });
              errorAlert.present();
            }
          }
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    })
  }

}
