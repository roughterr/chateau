import {
  Component, OnInit, ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentRef, ElementRef
} from '@angular/core';
import {IconMessageDeliveryStatusComponent} from '../icon-message-delivery-status/icon-message-delivery-status.component';

@Component({
  selector: 'app-chateau-message-history',
  templateUrl: './chateau-message-history.component.html',
  styleUrls: ['./chateau-message-history.component.css']
})
export class ChateauMessageHistoryComponent implements OnInit {
  private messages: MessageModel[] = [];

  constructor() {
  }

  drawMyNewMessage(content: string): MyNewMessageModelDecorator {
    const messageModel: MessageModel = new MessageModel();
    messageModel.content = content;
    messageModel.isMyMessage = true;
    const messageModelDecorator: MyNewMessageModelDecorator = new MyNewMessageModelDecorator(messageModel);
    this.messages.push(messageModel);
    return messageModelDecorator;
  }

  // // const ulElement = document.querySelector('#messageslist');
  // const li = document.createElement('li');
  // const textDiv = document.createElement('div');
  // textDiv.appendChild(this.createTextNode(messagemap.content));
  // textDiv.className = 'textdiv mymessagetextdiv';
  // // const chateauLoadingIcon = document.createElement('app-icon-message-delivery-status');
  // //
  // const componentFactory = this.componentFactoryResolver.resolveComponentFactory(IconMessageDeliveryStatusComponent);
  // const chateauLoadingIcon = this.messageslist.createComponent(componentFactory);
  // // console.log(`messageslist=${this.messageslist.}`);
  // // const hTMLUListElement: HTMLUListElement = this.messageslist.nativeElement;
  // // hTMLUListElement.appendChild(chateauLoadingIcon);
  // // const createdComponent = this.messageslist.nativeElement.createComponent(componentFactory);
  // const dateDiv = document.createElement('div');
  // dateDiv.appendChild(document.createTextNode(messagemap.date));
  // // the spinner must be removed after the message is sent.
  // // dateDiv.appendChild(chateauLoadingIcon);
  // dateDiv.className = 'datediv';
  // const messageDiv = document.createElement('div');
  // messageDiv.appendChild(textDiv);
  // messageDiv.appendChild(dateDiv);
  // messageDiv.className = 'messagediv';
  // li.appendChild(messageDiv);
  // // ulElement.appendChild(li);
  // // ulElement.scrollTop = ulElement.scrollHeight;
  // return {
  //   markAsSent: function () {
  //     dateDiv.removeChild(chateauLoadingIcon);
  //   }
  // };

  ngOnInit() {
  }

  /**
   * Creates a node that contains text to be displayed on the web interface.
   */
  createTextNode = function (text) {
    const textNode = document.createTextNode(text);
    // TODO replace line breaks with <BR />
    return textNode;
  };

}

export class MessageModel {
  isMyMessage: boolean;
  isDelivered: boolean; // is needed only if isMyMessage is true
  author: string; // is needed only if isMyMessage is false
  content: string;
  date: string;
  isNew = true;

  constructor() {
  }
}

export class MyNewMessageModelDecorator {
  private messageModel: MessageModel;

  constructor(messageModel: MessageModel) {
    console.log(`constructor. messageModel=${messageModel}`);
    this.messageModel = messageModel;
  }

  markAsDelivered(date: string) {
    console.log(`setDate. messageModel=${this.messageModel}`);
    const messageModel: MessageModel = this.messageModel;
    messageModel.date = date;
    messageModel.isDelivered = true;
    setTimeout(function () {
      messageModel.isNew = false;
      messageModel.isDelivered = true;
    }, 5000);
  }
}
