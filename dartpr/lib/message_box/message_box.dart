@HtmlImport('message_box.html')
library dartpr.lib.message_box;

import 'package:polymer/polymer.dart';
import 'package:web_components/web_components.dart';
import 'package:dartpr/type_message/type_message.dart';

/// Uses [TypeMessage]
/// This Polymer element will contain an input fiend and a button "Send".
@PolymerRegister('message-box')
class MessageBox extends PolymerElement {
  MessageBox.created() : super.created();
}