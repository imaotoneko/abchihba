const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql'); // Модуль для работы с MySQL
const bcrypt = require('bcryptjs'); // Модуль для хеширования паролей

const app = express();
const PORT = 3000;

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Для JSON-тел
app.use(express.urlencoded({ extended: true })); // Для form-urlencoded

// --- Маршруты для работы с очередью (старый код на JSON-файле) ---

// Получить всю очередь
app.get('/api/orders', (req, res) => {
    console.log('Получен запрос на /api/orders');
    fs.readFile(path.join(__dirname, 'orders.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка чтения файла');
        res.json(JSON.parse(data));
    });
});

// Добавить клиента в очередь
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    fs.readFile('orders.json', 'utf8', (err, data) => {
        let orders = JSON.parse(data);
        orders.push(newOrder);
        fs.writeFile('orders.json', JSON.stringify(orders, null, 2), (err) => {
            if (err) return res.status(500).send('Ошибка записи файла');
            res.send('Добавлено');
        });
    });
});

// Удалить клиента по индексу
app.delete('/api/orders/:index', (req, res) => {
    const index = parseInt(req.params.index);
    fs.readFile('orders.json', 'utf8', (err, data) => {
        let orders = JSON.parse(data);
        if (index >= 0 && index < orders.length) {
            orders.splice(index, 1);
            fs.writeFile('orders.json', JSON.stringify(orders, null, 2), (err) => {
                if (err) return res.status(500).send('Ошибка записи файла');
                res.send('Удалено');
            });
        } else {
            res.status(400).send('Неверный индекс');
        }
    });
});

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
            res.status(201).send('Пользователь успешно зарегистрирован');
        });
    });
});

// --- Запуск сервера ---
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
