import {Injectable} from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  limit,
  query,
  where
} from "@angular/fire/firestore";

export interface Category {
  id?: string | undefined;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private firestore: Firestore) {
  }

  async getAllCategories(): Promise<{ id: string, data: Category }[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    const q = query(categoriesRef);
    const categoriesSnapshot = await getDocs(q);
    const categories: { id: string, data: Category }[] = [];
    categoriesSnapshot.forEach(doc => {
      const category = doc.data() as Category;
      categories.push({id: doc.id, data: category})
    })
    return categories;
  }

  async deleteCategory(id: string | undefined) {
    if (await this.isCategoryInUse(id)) {
      throw new Error("Category is used by post(s).");
    }
    const categoriesRef = doc(this.firestore, `categories/${id}`);
    await deleteDoc(categoriesRef);
  }

  async createCategory(name: string) {
    const categoriesRef = collection(this.firestore, 'categories');
    await addDoc(categoriesRef, {name: name})
  }

  async isCategoryExisting(name: string): Promise<boolean> {
    const categoriesRef = collection(this.firestore, 'categories');
    const q = query(categoriesRef, where('name', '==', name), limit(1));
    const categoriesSnapshot = await getDocs(q);
    return categoriesSnapshot.size === 0 ? false : true;
  }

  async getCategoryNameById(id: string) {
    const categoryRef = doc(this.firestore, "categories", id);
    const docSnap = await getDoc(categoryRef);
    const data = docSnap.data()
    let name = '';
    if (data) {
      name = data['name'];
    }
    return name
  }

  async isCategoryInUse(categoryId: string | undefined): Promise<boolean> {
    const postsRef = collection(this.firestore, 'posts');
    const q = query(postsRef, where('category', '==', categoryId), where('deleted', '==', false));
    const postsSnapshot = await getDocs(q);
    return postsSnapshot.size === 0 ? false : true;
  }
}
