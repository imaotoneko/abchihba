const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql'); // Модуль для работы с MySQL
const bcrypt = require('bcryptjs'); // Модуль для хеширования паролей

const app = express();
const PORT = 5500; // Используем один порт для сервера

// --- Настройка подключения к базе данных через Pool ---
const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'nodeuser',  // или admin, если починил
  password: '1234',
  database: 'queueRegistration'
});

// --- Маршрут для пинга БД ---
app.get('/api/ping-db', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('Ошибка подключения к БД:', err);
      return res.status(500).send('БД недоступна');
    }
    console.log('✅ Пинг прошёл: подключение есть');
    res.send('БД подключена');
  });
});

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));  // Обслуживаем статические файлы (frontend)
app.use(express.json()); // Для обработки JSON в запросах
app.use(express.urlencoded({ extended: true })); // Для обработки urlencoded данных

// --- Маршрут для регистрации пользователя ---
app.post('/api/register', (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).send('Логин и пароль не могут быть пустыми');
  }

  // Хешируем пароль перед сохранением
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
        return res.status(500).send('Ошибка на стороне сервера при регистрации');
      }
      console.log('Пользователь успешно зарегистрирован:', result);
      res.status(201).send({ message: 'Пользователь успешно зарегистрирован' });
    });
  });
});

// --- Маршрут для логина ---
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).send('Логин и пароль обязательны');
  }

  const sql = 'SELECT * FROM users WHERE login = ?';
  db.query(sql, [login], (err, results) => {
    if (err) {
      console.error('Ошибка при запросе пользователя:', err);
      return res.status(500).send('Ошибка на стороне сервера');
    }

    if (results.length === 0) {
      return res.status(404).send('Пользователь не найден');
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Ошибка при сравнении паролей:', err);
        return res.status(500).send('Ошибка при проверке пароля');
      }

      if (!isMatch) {
        return res.status(401).send('Неверный пароль');
      }

      console.log('✅ Авторизация прошла успешно');
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
            color: #4CAF50;  /* Зелёный цвет для успешного входа */
          }
        </style>
      </head>
      <body>
        <h1>Вы успешно вошли!</h1>
      </body>
    </html>
  `);
});

// --- Запуск сервера ---
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
