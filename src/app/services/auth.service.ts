import {Injectable} from '@angular/core';
import {Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "@angular/fire/auth";
import {FirebaseError} from 'firebase/app';
import {User, UserRoleEnum, UsersService, UserStatusEnum} from "./users.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  get currentUserStatus(): string {
    return this._currentUserStatus;
  }

  set currentUserStatus(value: string) {
    this._currentUserStatus = value;
  }

  private _currentUser: { id: string, data: User } | undefined;
  private _currentUserRole: string;
  private _currentUserStatus: string;
  private _currentUserAuthId: string;
  private _currentUserLoggedInAs: string;
  private _currentUserEmail: string;
  private _currentUserId: string;

  get lastModifiedBy(): string {
    return this._lastModifiedBy;
  }

  set lastModifiedBy(value: string) {
    this._lastModifiedBy = value;
  }

  private _lastModifiedBy: string;

  get currentUserId(): string {
    return this._currentUserId;
  }

  set currentUserId(value: string) {
    this._currentUserId = value;
  }

  get currentUserLoggedInAs(): string {
    return this._currentUserLoggedInAs;
  }

  set currentUserLoggedInAs(value: string) {
    this._currentUserLoggedInAs = value;
  }

  get currentUserEmail(): string {
    return this._currentUserEmail;
  }

  set currentUserEmail(value: string) {
    this._currentUserEmail = value;
  }

  get currentUserAuthId(): string {
    return this._currentUserAuthId;
  }

  set currentUserAuthId(value: string) {
    this._currentUserAuthId = value;
  }

  // public currentUserAuthId = '';

  constructor(private auth: Auth, private usersService: UsersService) {
  }


  get currentUser(): { id: string; data: User } | undefined {
    return this._currentUser;
  }

  set currentUser(value: { id: string; data: User } | undefined) {
    this._currentUser = value;
  }

  get currentUserRole(): string {
    return this._currentUserRole;
  }

  set currentUserRole(value: string) {
    this._currentUserRole = value;
  }

  async register({email, password}: { email: string, password: string }) {
    try {
      const userCredentials = await createUserWithEmailAndPassword(this.auth, email, password);
      if (userCredentials.user.email) {
        await this.usersService.addUser({
          authId: userCredentials?.user.uid,
          status: UserStatusEnum[UserStatusEnum.Full],
          role: UserRoleEnum[UserRoleEnum.Regular],
          email: userCredentials.user.email,
          loggedInAs: UserRoleEnum.Regular,
          lastModifiedBy: ""
        })
      }

      this.currentUser = await this.usersService.getUser(email);
      if (this.currentUser?.id) {
        this.currentUserId = this.currentUser?.id;
      }
      if (this.currentUser?.data) {
        const currentUserData = this.currentUser.data;
        this.currentUserLoggedInAs = currentUserData.loggedInAs;
        this.currentUserEmail = currentUserData.email;
        this.currentUserRole = currentUserData.role;
        this.currentUserStatus = currentUserData.status;
        this.currentUserAuthId = currentUserData.authId;
        this.lastModifiedBy = currentUserData.lastModifiedBy;
      }
      return userCredentials;
    } catch (e) {
      if (e instanceof FirebaseError) {
        return e;
      }
      return null;
    }
  }

  async login({email, password}: { email: string, password: string }) {
    try {
      const userCredentials = await signInWithEmailAndPassword(this.auth, email, password);

      this.currentUser = await this.usersService.getUser(email);
      if (this.currentUser?.id) {
        this.currentUserId = this.currentUser?.id;
      }
      if (this.currentUser?.data) {
        const currentUserData = this.currentUser.data;
        this.currentUserLoggedInAs = currentUserData.loggedInAs;
        this.currentUserEmail = currentUserData.email;
        this.currentUserRole = currentUserData.role;
        this.currentUserStatus = currentUserData.status;
        this.currentUserAuthId = currentUserData.authId;
        this.lastModifiedBy = currentUserData.lastModifiedBy;
      }
      return userCredentials;
    } catch (e) {
      if (e instanceof FirebaseError) {
        return e;
      }
      return null;
    }
  }

  async logout() {
    await this.usersService.updateUserLoggedInAs(
      {
        id: this.currentUserId,
        loggedInAs: "",
        status: this.currentUserStatus,
        authId: this.currentUserAuthId,
        role: this.currentUserRole,
        email: this.currentUserEmail,
        lastModifiedBy: this.lastModifiedBy
      }
    );
    return signOut(this.auth);
  }
}
