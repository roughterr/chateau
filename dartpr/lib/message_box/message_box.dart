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

  /// This value of this variable will be send to the component that
  /// communicates with the STOMP server (implementation may be substituted).
  var messagetosend;

  void ready() {
    print("messagestream is ${messagestream}");
    this.messagetosend = "1";
    this.messagetosend = "2";
    //Opens WebSocket connection.
    // ws = new WebSocket('ws://localhost:8080/nauchat/echo');
    //  _streamSubscription =
//      messagestream.listen((s) => print("Message from chat: " + s));
    messagestream.listen((s) => set("messagetosend", s));
//    try {
//      Future<StompClient> stompFuture =
//      connect("ws://localhost:8080/chateau", login : "ian", passcode: "ian", host : "localhost");
//      StompClient stompClient;
//      stompFuture.then((StompClient stompClient) => _doClient(stompClient));
//    } catch (exception, stackTrace) {
//      print(exception);
//      print(stackTrace);
//    }
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