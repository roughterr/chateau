import { Component } from '@angular/core';
import { MaterialModule } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  typenewmessagefunction: (string) => void = (str: string) => {
    console.log(`The user has typed: ${str}`);
  };
}
