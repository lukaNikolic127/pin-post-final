import {Component, OnInit} from '@angular/core';
import {User, UsersService} from "../../services/users.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {Post, PostsService} from "../../services/posts.service";
import {AlertController} from "@ionic/angular";
import {CategoriesService, Category} from "../../services/categories.service";

@Component({
  selector: 'app-favorite-posts',
  templateUrl: './favorite-posts.page.html',
  styleUrls: ['./favorite-posts.page.scss'],
})
export class FavoritePostsPage implements OnInit {

  posts: Post[] = [];
  noFavorites = false;
  currentUserAuthId = '';
  currentUserEmail = '';
  categories: Category[] = [];
  users: User[] = [];

  constructor(private usersService: UsersService, private authService: AuthService, private router: Router, private postsService: PostsService,
              private alertCtrl: AlertController, private categoriesService: CategoriesService) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.currentUserAuthId = this.authService.currentUserAuthId;
    this.currentUserEmail = this.authService.currentUserEmail;
    this.categoriesService.getAllCategories().then(res => {
      this.categories = [];
      res.forEach(({id, data}) => {
        const category: Category = {...data, id}
        this.categories.push(category)
      })
    });
    this.usersService.getAllUsers().then(res => {
      this.users = [];
      res.forEach(({id, data}) => {
        const user: User = {...data, id}
        this.users.push(user)
      })
    });
    this.loadFavorites();
  }

  async logout() {
    this.usersService.userRole = '';
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }

  private loadFavorites() {
    this.postsService.getFavoritesPosts(this.authService.currentUserAuthId).then(res => {
      this.noFavorites = res.length === 0;
      this.posts = [];
      res.forEach(({id, data}) => {
        const post: Post = {...data, id}
        this.categoriesService.getCategoryNameById(post.category).then(categoryName => {
          this.usersService.getUserByAuthIdPromise(post.author).then(user => {
            if (user?.email) {
              post.author = user?.email;
            }
            post.category = categoryName;
            this.posts.push(post)
          })
        })
      })
    });
  }

  async removeFromFavorites(post: Post) {
    if(post.id){
      await this.postsService.toggleFavorite(post.id);
    }
  }

  onRemoveFromFavorites(post: Post) {
    this.alertCtrl.create({
      header: 'Remove from favorites',
      message: 'Are you sure you want to remove this post from favorites?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          handler: async () => {
            await this.removeFromFavorites(post);
            this.loadFavorites();
          }
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    })
  }
}
