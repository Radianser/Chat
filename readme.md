<div>http://localhost:3000 — backend</div>
<div>http://localhost:5173 — frontend</div>
<div>To start both backend and frontend execute "npm run start"</div>
<br>
<div>Используется свой фреймворк на базе Node.js/Express, React/TypeScript, MySQL, MongoDB</div>

1. git clone https://github.com/radianser/Chat.git
2. устанавливаем зависимости:
- cd Chat && npm install
- cd client && npm install
- cd ../server && npm install

3. в папке server накатываем миграции:
- npm run migrate:mysql:latest  # Применить все миграции MySQL
- npm run migrate:mongo:up      # Применить все миграции MongoDB

4. настраиваем .env с доступами к БД и почте
5. в папке Chat стартуем сервера:
- npm run start