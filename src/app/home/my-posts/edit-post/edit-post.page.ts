import {Component, Input, OnInit} from '@angular/core';
import {Post, PostsService} from "../../../services/posts.service";
import {ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CategoriesService, Category} from "../../../services/categories.service";
import {LoadingController, ToastController} from "@ionic/angular";

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.page.html',
  styleUrls: ['./edit-post.page.scss'],
})
export class EditPostPage implements OnInit {
  postTitle: any;
  postDescription: any;
  postCategory: any;
  categories: Category[] = [];
  postId: any;
  post: Post;
  @Input() title = '';
  @Input() description = '';
  @Input() category = '';
  @Input() imageUrl = '';
  @Input() selectedCategory: string | undefined = '';

  constructor(private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder, private categoriesService: CategoriesService,
              private postsService: PostsService, private loadingController: LoadingController, private toastController: ToastController) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.postCategory = params.get('postCategory');
      this.postId = params.get('postId');
      this.categoriesService.getAllCategories().then(res => {
        this.categories = [];
        res.forEach(({id, data}) => {
          const category: Category = {...data, id}
          this.categories.push(category)
        })
        this.selectedCategory = this.categories.find(cat => cat.name == this.postCategory)?.id;
      });
    })
  }

  ionViewWillEnter() {
    this.postsService.getPostById(this.postId).pipe().subscribe(res => {
      this.post = res;
      this.title = res.title;
      this.description = res.description;
      this.category = res.category;
      this.imageUrl = res.url;
    })
  }

  ngOnInit() {
  }

  async updatePost() {
    this.post.title = this.title;
    this.post.description = this.description;
    this.post.category = this.category;
    const loading = await this.loadingController.create({
      message: 'Uploading...',
    });

    await loading.present();
    await this.postsService.updatePost(this.post);
    await loading.dismiss();
    const toast = await this.toastController.create({message: 'Done!', duration: 2000, color: "success"});
    await toast.present();
  }
}
