import {Component} from '@angular/core';
import {ToastController} from "@ionic/angular";
import {alertCircleOutline} from "ionicons/icons";

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {

  constructor(private toastController: ToastController) {
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: "secondary",
      position: "top",
      animated: true,
      icon: alertCircleOutline
    });
    await toast.present();
  }

}
