@HtmlImport('type_message.html')
library dartpr.lib.type_message;

import 'dart:async';
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
  /// This variable contains text that the user inputs.
  PaperTextarea _textArea;

  /// This variable indicated that the last pressed key was Enter.
  bool _lastKeyWasEnter;

  /// Provides both write and read access to the stream of messages.
  StreamController<String> _messageStreamController = new StreamController<
      String>.broadcast();

  /// Provides read access to the stream of messages.
  @Property(notify: true)
  Stream<String> messagestream;

  TypeMessage.created() : super.created();

  void ready() {
    _textArea = this.querySelector("paper-textarea");
    set("messagestream", _messageStreamController.stream);
  }

  /// This method is called when the button "Send" is pressed.
  @reflectable
  void sendPressed(event, [_]) {
    _messageStreamController.add(_textArea.value);
    _textArea.value = '';
  }

  /// This method is called when the button "Send" is pressed.
  @reflectable
  void inputKeyPressed(CustomEventWrapper event, [_]) {
    _lastKeyWasEnter = false;
    final KeyboardEvent keyboardEvent = event.original as KeyboardEvent;
    if (keyboardEvent.keyCode == 13 || keyboardEvent.keyCode == 10) {
      // If a Ctrl and Enter buttons were pressed simultaneously.
      if (keyboardEvent.ctrlKey) {
        // Ctrl+Enter combination transforms into a next line symbol.
        _textArea.value =
            (_textArea.value == null ? "" : _textArea.value.toString()) + "\n";
      } else {
        _lastKeyWasEnter = true;
      }
    }
  }

  /// This method is called when the user types something in the input text area.
  @reflectable
  void inputInput(CustomEventWrapper event, [_]) {
    if (_lastKeyWasEnter) {
      sendPressed(null);
    }
  }
}