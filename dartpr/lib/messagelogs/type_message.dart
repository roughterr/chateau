// Copyright (c) 2016, <your name>. All rights reserved. Use of this source code

// is governed by a BSD-style license that can be found in the LICENSE file.
@HtmlImport('type_message.html')
library dartpr.lib.type_message;

import 'package:polymer/polymer.dart';
import 'package:web_components/web_components.dart';
import 'package:polymer_elements/paper_button.dart';
import 'package:polymer_elements/paper_input.dart';
import 'package:polymer_elements/paper_input.html';

/// Uses [PaperButton]
/// /// Uses [PaperInput]
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
}