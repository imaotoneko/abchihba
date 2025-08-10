const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5500;
const SECRET_KEY = 'your_secret_key'; // Лучше вынести в .env

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'front')));

// Подключение к базе данных
const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'abchihba_user',
  password: 'securepass123',
  database: 'queueRegistration',
});


// Регистрация
app.post('/api/register', (req, res) => {
  const { login, password } = req.body;

  console.log("Регистрация запроса:", { login, password });

  if (!login || !password) {
    return res.status(400).json({ error: 'Логин и пароль не могут быть пустыми' });
  }

  // Проверка, существует ли логин
  const checkSql = 'SELECT id FROM users WHERE login = ?';
  db.query(checkSql, [login], (err, results) => {
    if (err) {
      console.error("Ошибка при проверке логина:", err);
      return res.status(500).json({ error: 'Ошибка на сервере при проверке логина' });
    }

    if (results.length > 0) {
      console.warn("Пользователь уже существует:", login);
      return res.status(409).json({ error: 'Пользователь с таким логином уже существует' });
    }

    // Хеширование пароля
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Ошибка при хешировании пароля:", err);
        return res.status(500).json({ error: 'Ошибка при хешировании пароля' });
      }

      const insertSql = 'INSERT INTO users (login, password, created_at) VALUES (?, ?, NOW())';
      db.query(insertSql, [login, hashedPassword], (err, result) => {
        if (err) {
          console.error("Ошибка при вставке пользователя:", err);
          return res.status(500).json({ error: 'Ошибка на сервере при создании пользователя' });
        }

        console.log("Пользователь успешно зарегистрирован:", login);
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
      });
    });
  });
});

// Логин
// Логин с полной проверкой
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  console.log("Запрос на логин:", { login, password });

  if (!login || !password) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' });
  }

  const sql = 'SELECT * FROM users WHERE login = ?';
  db.query(sql, [login], (err, results) => {
    if (err) {
      console.error("Ошибка SQL при поиске пользователя:", err);
      return res.status(500).json({ error: 'Ошибка на сервере при поиске пользователя' });
    }

    if (!results || results.length === 0) {
      console.warn("Пользователь не найден:", login);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = results[0];
    console.log("Найден пользователь:", user);

    if (!user.password) {
      console.error("Пароль отсутствует в базе для пользователя:", login);
      return res.status(500).json({ error: 'Ошибка: пароль не найден в базе' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Ошибка при сравнении паролей:", err);
        return res.status(500).json({ error: 'Ошибка при проверке пароля' });
      }

      if (!isMatch) {
        console.warn("Неверный пароль для пользователя:", login);
        return res.status(401).json({ error: 'Неверный пароль' });
      }

      const token = jwt.sign({ id: user.id, login: user.login }, SECRET_KEY, { expiresIn: '2h' });
      console.log("Авторизация успешна, токен:", token);
      res.status(200).json({ message: 'Авторизация прошла успешно', token });
    });
  });
});


// Заказ
app.post('/api/order', (req, res) => {
  const { token, pizzaId, address, phone } = req.body;

  if (!token || !pizzaId || !address || !phone) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  let userData;
  try {
    userData = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res.status(401).json({ error: 'Невалидный токен' });
  }

  const sql = 'INSERT INTO orders (user_id, pizza_id, address, phone) VALUES (?, ?, ?, ?)';
  db.query(sql, [userData.id, pizzaId, address, phone], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при создании заказа' });
    }
    res.status(201).json({ message: 'Заказ успешно оформлен' });
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('Ошибка подключения к базе:', err.message);
  } else {
    console.log('Подключение к базе успешно');
  }
});