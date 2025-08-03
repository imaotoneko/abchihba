const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});