<div>http://localhost:3000 — backend</div>
<div>http://localhost:5173 — frontend</div>
<br>
<div>I use my own framework based on Node.js/Express on the backend (API), React/TypeScript on the frontend (SPA), databases: MySQL, MongoDB, PostgreSQL</div>

1. git clone https://github.com/radianser/Chat.git

2. install dependencies:<br>
cd Chat && npm install<br>
npm --prefix client run install<br>
npm --prefix server run install

3. configure email access in .env

4. launch docker:<br>
docker compose down # The -v flag deletes data in the databases<br>
docker compose up -d # The -d flag enables background mode and returns control to the terminal

5. roll out migrations:<br>
npm --prefix server run migrate:all

6. start the servers:<br>
npm run start