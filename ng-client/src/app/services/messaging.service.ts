import {EventEmitter, Injectable, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';

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
  private receivedDestinations: ReceivedDestinations = new ReceivedDestinations();

  constructor() {
    this.openWebSocket();
    const destinations = this.sentDestinations.destinations;
    const retrySendFunction = function () {
      destinations.forEach(sentDestination => {
        sentDestination.firstChannel.waitingList.forEach(sentMessage => sentMessage.send());
        sentDestination.secondChannel.waitingList.forEach(sentMessage => sentMessage.send());
      });
      setTimeout(retrySendFunction, 50000);
    };
    setTimeout(retrySendFunction, 10000);
  }

  private openWebSocket() {
    const wsPath = 'ws://' + location.host + '/hello/';
    console.log(`connecting to ${wsPath}`);
    const ws = new WebSocket(wsPath);
    ws.onerror = () => ws.close();
    ws.onclose = () => {
      setTimeout(this.openWebSocket, 20000);
    }; // every 20 seconds
    this.ws = ws;
    ws.onmessage = msg => {
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
      delete messageMap[MessagingService.FRAME_PARAM_NAME];
      delete messageMap[MessagingService.MESSAGEID_PARAM_NAME];
      delete messageMap[MessagingService.CHANNEL_PARAM_NAME];
      delete messageMap[MessagingService.DESTINATION_PARAM_NAME];
      // cleansing end.
      this.processFrame(frameType, destination, channelIndex, messageID, messageMap);
    };
    return ws;
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
      if (channelObj.cleanChannelMessage !== null) {
        channelObj.cleanChannelMessage.markAsAcknowledged({});
      }
    } else if (frameType === MessagingService.NACK_FRAME_NAME) {// does nothing at the moment
    } else if (frameType === MessagingService.ACK_FRAME_NAME) {// message that is a response to a client's message.
      const destinationObj: SentDestination = this.sentDestinations.getDestination(destination);
      const channelObj: SentChannel = destinationObj.getChannelByIndex(channelIndex);
      const messageObj: SentMessage = channelObj.waitingList.get(messageID);
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
    } else if (frameType === MessagingService.SEND_FRAME_NAME || frameType === MessagingService.CLEAN_FRAME_NAME) {// server messages
      const receivedDestination: ReceivedDestination = this.receivedDestinations.getDestination(destination);
      const answerFrameMap = {};
      answerFrameMap[MessagingService.DESTINATION_PARAM_NAME] = destination;
      answerFrameMap[MessagingService.CHANNEL_PARAM_NAME] = channelIndex;
      if (frameType === MessagingService.SEND_FRAME_NAME) {
        const updateLastMessageResult: boolean = receivedDestination.registerFrame(channelIndex, messageID);
        if (updateLastMessageResult) {
          answerFrameMap[MessagingService.FRAME_PARAM_NAME] = MessagingService.ACK_FRAME_NAME;
          receivedDestination.incomingMessageEventEmitter.emit(messageMap);
        } else {
          answerFrameMap[MessagingService.FRAME_PARAM_NAME] = MessagingService.NACK_FRAME_NAME;
        }
        answerFrameMap[MessagingService.MESSAGEID_PARAM_NAME] = messageID;
      } else if (frameType === MessagingService.CLEAN_FRAME_NAME) {
        answerFrameMap[MessagingService.FRAME_PARAM_NAME] = MessagingService.CLEANED_FRAME_NAME;
        receivedDestination.cleanChannel(channelIndex);
      }
      this.sendFrame(answerFrameMap);
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
    const messageObj: SentMessage = new SentMessage(() => {
      this.sendFrame(cleanFrameMap);
    }, () => {
      channelObj.slowpokePackages.fill(cleanFrameMap);
    }, () => {
      const index: number = channelObj.slowpokePackages.indexOf(cleanFrameMap);
      if (index !== -1) {
        channelObj.slowpokePackages.splice(index, 1);
      }
    });
    channelObj.cleanChannelMessage = messageObj;
    messageObj.subscribeOnAcknowledge(() => {
      channelObj.waitingList = new Map();
      channelObj.slowpokePackages = [];
      channelObj.lastMessageID = -1;
    });
    messageObj.send();
  }

  sendMessage(destination: string, data): SentMessage {
    const destinationObj: SentDestination = this.sentDestinations.getDestination(destination);
    const channelObj = destinationObj.getCurrentChannel();
    channelObj.lastMessageID++;
    const messageID: number = channelObj.lastMessageID;
    data[MessagingService.FRAME_PARAM_NAME] = MessagingService.SEND_FRAME_NAME;
    data[MessagingService.CHANNEL_PARAM_NAME] = destinationObj.currentChannel;
    data[MessagingService.DESTINATION_PARAM_NAME] = destination;
    data[MessagingService.MESSAGEID_PARAM_NAME] = messageID;
    const sentMessage: SentMessage = new SentMessage(() => {
      this.sendFrame(data);
    }, () => {
      channelObj.slowpokePackages.fill(data);
    }, () => {
      const index: number = channelObj.slowpokePackages.indexOf(data);
      if (index !== -1) {
        channelObj.slowpokePackages.splice(index, 1);
      }
    });
    channelObj.waitingList.set(messageID, sentMessage);
    sentMessage.send();
    return sentMessage;
  }

  /**
   * Returns a subscription to received messages to a destination.
   * @param destination
   */
  subscribeToDestination(destination: string): Observable<any> {
    return this.receivedDestinations.getDestination(destination).incomingMessageEventEmitter;
  }
}

export class SentMessage {
  /** Indicates whether the message has been added to the slow messages list. */
  private wasAddedToSlowList = false;
  private acknowledgeEventEmitter: EventEmitter<any> = new EventEmitter();

  /**
   *
   * @param sendCommand sends the message to the server
   * @param addToSlowListCommand adds the message to the slow messages list, which is a list of the messages that have been sent a long ago
   * and haven't been acknowledged by the server
   * @param removeFromSlowListCommand removes the message from the slow messages list messages
   */
  constructor(private sendCommand: () => void,
              private addToSlowListCommand: () => void,
              private removeFromSlowListCommand: () => void) {
  }

  subscribeOnAcknowledge(subscriber: (responseB) => void) {
    this.acknowledgeEventEmitter.subscribe(subscriber);
  }

  markAsAcknowledged(response) {
    if (this.wasAddedToSlowList) {
      this.removeFromSlowListCommand();
    }
    this.addToSlowListCommand = null;
    this.acknowledgeEventEmitter.next(response);
    this.acknowledgeEventEmitter.complete();
  }

  send(): void {
    const addToSlowListCommand = this.addToSlowListCommand;
    setTimeout(function () { // if the map still contains the message for too long, then add it to the special list
      if (addToSlowListCommand != null) {
        addToSlowListCommand();
        this.wasAddedToSlowList = true;
      }
    }, 5000);
    this.sendCommand();
  }
}

/**
 * Contains data about frames sent to a channel.
 */
class SentChannel {
  waitingList: Map<number, SentMessage> = new Map();
  /**
   * If a request to clean the channel has been sent, this object must be not null.
   * @type {any}
   */
  cleanChannelMessage: SentMessage = null;
  /**
   * List of packages that we are supposed to have already received acknowledgement about.
   * @type {Array}
   */
  slowpokePackages: any[] = [];
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

  getChannelByIndex(index: number): SentChannel {
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

/**
 * Contains data about received frames to a destination.
 */
class ReceivedDestination {
  private firstChannelLastMessageID: number = -1;
  private secondChannelLastMessageID: number = -1;
  /** Gives a sign about an incoming message. */
  @Output()
  incomingMessageEventEmitter: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Registers a new incoming frame.
   * @param destination
   * @param channelIndex
   * @param messageID
   * @return {boolean} true - registration was successful
   */
  registerFrame(channelIndex: number, messageID: number): boolean {
    if (messageID < 0) {
      return false;
    }
    if (channelIndex === 0) {
      if (this.firstChannelLastMessageID + 1 === messageID) {
        this.firstChannelLastMessageID++;
        return true;
      }
    } else if (channelIndex === 1) {
      if (this.secondChannelLastMessageID + 1 === messageID) {
        this.secondChannelLastMessageID++;
        return true;
      }
    }
    return false;
  }

  cleanChannel(channelIndex: number) {
    if (channelIndex === 0) {
      this.firstChannelLastMessageID = -1;
    } else if (channelIndex === 1) {
      this.secondChannelLastMessageID = -1;
    }
  }
}

/**
 * Contains data about received frames to a destinations.
 */
class ReceivedDestinations {
  /**
   * Map, where the key is a destination and value is data of the destination.
   */
  private destinations: Map<string, ReceivedDestination> = new Map();

  getDestination(destination: string): ReceivedDestination {
    if (this.destinations.has(destination)) {
      return this.destinations.get(destination);
    } else {
      const destinationObj = new ReceivedDestination();
      this.destinations.set(destination, destinationObj);
      return destinationObj;
    }
  }
}
