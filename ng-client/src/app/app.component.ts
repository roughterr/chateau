import {Component, Input, Output, ViewChild} from '@angular/core';
import {ChateauMessageHistoryComponent} from './chateau-message-history/chateau-message-history.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(ChateauMessageHistoryComponent)
  private chateauMessageHistoryComponent: ChateauMessageHistoryComponent;

  /**
   * This function should be called after the user has typed a new message.
   * @param message
   */
  onNewMessageTyped(message: string) {
    this.chateauMessageHistoryComponent.drawNewMyMessageFunction({'content': message});
  }
}
