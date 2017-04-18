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
      console.log(`message received. data=${msg.data}`);
      const messageMap = JSON.parse(msg.data);
      // get a frame type
      const frameType = messageMap[MessagingService.FRAME_PARAM_NAME];
      if (frameType == null || frameType === '') {
        console.log('Server sent a message without a frame name.');
        return;
      }
      const destination: string = messageMap[MessagingService.DESTINATION_PARAM_NAME];
      if (destination == null || destination === '') {
        console.log('Server sent a message without a destination.');
        return;
      }
      // get a channel index from the message
      let channelIndex: number = messageMap[MessagingService.CHANNEL_PARAM_NAME];
      if (channelIndex == null) {
        channelIndex = 0;
      }
      let messageID: number = messageMap[MessagingService.MESSAGEID_PARAM_NAME];
      if (messageID == null) {
        messageID = 0;
      }
      // cleansing start.
      messageMap[MessagingService.FRAME_PARAM_NAME] = null;
      messageMap[MessagingService.MESSAGEID_PARAM_NAME] = null;
      messageMap[MessagingService.CHANNEL_PARAM_NAME] = null;
      messageMap[MessagingService.DESTINATION_PARAM_NAME] = null;
      // cleansing end.
      this.processFrame(frameType, destination, channelIndex, messageID, messageMap);
    };
  }

  /**
   * Processes an incoming frame.
   * @param frameType frame type. For example, ACK which says that the frame is an acknowledge about a received message
   * @param destination destination
   * @param channelIndex channe index. Possible values are: 0, 1
   * @param messageID optional. message ID
   * @param messageMap message data in a form of map
   */
  private processFrame(frameType: string, destination: string, channelIndex: number, messageID: number, messageMap) {
    if (frameType === MessagingService.CLEANED_FRAME_NAME) {
      const channelObj: SentChannel = this.sentDestinations.getDestination(destination).getChannelByIndex(channelIndex);
      channelObj.waitingList = new Map();
      channelObj.slowpokePackages = [];
      channelObj.lastMessageID = -1;
    } else if (frameType === MessagingService.NACK_FRAME_NAME) {// does nothing at the moment
    } else if (frameType === MessagingService.ACK_FRAME_NAME) {// message that is a response to a client's message.
      const destinationObj: SentDestination = this.sentDestinations.getDestination(destination);
      const channelObj = destinationObj.getChannelByIndex(channelIndex);
      const messageObj = channelObj.waitingList.get(messageID);
      messageObj.markAsAcknowledged(messageMap);
      channelObj.waitingList.delete(messageID);
      const theOtherChannelIndex: number = SentDestination.getTheOtherChannelIndex(channelIndex);
      const theOtherChannelObj = destinationObj.getChannelByIndex(theOtherChannelIndex);
      if (theOtherChannelObj.lastMessageID === -1) {
        destinationObj.switchCurrentChannel();
      }
      // if the other channel already active and the current channel's waiting list is empty.
      if (channelIndex !== destinationObj.currentChannel && channelObj.waitingList.size === 0) {
        this.requestChannelClean(destination, channelIndex);
      }
      // clean the other channel if necessary
      if (theOtherChannelObj.waitingList.size === 0 && theOtherChannelObj.lastMessageID > -1) {
        this.requestChannelClean(destination, theOtherChannelIndex);
      }
    }
  }

  /**
   * Sends a frame to the server.
   * @param frameMap frame map
   */
  private sendFrame(frameMap) {
    const json: string = JSON.stringify(frameMap);
    console.log(`JSON that is going to be sent to the server: ${json}`);
    this.ws.send(json);
  }

  private requestChannelClean(destination: string, channelIndex: number) {
    // get the channel object
    const destinationObj: SentDestination = this.sentDestinations.getDestination(destination);
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
    this.sendFrame(cleanFrameMap);
  }

  sendMessage(destination: string, data): SentMessage {
    const destinationObj: SentDestination = this.sentDestinations.getDestination(destination);
    const channelObj = destinationObj.getCurrentChannel();
    channelObj.lastMessageID++;
    data[MessagingService.FRAME_PARAM_NAME] = MessagingService.SEND_FRAME_NAME;
    data[MessagingService.CHANNEL_PARAM_NAME] = destinationObj.currentChannel;
    data[MessagingService.DESTINATION_PARAM_NAME] = destination;
    data[MessagingService.MESSAGEID_PARAM_NAME] = channelObj.lastMessageID;
    const sentMessage: SentMessage = new SentMessage(data);
    channelObj.waitingList.set(channelObj.lastMessageID, sentMessage);
    this.sendFrame(data);
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

/**
 * Contains data about frames sent to a channel.
 */
class SentChannel {
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

/**
 * Contains data about frames sent to destinations.
 */
class SentDestination {
  /** An object with data of the first channel. */
  firstChannel: SentChannel = new SentChannel();
  /** An object with data of the second channel. */
  secondChannel: SentChannel = new SentChannel();
  /** ID of the current channel. Possible values are: 0, 1. */
  currentChannel = 0;

  static getTheOtherChannelIndex(index: number): number {
    return index === 0 ? 1 : 0;
  }

  getCurrentChannel(): SentChannel {
    return this.currentChannel === 0 ? this.firstChannel : this.secondChannel;
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
 * Contains data about frames sent to destinations.
 */
class SentDestinations {
  /**
   * Map, where the key is a destination and value is data of the destination.
   */
  destinations: Map<string, SentDestination> = new Map();

  getDestination(destination: string): SentDestination {
    if (this.destinations.has(destination)) {
      return this.destinations.get(destination);
    } else {
      const destinationObj = new SentDestination();
      this.destinations.set(destination, destinationObj);
      return destinationObj;
    }
  }
}


