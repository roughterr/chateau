import {EventEmitter, Injectable} from '@angular/core';

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
  private sentDestinations: SentDestinations = new SentDestinations();

  sendMessageToDestination(destination, payloadMap) {
    console.log(`sendMessageToDestination called with the parameters: destination=${destination}, payloadMap=${payloadMap}`);
    // const someObj = new Map();
    // if (this.ws.readyState === 1) {
    const channel: Channel = this.sentDestinations.getDestination(destination).getCurrentChannel();
    const sentMessage: SentMessage = channel.sendMessage(payloadMap, this.ws);
    sentMessage.subscribeOnAcknowledge(() => {
      console.log('sendMessageToDestination. subscribeOnAcknowledge');
    });
    sentMessage.markAsAcknowledged(new Map());
  }

  sendMessageFunction = function (messagemap) {
    return this.sendMessageToDestination('group-chat', messagemap);
  };
}

class SentMessage {
  payloadMap: Map<string, string>;
  private acknowledgeEventEmitter: EventEmitter<Map<any, any>> = new EventEmitter();

  constructor(payloadMap: Map<string, string>) {
    this.payloadMap = payloadMap;
  }

  subscribeOnAcknowledge(subscriber: (responseBodyMap: Map<any, any>) => void) {
    this.acknowledgeEventEmitter.subscribe(subscriber);
  }

  markAsAcknowledged(responseBodyMap: Map<any, any>) {
    this.acknowledgeEventEmitter.next(responseBodyMap);
    this.acknowledgeEventEmitter.complete();
  }
}

class Channel {
  private waitingList: Map<number, SentMessage> = new Map();
  /**
   * List of packages that we are supposed to have already received acknowledgement about.
   * @type {Array}
   */
  private slowpokePackages: SentMessage[] = [];
  /**
   * ID of the last message in the channel.
   * @type {number}
   */
  private lastMessageID = -1;

  sendMessage(payloadMap: Map<string, string>, ws: WebSocket): SentMessage {
    this.lastMessageID++;
    payloadMap['messageID'] = this.lastMessageID;
    const sentMessage: SentMessage = new SentMessage(payloadMap);
    const json: string = JSON.stringify(payloadMap);
    console.log(`JSON that is going to be sent to the server: ${json}`);
    this.waitingList.set(this.lastMessageID, sentMessage);
    ws.send(json);
    return sentMessage;
    // TODO timeout and add an item slowpokePackages
  }
}

class Destination {
  /** An object with data of the first channel. */
  firstChannel: Channel = new Channel();
  /** An object with data of the second channel. */
  secondChannel: Channel = new Channel();
  /** ID of the current channel. Possible values are: 0, 1. */
  currentChannel = 0;

  getCurrentChannel(): Channel {
    return this.currentChannel === 0 ? this.firstChannel : this.secondChannel;
  }
}

/**
 * Contains data about packages sent to destinations.
 */
class SentDestinations {
  /**
   * Map, where the key is a destination and value is data of the destination.
   */
  destinations: Map<string, Destination> = new Map();

  getDestination(destination: string) {
    if (this.destinations.has(destination)) {
      return this.destinations.get(destination);
    } else {
      const destinationObj = new Destination();
      this.destinations.set(destination, destinationObj);
      return destinationObj;
    }
  }
}


