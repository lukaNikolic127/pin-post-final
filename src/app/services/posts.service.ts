import {Injectable} from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  docData,
  Firestore, getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {Observable, take} from "rxjs";
import {AuthService} from "./auth.service";
import {SubscriptionsService} from "./subscriptions.service";
import {save} from "ionicons/icons";

export interface Post {
  id?: string,
  title: string,
  description: string,
  deleted: boolean,
  url: string,
  author: string,
  category: string,
  likedBy: string[],
  savedBy: string[],
  creationTime: Date,
  likes: number
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private firestore: Firestore, private storage: AngularFireStorage, private authService: AuthService, private subscriptionsService: SubscriptionsService) {
  }

  async getAllPosts(): Promise<{ id: string, data: Post }[]> {
    const postsRef = collection(this.firestore, 'posts');
    const q = query(postsRef, orderBy("creationTime", "desc"), where("deleted", "==", false));
    const postsSnapshot = await getDocs(q);
    const posts: { id: string, data: Post }[] = [];
    postsSnapshot.forEach(doc => {
      const post = doc.data() as Post;
      posts.push({id: doc.id, data: post})
    })
    return posts;
  }

  async getPostsWithFilters(category: string, user: string, sorting: string): Promise<{ id: string, data: Post }[]> {
    const postsRef = collection(this.firestore, 'posts');
    let q = query(postsRef);
    switch (sorting) {
      case "creationTimeDesc": {
        q = query(q, orderBy("creationTime", "desc"));
        break;
      }
      case "creationTimeAsc": {
        q = query(q, orderBy("creationTime", "asc"));
        break;
      }
      case "likesDesc": {
        q = query(q, orderBy("likes", "desc"));
        break;
      }
      case "likesAsc": {
        q = query(q, orderBy("likes", "asc"));
        break;
      }
      default: {
        q = query(q, orderBy("creationTime", "desc"))
        break;
      }
    }
    if (category !== undefined) {
      q = query(q, where("category", "==", category))
    }
    if (user !== undefined) {
      q = query(q, where("author", "==", user))
    }

    q = query(q, where("deleted", "==", false));

    const postsSnapshot = await getDocs(q);
    const posts: { id: string, data: Post }[] = [];
    postsSnapshot.forEach(doc => {
      const post = doc.data() as Post;
      posts.push({id: doc.id, data: post})
    })
    return posts;
  }

  async getFavoritesPosts(userAuthId: string): Promise<{ id: string, data: Post }[]> {
    const postsRef = collection(this.firestore, 'posts');
    const q = query(postsRef, where("deleted", "==", false), where("savedBy", "array-contains", userAuthId));
    const postsSnapshot = await getDocs(q);
    const posts: { id: string, data: Post }[] = [];
    postsSnapshot.forEach(doc => {
      const post = doc.data() as Post;
      posts.push({id: doc.id, data: post})
    })
    return posts;
  }

  async createPost(title: string, description: string, category: string, file: File) {
    const imagePath = `images/${file.name}`;
    const imageRef = this.storage.ref(imagePath);
    const uploadTask = imageRef.put(file);

    await uploadTask;

    const downloadURL = await imageRef.getDownloadURL().toPromise();
    const currentUserAuthId = this.authService.currentUserAuthId;

    const postsRef = collection(this.firestore, 'posts');
    await addDoc(postsRef, {
      title: title,
      description: description,
      url: downloadURL,
      deleted: false,
      author: currentUserAuthId,
      category: category,
      likedBy: [],
      savedBy: [],
      creationTime: new Date,
      likes: 0
    })
    await this.subscriptionsService.notifySubscribers(currentUserAuthId);
  }

  async getMyPosts() {
    const currentUserAuthId = this.authService.currentUserAuthId;
    const postsRef = collection(this.firestore, 'posts');
    const q = query(postsRef, where("author", "==", currentUserAuthId), where("deleted", "==", false));
    const postsSnapshot = await getDocs(q);
    const posts: { id: string, data: Post }[] = [];
    postsSnapshot.forEach(doc => {
      const post = doc.data() as Post;
      posts.push({id: doc.id, data: post})
    })
    return posts;
  }

  getPostById(id: string): Observable<Post> {
    const postRef = doc(this.firestore, `posts/${id}`);
    return docData(postRef, {idField: 'id'}) as Observable<Post>;
  }

  async deletePost(post: Post) {
    const postRef = doc(this.firestore, `posts/${post.id}`);
    await updateDoc(postRef, {deleted: true});
  }

  async updatePost(post: Post) {
    const postRef = doc(this.firestore, `posts/${post.id}`);
    await updateDoc(postRef, {title: post.title, description: post.description, category: post.category});
  }

  likeOrUnlikePost(post: Post) {
    const userAuthId = this.authService.currentUserAuthId;
    const postRef = doc(this.firestore, `posts/${post.id}`);
    if (post.id && userAuthId) {
      this.getPostById(post.id).pipe(take(1)).subscribe(res => {
        let likedBy = res.likedBy;
        let likes = res.likes;
        if (!likedBy.includes(userAuthId)) {
          likedBy.push(userAuthId);
          likes++;
        } else {
          likedBy = likedBy.filter(authId => authId !== userAuthId)
          likes--;
        }
        return updateDoc(postRef, {likedBy: likedBy, likes: likes});
      })
    }
  }

  favorOrUnfavorPost(post: Post) {
    const userAuthId = this.authService.currentUserAuthId;
    const postRef = doc(this.firestore, `posts/${post.id}`);

    if (post.id && userAuthId) {
      this.getPostById(post.id).pipe(take(1)).subscribe(res => {
        let savedBy = res.savedBy;
        if (!savedBy.includes(userAuthId)) {
          savedBy.push(userAuthId);
        } else {
          savedBy = savedBy.filter((authId) => {
            authId !== userAuthId;
          })
        }
        return updateDoc(postRef, {savedBy: savedBy});
      })
    }
  }

  async toggleFavorite(postId: string) {
    const userAuthId = this.authService.currentUserAuthId;
    const postRef = doc(this.firestore, `posts/${postId}`);
    try{
      const postSnap = await getDoc(postRef);
      if(postSnap.exists()){
        const postData = postSnap.data();
        let savedBy: string[] = postData['savedBy'];
        console.log('SAVED BY')
        console.log(savedBy)
        savedBy = savedBy.filter((authId) => {
          authId !== userAuthId;
        })
        await updateDoc(postRef, {savedBy: savedBy});
      }
    }catch (error){
      console.log("Unable to update post's title", error)
    }
  }
}
