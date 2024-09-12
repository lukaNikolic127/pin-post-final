import {Component, Input, OnInit} from '@angular/core';
import {User, UserRoleEnum, UsersService} from "../../services/users.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {Post, PostsService} from "../../services/posts.service";
import {CategoriesService, Category} from "../../services/categories.service";
import {Subscription} from "rxjs";
import {AlertController} from "@ionic/angular";

export interface PostExtendedWithEmail {
  post: Post,
  email: string | undefined
}

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.page.html',
  styleUrls: ['./all-posts.page.scss'],
})

export class AllPostsPage implements OnInit {

  extendedPosts: PostExtendedWithEmail[] = [];
  // posts: Post[] = [];
  users: User[] = [];
  currentUserAuthId = '';
  currentUserEmail = '';
  showFilters: boolean = false;
  categories: Category[] = [];
  noSearchResults = false;
  roleChangeSubscription: Subscription;
  @Input() categoryForSearch: any;
  @Input() sortingForSearch: any;
  @Input() userForSearch: any;
  @Input() currentUserLoggedInAsAdmin = false;

  constructor(private usersService: UsersService, private authService: AuthService, private router: Router, private postsService: PostsService, private categoriesService: CategoriesService, private alertCtrl: AlertController) {
  }

  ngOnInit(): void {
    const userAuthId = this.authService.currentUserAuthId;
    this.roleChangeSubscription = this.usersService.getUserByAuthIdObservable(userAuthId).pipe().subscribe(res => {
      const currentUser = res.pop();
      if (currentUser?.role === UserRoleEnum.Admin && currentUser.loggedInAs === UserRoleEnum.Admin) {
        this.currentUserLoggedInAsAdmin = true;
      } else {
        this.currentUserLoggedInAsAdmin = false;
      }
    });
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
    this.loadPosts();
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadPosts();
      event.target.complete();
    }, 2000);
  }

  async loadPosts() {
    this.extendedPosts = [];
    const posts = await this.postsService.getAllPosts();
    await this.adaptAndStorePosts(posts);
  }

  async applyFilters() {
    this.extendedPosts = [];
    let filteredResponse = await this.postsService.getPostsWithFilters(this.categoryForSearch, this.userForSearch, this.sortingForSearch);
    await this.adaptAndStorePosts(filteredResponse);
  }

  async adaptAndStorePosts(posts: { id: string, data: Post }[]) {
    for (const {id, data} of posts) {
      const categoryName = await this.categoriesService.getCategoryNameById(data.category);
      const user = await this.usersService.getUserByAuthIdPromise(data.author);
      if (user?.email) {
        const email = user.email;
        let post: Post = data;
        post.id = id;
        let extendedPost: PostExtendedWithEmail = {post: post, email: email}
        extendedPost.post.category = categoryName;
        this.extendedPosts.push(extendedPost)
      }
    }
  }

  async likePost(post: Post) {
    console.log("Liking post...")
    let heartIcon = document.getElementById("heartIcon" + post.id) as HTMLElement;
    let name = heartIcon.getAttribute('name');
    let likesLabel = document.getElementById("likes" + post.id) as HTMLElement;
    let likes = Number(likesLabel.innerText);
    if (name === 'heart-outline') {
      heartIcon.setAttribute("name", "heart");
      likes++;
    } else {
      heartIcon.setAttribute("name", "heart-outline");
      likes--;
    }
    likesLabel.innerText = String(likes);
    await this.postsService.likeOrUnlikePost(post);
  }

  async addToFavorites(post: Post) {
    let saveIcon = document.getElementById("saveIcon" + post.id) as HTMLElement;
    let name = saveIcon.getAttribute('name');
    let savingsLabel = document.getElementById("savings" + post.id) as HTMLElement;
    let savings = Number(savingsLabel.innerText);
    if (name === 'save-outline') {
      saveIcon.setAttribute("name", "save");
      savings++;
    } else {
      saveIcon.setAttribute("name", "save-outline");
      savings--;
    }
    savingsLabel.innerText = String(savings);
    await this.postsService.favorOrUnfavorPost(post);
  }

  toggleFilters() {
    let btn = document.getElementById("showFiltersBtn") as HTMLElement;
    let btnText = btn.innerText;
    if (this.showFilters) {
      this.showFilters = false;
      btn.innerText = "Show filters"
    } else {
      this.showFilters = true;
      btn.innerText = "Hide filters"
    }
  }

  resetFilters() {
    this.categoryForSearch = undefined;
    this.userForSearch = undefined;
    this.sortingForSearch = undefined;
  }

  async onDeleteProblematicPost(id: string | undefined) {
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
            const postToDelete = this.extendedPosts.find(post => post.post.id == id);
            if (postToDelete) {
              await this.postsService.deletePost(postToDelete.post)
              this.loadPosts();
            }
          }
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    })
  }

}
