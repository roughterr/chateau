import {Injectable} from '@angular/core';

@Injectable()
export class MessagingService {
  private ws: WebSocket = new WebSocket('ws://localhost:8080/hello/');

  sendMessageToDestination(destination, message) {
    console.log(`sendMessageToDestination called with the parameters: destination=${destination}, message=${message}`);
    console.log(`readyState=${this.ws.readyState}`);
    this.ws.onopen = function () {
      console.log('Opened a WebSocket connection.');
      // that.ws.send(JSON.stringify(message));
    };
  }

  sendMessageFunction = function (messagemap) {
    return this.sendMessageToDestination('group-chat', messagemap);
  };
}
