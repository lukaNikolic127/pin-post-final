import {Component, Input, OnInit} from '@angular/core';
import {UsersService, UserStatusEnum} from "../../services/users.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {Post, PostsService} from "../../services/posts.service";
import {CategoriesService} from "../../services/categories.service";
import {AlertController} from "@ionic/angular";

@Component({
  selector: 'app-my-posts',
  templateUrl: './my-posts.page.html',
  styleUrls: ['./my-posts.page.scss'],
})
export class MyPostsPage implements OnInit {

  @Input() createPostBtnVisible = true;
  posts: Post[] = [];
  noMyPosts = false;

  constructor(private usersService: UsersService, private authService: AuthService, private alertCtrl: AlertController,
              private router: Router, private postsService: PostsService, private categoriesService: CategoriesService) {
  }

  ngOnInit() {
    const userAuthId = this.authService.currentUserAuthId;
    this.usersService.getUserByAuthIdObservable(userAuthId).pipe().subscribe(res => {
      const currentUser = res.pop();
      if (String(UserStatusEnum.Full) === currentUser?.status) {
        this.createPostBtnVisible = true;
      } else {
        this.createPostBtnVisible = false;
      }
    });
  }

  ionViewWillEnter() {
    this.loadMyPosts();
  }

  async logout() {
    this.usersService.userRole = '';
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }

  openCreatePostPage() {
    this.router.navigate(['home/tabs/create-post']);
  }


  protected readonly addEventListener = addEventListener;

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadMyPosts();
      event.target.complete();
    }, 2000);
  }

  private loadMyPosts() {
    this.postsService.getMyPosts().then(res => {
      this.noMyPosts = res.length === 0;
      this.posts = [];
      res.forEach(({id, data}) => {
        const post: Post = {...data, id}
        this.categoriesService.getCategoryNameById(post.category).then(categoryName => {
          post.category = categoryName;
          this.posts.push(post)
        });
      })
    });
  }

  onDeletePost(id: string | undefined) {
    this.alertCtrl.create({
      header: 'Delete post',
      message: 'Are you sure you want to delete this post?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            const postToDelete = this.posts.find(post => post.id == id);
            if (postToDelete) {
              await this.postsService.deletePost(postToDelete)
              this.loadMyPosts();
            }
          }
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    })
  }
}
