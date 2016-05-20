@HtmlImport('type_message.html')
library dartpr.lib.type_message;

import 'dart:html';

import 'package:polymer/polymer.dart';
import 'package:web_components/web_components.dart';
import 'package:polymer_elements/paper_button.dart';
import 'package:polymer_elements/paper_textarea.dart';

/// Uses [PaperButton]
/// Uses [PaperTextarea]
/// This Polymer element will contain an input fiend and a button "Send".
@PolymerRegister('type-message')
class TypeMessage extends PolymerElement {
  PaperTextarea textArea;

  /// This variable indicated that the last pressed key was Enter.
  bool _lastKeyWasEnter;

  TypeMessage.created() : super.created();

  void ready() {
    textArea = this.querySelector("paper-textarea");
  }

  /// This method is called when the button "Send" is pressed.
  @reflectable
  void sendPressed(event, [_]) {
    print("Send pressed. textArea.value is ${textArea.value}");
    textArea.value = null;
  }

  /// This method is called when the button "Send" is pressed.
  @reflectable
  void inputKeyPressed(CustomEventWrapper event, [_]) {
    _lastKeyWasEnter = false;
    final KeyboardEvent keyboardEvent = event.original as KeyboardEvent;
    // If a Ctrl and Enter buttons were pressed simultaneously.
    if (keyboardEvent.keyCode == 13 || keyboardEvent.keyCode == 10) {
      if (keyboardEvent.ctrlKey) {
        // Ctrl+Enter combination transforms into a next line symbol.
        textArea.value = textArea.value + "\n";
      } else {
        _lastKeyWasEnter = true;
      }
    }
  }

  /// This method is the user types something in the input text area.
  @reflectable
  void inputInput(CustomEventWrapper event, [_]) {
    if (_lastKeyWasEnter) {
      sendPressed(null);
    }
  }
}