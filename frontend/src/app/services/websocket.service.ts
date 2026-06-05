import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

declare var SockJS: any;
declare var Stomp: any;

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private stompClient: any;
  private messageSubject = new Subject<any>();

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js', 'sockjs-script');
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js', 'stomp-script');
        this.connect();
      }
    } catch (e) {
      console.error('Failed to load WebSocket libraries', e);
    }
  }

  private loadScript(src: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  private connect(): void {
    try {
      const socket = new SockJS(environment.apiBaseUrl.replace('/api', '/ws'));
      this.stompClient = Stomp.over(socket);
      
      // Disable debug console spam to keep log traces clean
      this.stompClient.debug = () => {};

      this.stompClient.connect({}, () => {
        console.log('Successfully connected to backend WebSocket STOMP broker');
        
        this.stompClient.subscribe('/topic/expenses', (msg: any) => {
          if (msg.body) {
            this.messageSubject.next(JSON.parse(msg.body));
          }
        });

        this.stompClient.subscribe('/topic/notifications', (msg: any) => {
          if (msg.body) {
            const payload = JSON.parse(msg.body);
            // Tag message with source context
            payload.isSystemNotification = true;
            this.messageSubject.next(payload);
          }
        });

        this.stompClient.subscribe('/topic/live-traffic', (msg: any) => {
          if (msg.body) {
            const payload = JSON.parse(msg.body);
            payload.isLiveTraffic = true;
            this.messageSubject.next(payload);
          }
        });

        this.stompClient.subscribe('/topic/presence', (msg: any) => {
          if (msg.body) {
            const payload = JSON.parse(msg.body);
            payload.isPresenceUpdate = true;
            this.messageSubject.next(payload);
          }
        });
      }, (error: any) => {
        console.warn('STOMP connection dropped, retrying in 5 seconds...', error);
        setTimeout(() => this.connect(), 5000);
      });
    } catch (err) {
      console.error('Error establishing SockJS connection', err);
      setTimeout(() => this.connect(), 5000);
    }
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  sendPresence(username: string, cellId: string): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/presence/update', {}, JSON.stringify({
        username: username,
        cellId: cellId,
        timestamp: new Date().toISOString()
      }));
    }
  }
}
