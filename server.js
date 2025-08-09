const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 5500;  // Один порт для сервера и фронтенда
app.use(cors());

// --- Настройка подключения к базе данных ---
const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'nodeuser',
  password: '1234',
  database: 'queueRegistration'
});

// --- Middleware ---
app.use(cors());  // Для разрешения запросов с фронтенда на том же порту
app.use(express.static(path.join(__dirname, 'front')));  // Статические файлы фронтенда
app.use(express.json()); // Для обработки JSON

// --- Маршрут для отдачи HTML страницы ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));  // Отправляем файл index.html из папки front
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
        return res.status(500).send('Ошибка на сервере');
      }
      res.status(201).send({ message: 'Пользователь успешно зарегистрирован' });
    });
  });
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'success.html'));  // Путь к файлу страницы успеха
});

// --- Запуск сервера ---
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
