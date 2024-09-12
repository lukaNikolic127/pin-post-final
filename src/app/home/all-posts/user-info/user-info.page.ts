import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User, UsersService} from "../../../services/users.service";
import {Post, PostsService} from "../../../services/posts.service";
import {AuthService} from "../../../services/auth.service";
import {SubscriptionsService} from "../../../services/subscriptions.service";
import {CategoriesService} from "../../../services/categories.service";
import {take} from "rxjs";

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
})
export class UserInfoPage implements OnInit {

  userEmail = '';
  userAuthId: any;
  currentUserId = '';
  following: boolean;
  posts: Post[] = [];
  categoryForSearch: any;
  currentUserAuthId = '';
  currentUserEmail = '';
  noUsersPosts = false;

  constructor(private activatedRoute: ActivatedRoute, private usersService: UsersService, private postsService: PostsService, private authService: AuthService, private subscriptionsService: SubscriptionsService, private categoriesService: CategoriesService) {
    this.currentUserId = this.authService.currentUserAuthId;
    this.activatedRoute.paramMap.pipe(take(1)).subscribe(params => {
      this.userAuthId = params.get('userAuthId');
      this.usersService.getUserByAuthIdPromise(this.userAuthId).then(user => {
        if(user){
          this.userEmail = user.email;
        }
        this.postsService.getPostsWithFilters(this.categoryForSearch, this.userAuthId, "creationTimeDesc").then(posts => {
          this.noUsersPosts = posts.length === 0;
          posts.forEach(({id, data}) => {
            const post: Post = {...data, id}
            this.categoriesService.getCategoryNameById(post.category).then(categoryName => {
              post.category = categoryName;
              this.posts.push(post)
            })
          })
        })
      })
      this.subscriptionsService.isUserSubscriber(this.currentUserId, this.userAuthId).then(subscribed => {
        if (subscribed) {
        } else {
        }
        this.following = subscribed;
      })
    })
  }

  ionViewWillEnter() {
    this.currentUserAuthId = this.authService.currentUserAuthId;
    this.currentUserEmail = this.authService.currentUserEmail;
  }

  ngOnInit() {
  }

  async follow() {
    this.subscriptionsService.addSubscription(this.currentUserId, this.userAuthId).then(res => {
      this.following = true;
    })
  }

  unfollow() {
    this.subscriptionsService.removeSubscription(this.currentUserId, this.userAuthId).then(res => {
      this.following = false;
    })
  }

  async likeOrUnlikePost(post: Post) {
    let heartIcon = document.getElementById("heartIconUserInfo" + post.id) as HTMLElement;
    let name = heartIcon.getAttribute('name');
    let likesLabel = document.getElementById("likesUserInfo" + post.id) as HTMLElement;
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

  async favorOrUnfavorPost(post: Post) {
    let saveIcon = document.getElementById("saveIconUserInfo" + post.id) as HTMLElement;
    let name = saveIcon.getAttribute('name');
    let savingsLabel = document.getElementById("savingsUserInfo" + post.id) as HTMLElement;
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
}
