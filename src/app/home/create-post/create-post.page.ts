import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PostsService} from "../../services/posts.service";
import {LoadingController, ToastController} from "@ionic/angular";
import {CategoriesService, Category} from "../../services/categories.service";

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.page.html',
  styleUrls: ['./create-post.page.scss'],
})
export class CreatePostPage implements OnInit {


  createPostForm: FormGroup;
  file: File;
  categories: Category[] = [];

  constructor(private router: Router, private formBuilder: FormBuilder, private postsService: PostsService,
              private loadingCtrl: LoadingController, private toastCtrl: ToastController, private categoriesService: CategoriesService) {
  }

  ngOnInit() {
    this.createPostForm = this.formBuilder.group({
      postTitle: ['', Validators.required],
      postDescription: ['', Validators.required],
      postImage: ['', Validators.required],
      postCategory: ['', Validators.required]
    })
  }

  ionViewWillEnter() {
    this.loadAllCategories();
  }

  ionViewWillLeave() {
    this.createPostForm.reset();
  }

  loadAllCategories() {
    this.categoriesService.getAllCategories().then(res => {
      this.categories = [];
      res.forEach(({id, data}) => {
        const category: Category = {...data, id}
        this.categories.push(category)
      })
    });
  }

  async createPost() {
    const value = this.createPostForm.value;
    const title = value.postTitle;
    const description = value.postDescription;
    const category = value.postCategory;

    const loading = await this.loadingCtrl.create({
      message: 'Uploading...'
    });
    await loading.present();

    try {
      await this.postsService.createPost(title, description, category, this.file);
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Done!',
        color: 'success',
        duration: 2000,
        position: 'bottom'
      })
      await toast.present();
    } catch (error) {
      await loading.dismiss();
    }
  }

  async onFileChange(event: any) {
    this.file = event.target.files[0];
  }
}
