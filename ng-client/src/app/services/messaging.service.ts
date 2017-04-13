import {Injectable} from '@angular/core';
import {Subscriber} from "rxjs/Subscriber";
import {Observable} from "rxjs/Observable";

@Injectable()
export class MessagingService {
  /** Name of JSON parameter that is a destination. */
  static readonly DESTINATION_PARAM_NAME: 'destination';
  /** Name of JSON parameter that is a channel index. */
  static readonly CHANNEL_PARAM_NAME: 'channel';
  /** Name of JSON parameter that is a message ID. */
  static readonly MESSAGEID_PARAM_NAME: 'id';
  /** Name of JSON parameter that is a frame name. */
  static readonly FRAME_PARAM_NAME: 'frame';
  /** Name of a frame that is to confirm a message has been consumed. */
  static readonly ACK_FRAME_NAME: 'ACK';
  /** Name of a frame that is to confirm a message has not been consumed. */
  static readonly NACK_FRAME_NAME: 'NACK';
  /** Name of a frame that commands to clean a channel. */
  static readonly CLEAN_FRAME_NAME: 'CLEAN';
  /** Name of a frame that tells that the cleaning operation has completed successfully. */
  static readonly CLEANED_FRAME_NAME: 'CLEANED';
  /** Name of a frame that contains a message to send. */
  static readonly SEND_FRAME_NAME: 'SEND';
  /**
   * WebSocket connection to the server.
   * @type {WebSocket}
   */
  private ws: WebSocket = new WebSocket('ws://localhost:8080/hello/');

  sentMessages: Map<string, Destination>;

  sendMessageToDestination(destination, message): Observable<any> {
    console.log(`sendMessageToDestination called with the parameters: destination=${destination}, message=${message}`);
    const someObj = new Map();
    // if (this.ws.readyState === 1) {

    if (!this.sentMessages.has(destination)) {
      this.sentMessages[destination] = new Destination();
    }

    return Observable.create(subscriber => {
        // TODO put subscriber somewhere
        someObj.set('1', subscriber);

        // subscriber.next('testTemplateID');
        // subscriber.complete();
      }
    );
  }

  sendMessageFunction = function (messagemap) {
    return this.sendMessageToDestination('group-chat', messagemap);
  };
}

class Destination {
  firstChannel: Channel = new Channel();
  secondChannel: Channel = new Channel();
  currentChannel = 0;
}

class Channel {
  waitingList;
  lastMessageID;
}
