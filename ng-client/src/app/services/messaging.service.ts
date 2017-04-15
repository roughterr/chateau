import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class MessagingService {
  /** Name of JSON parameter that is a destination. */
  static readonly DESTINATION_PARAM_NAME = 'destination';
  /** Name of JSON parameter that is a channel index. */
  static readonly CHANNEL_PARAM_NAME = 'channel';
  /** Name of JSON parameter that is a message ID. */
  static readonly MESSAGEID_PARAM_NAME = 'id';
  /** Name of JSON parameter that is a frame name. */
  static readonly FRAME_PARAM_NAME = 'frame';
  /** Name of a frame that is to confirm a message has been consumed. */
  static readonly ACK_FRAME_NAME = 'ACK';
  /** Name of a frame that is to confirm a message has not been consumed. */
  static readonly NACK_FRAME_NAME = 'NACK';
  /** Name of a frame that commands to clean a channel. */
  static readonly CLEAN_FRAME_NAME = 'CLEAN';
  /** Name of a frame that tells that the cleaning operation has completed successfully. */
  static readonly CLEANED_FRAME_NAME = 'CLEANED';
  /** Name of a frame that contains a message to send. */
  static readonly SEND_FRAME_NAME = 'SEND';
  /**
   * WebSocket connection to the server.
   * @type {WebSocket}
   */
  private ws: WebSocket = new WebSocket('ws://localhost:8080/hello/');
  private sentDestinations: SentDestinations = new SentDestinations();

  constructor() {
    this.ws.onmessage = msg => {
      console.log(`message received msg.data=${msg.data}`);
    };
  }

  sendMessage(destination: string, data): SentMessage {
    const destinationObj: Destination = this.sentDestinations.getDestination('');
    const channelObj = destinationObj.getCurrentChannel();
    channelObj.lastMessageID++;
    data[MessagingService.FRAME_PARAM_NAME] = MessagingService.SEND_FRAME_NAME;
    data[MessagingService.CHANNEL_PARAM_NAME] = destinationObj.currentChannel;
    data[MessagingService.DESTINATION_PARAM_NAME] = destination;
    data[MessagingService.MESSAGEID_PARAM_NAME] = channelObj.lastMessageID;
    const sentMessage: SentMessage = new SentMessage(data);
    const json: string = JSON.stringify(data);
    console.log(`JSON that is going to be sent to the server: ${json}`);
    channelObj.waitingList.set(channelObj.lastMessageID, sentMessage);
    this.ws.send(json);
    return sentMessage;
    // TODO timeout and add an item slowpokePackages
  }
}

class SentMessage {
  data;
  private acknowledgeEventEmitter: EventEmitter<Map<any, any>> = new EventEmitter();

  constructor(data) {
    this.data = data;
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
  waitingList: Map<number, SentMessage> = new Map();
  /**
   * List of packages that we are supposed to have already received acknowledgement about.
   * @type {Array}
   */
  slowpokePackages: SentMessage[] = [];
  /**
   * ID of the last message in the channel.
   * @type {number}
   */
  lastMessageID = -1;
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

  getDestination(destination: string): Destination {
    if (this.destinations.has(destination)) {
      return this.destinations.get(destination);
    } else {
      const destinationObj = new Destination();
      this.destinations.set(destination, destinationObj);
      return destinationObj;
    }
  }
}


