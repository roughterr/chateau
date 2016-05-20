// Copyright (c) 2016, <your name>. All rights reserved. Use of this source code

// is governed by a BSD-style license that can be found in the LICENSE file.
@HtmlImport('type_message.html')
library dartpr.lib.type_message;

import 'dart:html';

import 'package:polymer/polymer.dart';
import 'package:web_components/web_components.dart';
import 'package:polymer_elements/paper_button.dart';
import 'package:polymer_elements/paper_textarea.dart';

/// Uses [PaperButton]
/// Uses [PaperTextarea]
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
    // If an Enter button was pressed.
    if (keyboardEvent.ctrlKey &&
        (keyboardEvent.keyCode == 13 || keyboardEvent.keyCode == 10)) {
      sendPressed(null);
    }
  }
}