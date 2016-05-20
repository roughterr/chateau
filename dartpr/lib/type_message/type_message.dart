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
  @property
  String text;

  TypeMessage.created() : super.created();

  /// This method is called when the button "Send" is pressed.
  @reflectable
  void sendPressed(event, [_]) {
    print("Send pressed. text is ${text}");
  }

  /// This method is called when the button "Send" is pressed.
  @reflectable
  void inputKeyPressed(CustomEventWrapper event, [_]) {
    final KeyboardEvent keyboardEvent = event.original as KeyboardEvent;
    // If a Ctrl and Enter buttons were pressed simultateously.
    if (keyboardEvent.ctrlKey &&
        (keyboardEvent.keyCode == 13 || keyboardEvent.keyCode == 10)) {
      sendPressed(null);
    }
  }
}