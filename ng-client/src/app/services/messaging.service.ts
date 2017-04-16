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
      console.log(`message received. msg.data=${msg.data}`);
      const messageMap = JSON.parse(msg.data);
      const destination: string = messageMap[MessagingService.DESTINATION_PARAM_NAME];
      if (destination == null || destination === '') {
        console.log('Server sent a message without a destination.');
        return;
      }
      // get a channel from the message
      let channel = messageMap[MessagingService.CHANNEL_PARAM_NAME];
      if (channel == null || channel === '') {
        channel = 0;
      }
      let messageID = messageMap[MessagingService.MESSAGEID_PARAM_NAME];
      if (messageID == null || messageID === '') {
        messageID = 0;
      }
      // get a frame name
      const frame = messageMap[MessagingService.FRAME_PARAM_NAME];
      if (frame == null || frame === '') {
        console.log('Server sent a message without a frame name.');
        return;
      }
      if (frame === MessagingService.CLEANED_FRAME_NAME) {
        const channelObj: Channel = this.sentDestinations.getDestination(destination).getChannelByIndex(channel);
        channelObj.waitingList = new Map();
        channelObj.slowpokePackages = [];
        channelObj.lastMessageID = -1;
      } else if (frame === MessagingService.NACK_FRAME_NAME) {// does nothing at the moment
      } else if (frame === MessagingService.ACK_FRAME_NAME) {// message that is a response to a client's message.
        const destinationObj: Destination = this.sentDestinations.getDestination(destination);
        const channelObj = destinationObj.getChannelByIndex(channel);
        const currentChannelObj = destinationObj.getCurrentChannel();
        const messageObj = channelObj.waitingList.get(messageID);
        // cleansing start.
        messageMap[MessagingService.FRAME_PARAM_NAME] = null;
        messageMap[MessagingService.MESSAGEID_PARAM_NAME] = null;
        messageMap[MessagingService.CHANNEL_PARAM_NAME] = null;
        messageMap[MessagingService.DESTINATION_PARAM_NAME] = null;
        // cleansing end.
        messageObj.markAsAcknowledged(messageMap);
        channelObj.waitingList.delete(messageID);
        const notCurrentChannel: Channel = destinationObj.getNotCurrentChannel();
        const theOtherChannelIndex: number = Destination.getTheOtherChannelIndex(channel);
        const theOtherChannelObj = destinationObj.getChannelByIndex(theOtherChannelIndex);
        if (theOtherChannelObj.lastMessageID === -1) {
          destinationObj.switchCurrentChannel();
        }
        // if the other channel already active and the current channel's waiting list is empty.
        if (channel !== destinationObj.currentChannel && channelObj.waitingList.size === 0) {
          this.requestChannelClean(destination, channel);
        }
        // clean the other channel if necessary
        if (theOtherChannelObj.waitingList.size === 0 && theOtherChannelObj.lastMessageID > -1) {
          this.requestChannelClean(destination, theOtherChannelIndex);
        }
      }
    };
  }

  private requestChannelClean(destination: string, channelIndex: number) {
    // get the channel object
    const destinationObj: Destination = this.sentDestinations.getDestination(destination);
    const channelObj = destinationObj.getCurrentChannel();
    const cleanFrameMap = {};
    cleanFrameMap[MessagingService.FRAME_PARAM_NAME] = MessagingService.CLEAN_FRAME_NAME;
    cleanFrameMap[MessagingService.DESTINATION_PARAM_NAME] = destination;
    cleanFrameMap[MessagingService.CHANNEL_PARAM_NAME] = channelIndex;
    const messageObj: SentMessage = new SentMessage(cleanFrameMap);
    setTimeout(function () {
      // if some times passed and the map stills exists, then setting a flag that means that the client
      // has been waiting an acknowledgment for a long time.
      if (messageObj != null) {
        channelObj.slowpokePackages.fill(messageObj);
      }
    }, 5000);
    this.ws.send(JSON.stringify(cleanFrameMap));
  }

  sendMessage(destination: string, data): SentMessage {
    const destinationObj: Destination = this.sentDestinations.getDestination(destination);
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
  private acknowledgeEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(data) {
    this.data = data;
  }

  subscribeOnAcknowledge(subscriber: (responseB) => void) {
    this.acknowledgeEventEmitter.subscribe(subscriber);
  }

  markAsAcknowledged(response) {
    this.acknowledgeEventEmitter.next(response);
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

  static getTheOtherChannelIndex(index: number): number {
    return index === 0 ? 1 : 0;
  }

  getCurrentChannel(): Channel {
    return this.currentChannel === 0 ? this.firstChannel : this.secondChannel;
  }

  setCurrentChannel(channel: Channel) {
    if (this.currentChannel === 0) {
      this.firstChannel = channel;
    } else {
      this.secondChannel = channel;
    }
  }

  getNotCurrentChannelIndex() {
    return this.currentChannel === 0 ? 1 : 0;
  }

  getNotCurrentChannel() {
    return this.currentChannel === 0 ? this.secondChannel : this.firstChannel;
  }

  /**
   * Switches the current channel to the other channel.
   */
  switchCurrentChannel() {
    this.currentChannel = this.currentChannel === 0 ? 1 : 0;
  }

  getChannelByIndex(index: number) {
    return index === 0 ? this.firstChannel : this.secondChannel;
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


