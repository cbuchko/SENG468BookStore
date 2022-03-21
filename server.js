const express = require('express');
const app = express();


const path = require('path');
const redis = require('redis');
const client = redis.createClient({url: process.env.REDIS_URL});

app.set('view engine', 'ejs');

app.use("/static", express.static(path.join(__dirname, "/static")));

app.get('/store/:key', async (req,res) => {
	const { key } = req.params;
	const value = req.query;
	const date = new Date();
	const order = {...value, date: date.toLocaleDateString("en-US")};
	await client.lpush(key, JSON.stringify(order));
	res.sendFile(path.join(__dirname, '/orders.html'));
});

app.get('/admin', async (req, res) => {
	await client.lrange("orders", 0, -1, function(err, items){
		const orders = items.map((order) => {
			return JSON.parse(order);
		});
		return res.render('admin', {orders: orders});
        });
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
	console.log(`Server listening on port ${PORT}`);
});