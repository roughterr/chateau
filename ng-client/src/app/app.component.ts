import {Component, ViewChild} from '@angular/core';
import {
  ChateauMessageHistoryComponent,
  MyNewMessageModelDecorator
} from './components/chateau-message-history/chateau-message-history.component';
import {MessagingService, SentMessage} from './services/messaging.service';

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

  constructor(private messagingService: MessagingService) {
  }

  /**
   * This function should be called after the user has typed a new message.
   * @param message
   */
  onNewMessageTyped(message: string) {
    const sentMessage: SentMessage = this.messagingService.sendMessage('group-chat', {'content': message});
    const messsageDecorator: MyNewMessageModelDecorator = this.chateauMessageHistoryComponent.drawMyNewMessage(message);
    sentMessage.subscribeOnAcknowledge(() => {
      messsageDecorator.markAsDelivered('TO BE IMPLEMENTED.');
    });
  }
}
