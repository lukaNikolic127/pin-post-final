import {Injectable} from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDocs,
  limit,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import {Observable, take} from "rxjs";
import {Subscription} from "./subscriptions.service";

export interface User {
  id?: string | undefined;
  authId: string;
  status: string;
  role: string;
  email: string,
  loggedInAs: string,
  lastModifiedBy: string
}

export interface UserRole {
  id?: string | undefined;
  name: string;
}

export interface UserStatus {
  id?: string | undefined;
  name: string;
}

export enum UserStatusEnum {
  Full = 'Full',
  Archived = 'Archived',
  Banned = 'Banned'
}

export enum UserRoleEnum {
  Regular = 'Regular',
  Admin = 'Admin'
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  currentUser: User;
  userRole: string;

  constructor(private firestore: Firestore) {
  }

  getUserByAuthIdObservable(authId: string): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('authId', '==', authId), limit(1));
    return collectionData(q, {idField: 'id'}) as Observable<User[]>;
  }

  async addUser(user: User) {
    this.createUser(user).then(res => {
      this.getUserByDocumentId(res.id).pipe(take(1)).subscribe(user => {
        if (user.authId) {
          this.initializeSubscriptionsForUser(user.authId);
        }
      })
    })
  }

  async createUser(user: User) {
    const usersRef = await collection(this.firestore, 'users');
    return await addDoc(usersRef, user);
  }

  async initializeSubscriptionsForUser(userId: string) {
    const subscriptionsRef = collection(this.firestore, 'subscriptions');
    const subscription: Subscription = {subscriber: userId, publishers: {}};
    await addDoc(subscriptionsRef, subscription);
  }

  async getUserByAuthIdPromise(authId: string): Promise<User | undefined> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('authId', '==', authId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const user = querySnapshot.docs[0].data() as User;
      return user;
    } else {
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const user = querySnapshot.docs[0].data() as User;
      return user;
    } else {
      return undefined;
    }
  }

  async getAllUserRoles(): Promise<{ id: string, data: UserRole }[]> {
    const rolesRef = collection(this.firestore, 'roles');
    const q = query(rolesRef);
    const rolesSnapshot = await getDocs(q);
    const roles: { id: string, data: UserRole }[] = [];
    rolesSnapshot.forEach(doc => {
      const role = doc.data() as UserRole;
      roles.push({id: doc.id, data: role})
    })
    return roles;
  }

  async getAllUserStatuses(): Promise<{ id: string, data: UserStatus }[]> {
    const statusesRef = collection(this.firestore, 'statuses');
    const q = query(statusesRef);
    const statusesSnapshot = await getDocs(q);
    const statuses: { id: string, data: UserStatus }[] = [];
    statusesSnapshot.forEach(doc => {
      const status = doc.data() as UserStatus;
      statuses.push({id: doc.id, data: status})
    })
    return statuses;
  }

  getUserByDocumentId(id: string): Observable<User> {
    const userRef = doc(this.firestore, `users/${id}`);
    return docData(userRef, {idField: 'id'}) as Observable<User>;
  }

  async getAllUsers(): Promise<{ id: string, data: User }[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef);
    const usersSnapshot = await getDocs(q);
    const users: { id: string, data: User }[] = [];
    usersSnapshot.forEach(doc => {
      const user = doc.data() as User;
      users.push({id: doc.id, data: user})
    })
    return users;
  }

  async getUser(email: string): Promise<{ id: string, data: User } | undefined> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const usersSnapshot = await getDocs(q);

    if (usersSnapshot.empty) {
      return undefined;
    } else {
      const doc = usersSnapshot.docs[0];
      const user = doc.data() as User;
      return {id: doc.id, data: user};
    }
  }

  async updateUserRoleAndStatusAndLastModifiedBy(user: User) {
    const userRef = doc(this.firestore, `users/${user.id}`);
    await updateDoc(userRef, {role: user.role, status: user.status, lastModifiedBy: user.lastModifiedBy});
  }

  async updateUserLoggedInAs(user: User) {
    const userRef = doc(this.firestore, `users/${user.id}`);
    await updateDoc(userRef, {loggedInAs: user.loggedInAs});
  }

}
