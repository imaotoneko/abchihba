const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql'); // Добавляем модуль для работы с MySQL
const bcrypt = require('bcryptjs'); // Добавляем модуль для хеширования паролей

const app = express();
const PORT = 3000;

// --- Настройка подключения к базе данных MySQL ---
// Замените на ваши реальные данные для подключения
const db = mysql.createConnection({
    host: 'localhost', // или IP-адрес вашего сервера БД
    user: 'your_username', // ваше имя пользователя в MySQL
    password: 'your_password', // ваш пароль в MySQL
    database: 'your_database' // название вашей базы данных
});

// Подключаемся к базе данных
db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Успешное подключение к базе данных MySQL!');
});

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Для парсинга JSON-тела запроса
app.use(express.urlencoded({ extended: true })); // Для парсинга данных из HTML-форм

// --- Маршруты для работы с очередью (старый код) ---

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


// --- НОВЫЙ МАРШРУТ ДЛЯ РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЯ ---
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
                // Проверяем, не является ли ошибка дубликатом логина
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
