const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const cors = require('cors');  // Для разрешения CORS

const app = express();
const PORT = 5500;  // Один порт для сервера и фронтенда

// --- Настройка подключения к базе данных ---
const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'nodeuser',
  password: '1234',
  database: 'queueRegistration'
});

app.use(cors());  // Для разрешения запросов с фронтенда на том же порту
app.use(express.static(path.join(__dirname, 'public')));  // Статические файлы фронтенда
app.use(express.json()); // Для обработки JSON

// --- Маршруты для API ---
app.post('/api/register', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).send('Логин и пароль не могут быть пустыми');
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send('Ошибка при хешировании пароля');
    }

    const newUser = { login, password: hashedPassword };
    const sql = 'INSERT INTO users SET ?';

    db.query(sql, newUser, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).send('Пользователь с таким логином уже существует');
        }
        console.error('Ошибка при добавлении пользователя в БД:', err);
        return res.status(500).send('Ошибка на сервере');
      }
      res.status(201).send({ message: 'Пользователь успешно зарегистрирован' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).send('Логин и пароль обязательны');
  }

  const sql = 'SELECT * FROM users WHERE login = ?';
  db.query(sql, [login], (err, results) => {
    if (err) {
      return res.status(500).send('Ошибка на сервере');
    }

    if (results.length === 0) {
      return res.status(404).send('Пользователь не найден');
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send('Ошибка при проверке пароля');
      }

      if (!isMatch) {
        return res.status(401).send('Неверный пароль');
      }

      res.status(200).send({ message: 'Авторизация прошла успешно' });
    });
  });
});

// --- Страница успешного входа ---
app.get('/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Успешный вход</title>
        <style>
          body {
            background-color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            color: #333;
          }
          h1 {
            font-size: 2rem;
            color: #4CAF50;
          }
        </style>
      </head>
      <body>
        <h1>Вы успешно вошли!</h1>
      </body>
    </html>
  `);
});

// --- Маршрут для корня (отдача HTML страницы) ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Отправляем фронтенд файл
});

// --- Запуск сервера ---
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).send('Логин и пароль обязательны');
  }

  const sql = 'SELECT * FROM users WHERE login = ?';
  db.query(sql, [login], (err, results) => {
    if (err) {
      return res.status(500).send('Ошибка на сервере');
    }

    if (results.length === 0) {
      return res.status(404).send('Пользователь не найден');
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send('Ошибка при проверке пароля');
      }

      if (!isMatch) {
        return res.status(401).send('Неверный пароль');
      }

      res.status(200).send({ message: 'Авторизация прошла успешно' });
    });
  });
});