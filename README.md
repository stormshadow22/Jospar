# Jospar — Firebase / Spark edition

Публичная конфигурация проекта **jospar-fcaa0** и VAPID настроены. Подготовлены реальные Firestore-команды, одноразовые приглашения, чат, профиль с аватаркой и Node.js push-worker. **Публикация правил и реальная доставка ещё требуют настройки владельцем проекта.**

Начните с [пошаговой инструкции подключения](FIREBASE_SETUP_RU.md). Там указаны необходимые действия в Console, команды публикации и проверка двумя аккаунтами. Приватные ключи не должны попадать в Git/чат. Аватарки хранятся в Firestore; Storage/Functions/Blaze не используются. Настоящие SMS не обещаются на Spark — для начала используйте подтверждённую почту.

```powershell
npm run setup
npm start
```

Локальный адрес: http://localhost:8085. Для разных компьютеров и браузерных push используйте Firebase Hosting https://jospar-fcaa0.web.app после успешного deploy. Локальный сервер сам не публикует правила и не включает провайдеры Authentication.

- Клиентский SDK собирается из официального npm `firebase` через esbuild и включён в public. Внешний CDN для SDK не требуется.
- Cloud UI: `public/cloud.js`. Приватные данные / public profiles / команды / invitations / сообщения / push devices разделены правилами `firestore.rules`.
- На Spark браузер получает чат напрямую; push отправляет `server/push-worker.js` с локальной Firebase Admin авторизацией и явным `JOSPAR_PUSH_WORKER=1`.
- Сервис-воркер: `src/firebase-messaging-sw.js` → `public/firebase-messaging-sw.js`. Включение push только по нажатию пользователя; устройство отключается при выходе.
- Старое локальное демо доступно разработчику при `JOSPAR_CONFIG=null`; оно не считается облачной регистрацией и не переносится в новый Firebase-аккаунт автоматически. Для переноса используйте экспорт/импорт своих планов.

Проверки: `npm test`, `npm run test:firebase`; браузерные `tests/browser.cjs`, `tests/features.cjs`, `tests/design.cjs`, `tests/reset.cjs` явно подменяют конфигурацию для демо/теста. `tests/cloud-ui.cjs` — имитация SDK для проверки двух UI-сессий, не проверка реального Firebase. Ни эти тесты, ни успешная сборка не означают, что правила уже опубликованы. Ограничения проверки/развёртывания описаны в FIREBASE_SETUP_RU.md.

Транзитивная зависимость @grpc/grpc-js зафиксирована через npm overrides на исправленной версии 1.14.6. Браузерная сборка использует browser-вариант SDK; override относится к Node-инструментам. Lockfile обязателен.

Предыдущее оформление и функции планировщика сохранены. Источники фото: public/assets/CREDITS.md.

[Подготовленный чат](docs/screenshots/firebase-chat-ui-test.png) · [Профиль](docs/screenshots/firebase-profile-ui-test.png). Эти снимки сделаны в UI-тесте с подменённым SDK, не в рабочем Firebase-проекте.
