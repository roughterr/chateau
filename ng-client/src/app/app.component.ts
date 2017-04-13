import {Component, ViewChild} from '@angular/core';
import {ChateauMessageHistoryComponent} from './components/chateau-message-history/chateau-message-history.component';
import {MessagingService} from './services/messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessagingService]
})
export class AppComponent {
  title = 'Chat';

  @ViewChild(ChateauMessageHistoryComponent)
  private chateauMessageHistoryComponent: ChateauMessageHistoryComponent;

  constructor(private messagingService: MessagingService) { }

  /**
   * This function should be called after the user has typed a new message.
   * @param message
   */
  onNewMessageTyped(message: string) {
    this.messagingService.sendMessageFunction({});
    this.chateauMessageHistoryComponent.drawNewMyMessageFunction({'content': message});
  }
}
