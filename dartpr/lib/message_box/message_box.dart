@HtmlImport('message_box.html')
library dartpr.lib.message_box;

import 'dart:async';
import 'dart:html';

import "package:stomp/stomp.dart";
import "package:stomp/websocket.dart" show connect;

import 'package:polymer/polymer.dart';
import 'package:web_components/web_components.dart';
import 'package:dartpr/type_message/type_message.dart';

/// Uses [TypeMessage]
/// This Polymer element will contain an input fiend and a button "Send".
@PolymerRegister('message-box')
class MessageBox extends PolymerElement {
  /// Stream of messages that the user types.
  Stream<String> messagestream;

  /// Subscription to a stream of messages that the user types.
  StreamSubscription _streamSubscription;

  WebSocket ws;

  MessageBox.created() : super.created();

  void ready() {
    //Opens WebSocket connection.
    // ws = new WebSocket('ws://localhost:8080/nauchat/echo');
    //  _streamSubscription =
    //  messagestream.listen((s) => ws.send("Message from chat: " + s));
    try {
      Future<StompClient> stompFuture =
      connect("ws://localhost:8080/chateau", login : "ian", passcode: "ian", host : "localhost");
      StompClient stompClient;
      stompFuture.then((StompClient stompClient) => _doClient(stompClient));
    } catch (exception, stackTrace) {
      print(exception);
      print(stackTrace);
    }
  }

  void _doClient(StompClient stompClient) {
    print("CONNECTED");
    stompClient.subscribeString(null, "/messages",
        (Map<String, String> headers, String message) {
      print("Recieve $message");
    });
    stompClient.sendString("/messages", "test123");
    print("SENT");
  }
}