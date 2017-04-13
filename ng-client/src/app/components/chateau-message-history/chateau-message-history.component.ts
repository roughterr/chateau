import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-chateau-message-history',
  templateUrl: './chateau-message-history.component.html',
  styleUrls: ['./chateau-message-history.component.css']
})
export class ChateauMessageHistoryComponent implements OnInit {
  drawNewMyMessageFunction: (messageMap) => any = function (messagemap) {
    const ulElement = document.querySelector('#messageslist');
    const li = document.createElement('li');
    const textDiv = document.createElement('div');
    textDiv.appendChild(this.createTextNode(messagemap.content));
    textDiv.className = 'textdiv mymessagetextdiv';
    const chateauLoadingIcon = document.createElement('chateau-loading-icon');
    const dateDiv = document.createElement('div');
    dateDiv.appendChild(document.createTextNode(messagemap.date));
    // the spinner must be removed after the message is sent.
    dateDiv.appendChild(chateauLoadingIcon);
    dateDiv.className = 'datediv';
    const messageDiv = document.createElement('div');
    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(dateDiv);
    messageDiv.className = 'messagediv';
    li.appendChild(messageDiv);
    ulElement.appendChild(li);
    ulElement.scrollTop = ulElement.scrollHeight;
    return {
      markAsSent: function () {
        dateDiv.removeChild(chateauLoadingIcon);
      }
    };
  };

  constructor() {
  }

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
