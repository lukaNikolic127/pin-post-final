import {Injectable} from '@angular/core';
import {collection, collectionData, doc, Firestore, getDocs, query, updateDoc, where} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";

export interface Subscription {
  id?: string,
  subscriber: string,
  publishers: { [key: string]: boolean }
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {

  constructor(private firestore: Firestore, private authService: AuthService) {
  }

  getSubscriptionsForCurrentUser(): Observable<Subscription[]> {
    const currentUserAuthId = this.authService.currentUserAuthId;
    const subscriptionsRef = collection(this.firestore, 'subscriptions');
    const q = query(subscriptionsRef, where('subscriber', '==', currentUserAuthId))
    return collectionData(q, {idField: 'id'}) as Observable<Subscription[]>;
  }

  async addSubscription(subscriberAuthId: string, publisherAuthId: string) {
    const subscriptionsRef = collection(this.firestore, 'subscriptions');
    const q = query(subscriptionsRef, where('subscriber', '==', subscriberAuthId));
    const subscriptions = await getDocs(q);
    let publishers;
    let subscriptionDocRef;
    subscriptions.forEach(sub => {
      subscriptionDocRef = sub.ref;
      publishers = sub.get('publishers')
      publishers[publisherAuthId] = false;
    })
    if (subscriptionDocRef) {
      await updateDoc(subscriptionDocRef, {subscriber: subscriberAuthId, publishers: publishers})
    }
  }

  async removeSubscription(subscriberAuthId: string, publisherAuthId: string) {
    const subscriptionsRef = collection(this.firestore, 'subscriptions');
    const q = query(subscriptionsRef, where('subscriber', '==', subscriberAuthId));
    const subscriptions = await getDocs(q);
    let publishers;
    let subscriptionDocRef;
    subscriptions.forEach(sub => {
      subscriptionDocRef = sub.ref;
      publishers = sub.get('publishers')
      if (publishers.hasOwnProperty(publisherAuthId)) {
        delete publishers[publisherAuthId];
      }
    })
    if (subscriptionDocRef) {
      await updateDoc(subscriptionDocRef, {subscriber: subscriberAuthId, publishers: publishers})
    }
  }

  async isUserSubscriber(subscriberAuthId: string, publisherAuthId: string): Promise<boolean> {
    const subscriptionsRef = collection(this.firestore, 'subscriptions');
    const q = query(subscriptionsRef, where('subscriber', '==', subscriberAuthId));
    const subscriptions = await getDocs(q);
    let subscribed = false;
    subscriptions.forEach(sub => {
      const publishers = sub.get('publishers');
      if (publisherAuthId in publishers) {
        subscribed = true;
      } else {
        subscribed = false;
      }
    })
    return subscribed;
  }

  async setIsNewPostFromPublisher(subscriberAuthId: string, publisher: string) {
    const subscriptionsRef = collection(this.firestore, 'subscriptions');
    const q = query(subscriptionsRef, where('subscriber', '==', subscriberAuthId));
    const subscriptions = await getDocs(q);

    let publishers;
    let subscriptionDocRef;
    subscriptions.forEach(sub => {
      subscriptionDocRef = sub.ref;
      publishers = sub.get('publishers')
      if (publishers.hasOwnProperty(publisher)) {
        publishers[publisher] = false;
      }
    })
    if (subscriptionDocRef) {
      await updateDoc(subscriptionDocRef, {subscriber: subscriberAuthId, publishers: publishers})
    }
  }

  async notifySubscribers(publisher: string) {
    const subscriptionsRef = collection(this.firestore, 'subscriptions');
    const q = query(subscriptionsRef);
    const subscriptions = await getDocs(q);

    subscriptions.forEach(sub => {
      let publishers;
      let subscriber = sub.get('subscriber');
      let subscriptionDocRef;

      subscriptionDocRef = sub.ref;
      publishers = sub.get('publishers')
      if (publishers.hasOwnProperty(publisher)) {
        publishers[publisher] = true;
        if (subscriptionDocRef) {
          updateDoc(subscriptionDocRef, {subscriber: subscriber, publishers: publishers})
        }
      }
    })
  }

}
