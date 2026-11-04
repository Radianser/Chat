<div>http://localhost:3000 — backend</div>
<div>http://localhost:5173 — frontend</div>
<div>To start both backend and frontend execute "npm run start"</div>
<br>
<div>Используется свой фреймворк на базе Node.js/Express, React/TypeScript, MySQL, MongoDB, PostgreSQL</div>

1. git clone https://github.com/radianser/Chat.git

2. устанавливаем зависимости:<br>
cd Chat && npm install<br>
npm --prefix client run install<br>
npm --prefix server run install

3. настраиваем в .env доступы к почте

4. запускаем докер:<br>
docker compose down -v # Флаг -v удаляет данные в базах<br>
docker compose up -d # Флаг -d включает фоновый режим и возвращает управление терминалом

5. накатываем миграции:<br>
npm --prefix server run migrate:all

6. стартуем сервера:<br>
npm run start