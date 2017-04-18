import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-icon-message-delivery-status',
  templateUrl: './icon-message-delivery-status.component.html',
  styleUrls: ['./icon-message-delivery-status.component.css']
})
export class IconMessageDeliveryStatusComponent implements OnInit {
  /**
   * Boolean value that is used to show if the message has been already delivered.
   * @type {boolean}
   */
  @Input()
  delivered = false;

  constructor() {
  }

  ngOnInit() {
  }
}
