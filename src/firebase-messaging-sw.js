/* Background push uses data-only FCM messages to avoid duplicate notifications. */
import {initializeApp} from 'firebase/app';
import {getMessaging,onBackgroundMessage} from 'firebase/messaging/sw';
self.addEventListener('notificationclick',event=>{event.notification.close();const id=event.notification.data?.teamId;const url=new URL('/',self.location.origin);if(typeof id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(id))url.searchParams.set('team',id);event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{const client=clients.find(c=>new URL(c.url).origin===self.location.origin);if(client){await client.navigate(url.href);return client.focus()}return self.clients.openWindow(url.href)}))});
importScripts('/config.js');
const messaging=getMessaging(initializeApp(self.JOSPAR_CONFIG));
onBackgroundMessage(messaging,payload=>self.registration.showNotification(payload.data?.title||'Jospar',{body:payload.data?.body||'Новое сообщение команды',icon:'/assets/app-icon.svg',badge:'/assets/app-icon.svg',tag:payload.data?.notificationId||payload.messageId,data:{teamId:payload.data?.teamId||''}}));
