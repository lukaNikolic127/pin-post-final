import {Injectable} from '@angular/core';
import {ToastComponent} from "../toast/toast.component";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastComponent: ToastComponent) {
  }

  presentToast(message: string) {
    this.toastComponent.presentToast(message);
  }
}
