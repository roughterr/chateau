import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ChateauTypeMessageComponent } from './components/chateau-type-message/chateau-type-message.component';
import { MaterialModule } from '@angular/material';
import { ChateauMessageHistoryComponent } from './components/chateau-message-history/chateau-message-history.component';

@NgModule({
  declarations: [
    AppComponent,
    ChateauTypeMessageComponent,
    ChateauMessageHistoryComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
