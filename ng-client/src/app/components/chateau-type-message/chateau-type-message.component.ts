import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-chateau-type-message',
  templateUrl: './chateau-type-message.component.html',
  styleUrls: ['./chateau-type-message.component.css']
})
export class ChateauTypeMessageComponent implements OnInit {
  /** Text that the user has typed. */
  textarea: string;
  /** The type message component calls an 'emit' method of this object after the user types a new message. */
  @Output()
  private typedMessagesEventEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit() {
  }

  onSend() {
    if (this.textarea != null && this.textarea !== '') {
      this.typedMessagesEventEmitter.emit(this.textarea);
    }
    this.textarea = '';
  }

  onKeypressTextarea(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.keyCode === 13 || keyboardEvent.keyCode === 10) {
      // If a Ctrl and Enter buttons were pressed simultaneously.
      if (keyboardEvent.ctrlKey) {
        // Ctrl+Enter combination transforms into a next line symbol.
        this.textarea = this.textarea == null ? '\n' : (this.textarea + '\n');
      } else if (!keyboardEvent.shiftKey) {
        this.onSend();
        keyboardEvent.preventDefault();
      }
    }
  }
}
