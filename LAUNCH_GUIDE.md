# 🚀 Руководство по запуску QuestTrip-App

## 📋 Быстрый старт

### 1. Установка зависимостей
```bash
# Перейдите в директорию проекта
cd /Users/work/Downloads/questtrip-app\ 2

# Установите зависимости сервера
cd server && npm install
```

### 2. Настройка окружения
```bash
# Создайте файл .env из примера
cp .env.example .env

# Файл .env уже содержит рабочие значения по умолчанию:
# PORT=5000
# NODE_ENV=development
# JWT_SECRET=your-super-secret-jwt-key-change-in-production
# DATABASE_URL=file:./questtrip.db
```

### 3. Запуск приложения
```bash
# Запуск в режиме разработки (рекомендуется)
cd server && npm run dev

# Или используйте одну команду из корня проекта
cd /Users/work/Downloads/questtrip-app\ 2/server && npm run dev
```

### 4. Проверка работоспособности
- **Frontend**: http://localhost:5000
- **API Endpoints**: http://localhost:5000/api/quests
- **Статика**: http://localhost:5000/static

## 🛠️ Альтернативные команды

### Разработка
```bash
# Только сборка
cd server && npm run build

# Запуск продакшен-версии
cd server && npm start

# Запуск тестов
cd server && npm test

# Запуск конкретных тестов (например, кэширования)
cd server && npm test -- --testPathPatterns=cache.test.ts
```

### База данных
```bash
# Генерация миграций (если изменена схема)
cd server && npx drizzle-kit generate

# Применение миграций
cd server && npx drizzle-kit migrate
```

### Проверка кода
```bash
# Проверка TypeScript
cd server && npx tsc --noEmit

# Проверка сборки
cd server && npm run build
```

## 🔧 Устранение неполадок

### Проблема: Порт 5000 занят
```bash
# Вариант 1: Освободить порт
lsof -ti:5000 | xargs kill -9

# Вариант 2: Изменить порт в .env
# PORT=5001
```

### Проблема: Ошибки зависимостей
```bash
# Очистите кэш npm и переустановите
cd server && rm -rf node_modules package-lock.json
cd server && npm cache clean --force
cd server && npm install
```

### Проблема: Ошибки TypeScript
```bash
# Проверьте ошибки компиляции
cd server && npx tsc --noEmit

# Установите недостающие типы
cd server && npm install --save-dev @types/node @types/express @types/cors
```

### Проблема: База данных не создана
```bash
# Убедитесь, что файл questtrip.db существует
ls -la server/questtrip.db

# Если файла нет, сервер создаст его автоматически при первом запуске
```

### Проблема: Ошибки импорта компонентов
```bash
# Если возникают ошибки "Cannot find module"
# Убедитесь, что все импорты используют правильные пути:
# Вместо: import Navbar from "@/components/navbar"
# Используйте: import Navbar from "@/components/shared/navbar"
```

## 📊 Мониторинг запуска

### Успешный запуск
При успешном запуске вы увидите в консоли:
```
[Security] Security middleware configured successfully
[HH:MM:SS] info: Logging system initialized {"environment":"development","logLevel":"default"}
Server started on port 5000
```

### Проверка API
```bash
# Проверьте доступность API
curl http://localhost:5000/api/quests

# Или откройте в браузере
open http://localhost:5000/api/quests
```

## 🎯 Особенности после архитектурных улучшений

### 1. Безопасность
- **Helmet.js** - защита заголовков
- **Rate limiting** - ограничение запросов
- **CORS** - настройка кросс-доменных запросов
- **Input sanitization** - очистка пользовательского ввода

### 2. Производительность
- **Кэширование** - in-memory кэш с TTL и LRU
- **Пагинация** - оптимизация загрузки данных
- **Compression** - сжатие ответов GZIP
- **Логирование** - структурированные логи запросов

### 3. Архитектура
- **Сервисный слой** - отделение бизнес-логики
- **Модульные роутеры** - разделение по функциональности
- **Централизованная обработка ошибок** - AppError hierarchy
- **Валидация** - Zod схемы для всех входных данных

## 🚨 Экстренные действия

### Если приложение не запускается
1. Проверьте версию Node.js: `node --version` (требуется 20+)
2. Проверьте наличие файла `server/questtrip.db`
3. Проверьте права доступа: `chmod 755 server/questtrip.db`
4. Запустите с подробным логированием: `cd server && NODE_ENV=development DEBUG=* npm run dev`

### Если API не отвечает
1. Проверьте, запущен ли сервер: `ps aux | grep node`
2. Проверьте логи: `tail -f server/logs/*.log` (если настроено файловое логирование)
3. Проверьте консоль на наличие ошибок

## 📞 Дополнительная помощь

### Полезные команды для диагностики
```bash
# Проверка занятых портов
netstat -an | grep 5000

# Проверка процессов Node.js
ps aux | grep node

# Просмотр логов в реальном времени
cd server && npm run dev 2>&1 | grep -E "(error|Error|ERROR|failed|Failed)"
```

### Ключевые файлы для проверки
- `server/.env` - настройки окружения
- `server/questtrip.db` - база данных SQLite
- `server/index.ts` - точка входа сервера
- `client/src/App.tsx` - точка входа клиента
- `shared/schema.ts` - схемы базы данных

---

**Примечание**: После всех архитектурных улучшений приложение имеет улучшенную безопасность, производительность и поддерживаемость. Все тесты проходят успешно, сборка работает без ошибок.