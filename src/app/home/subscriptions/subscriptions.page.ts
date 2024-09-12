import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../services/users.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {SubscriptionsService} from "../../services/subscriptions.service";

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.scss'],
})
export class SubscriptionsPage implements OnInit {

  publishers: { [key: string]: boolean } = {};
  subscriberAuthId: any;
  publishersDisplay: { [key: string]: string } = {};
  noSubscriptions = false;

  constructor(private usersService: UsersService, private authService: AuthService, private router: Router, private subscriptionsService: SubscriptionsService) {
    this.subscriptionsService.getSubscriptionsForCurrentUser().pipe().subscribe(res => {
      let publishers = res.at(0)?.publishers;
      if (publishers) {
        this.noSubscriptions = Object.keys(publishers).length === 0;
      }
      this.subscriberAuthId = res.at(0)?.subscriber;
      if (publishers) {
        this.publishers = publishers;
        for (const [key, value] of Object.entries(this.publishers)) {
          this.usersService.getUserByAuthIdPromise(key).then(user => {
            if (user) {
              this.publishersDisplay[key] = user.email;
            }
          })
        }
      }
    })
  }

  ngOnInit() {
  }

  async logout() {
    this.usersService.userRole = '';
    await this.authService.logout();
    await this.router.navigateByUrl('login', {replaceUrl: true})
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  async removeBadge(subscriberAuthId: string, publisherAuthId: string) {
    await this.subscriptionsService.setIsNewPostFromPublisher(subscriberAuthId, publisherAuthId);
  }

  async unfollow(subscriberAuthId: string, publisherAuthId: string) {
    await this.subscriptionsService.removeSubscription(subscriberAuthId, publisherAuthId);
  }
}
