import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-chateau-type-message',
  templateUrl: './chateau-type-message.component.html',
  styleUrls: ['./chateau-type-message.component.css']
})
export class ChateauTypeMessageComponent implements OnInit {
  /** Text that the user has typed. */
  textarea: string;
  /** This variable indicated that the operation was sending a message by Enter key. */
  private lastOperationWasSendByEnter = false;
  /** The type message component calls this function after a user types a new message. */
  @Input()
  typenewmessagefunction: (string) => void = (str: string) => {};

  constructor() {
  }

  ngOnInit() {
  }

  onSend() {
    if (this.textarea != null && this.textarea !== '') {
      this.typenewmessagefunction(this.textarea);
    }
    this.textarea = '';
  }

  onKeypressTextarea(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.keyCode === 13 || keyboardEvent.keyCode === 10) {
      keyboardEvent.preventDefault();
      // If a Ctrl and Enter buttons were pressed simultaneously.
      if (keyboardEvent.ctrlKey) {
        // Ctrl+Enter combination transforms into a next line symbol.
        this.textarea =
          (this.textarea == null ? '\n' : this.textarea) + '\n';
      } else {
        this.lastOperationWasSendByEnter = true;
        this.onSend();
      }
    }
  }

  /**
   * It is called when a user types something in the input text area.
   */
  onInputTextarea() {
    if (this.lastOperationWasSendByEnter) {
      this.textarea = '';
      this.lastOperationWasSendByEnter = false;
    }
  }
}
