const fs = require('fs');
const search = require('./search');
let raw = fs.readFileSync('data.json');
search.init(raw);
let data = search.getData();

const express = require('express');
const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views')

app.get('/', (req, res) => {
	res.render('index');
});
app.get('/data.json', (req, res) => {
	res.set('Content-Type', 'application/json');
	res.send(raw);
});

const searchTypes = ['word', 'foochowRomanized', 'rongpin', 'definition', 'mandarin'];
app.get('/search', (req, res, next) => {
	const { type, query } = req.query;
	if (type === undefined || query === undefined) {
		const err = new Error('Missing parameters type or query');
		err.status = 400;
		return next(err);
	}
	if (!searchTypes.includes(type)) {
		const err = new Error('No such search type');
		err.status = 400;
		return next(err);
	}
	const searchResults = search.search(type, query);
	res.render('search', { searchResults });
});
app.get('/entry/:entry', (req, res) => {
	const entryId = Number(req.params.entry);
	if (!Number.isInteger(entryId)) {
		const err = new Error('Invalid entry ID#');
		err.status = 400;
		return next(err);
	}
	const entry = data[entryId];
	if (!entry) {
		const err = new Error('No such entry');
		err.status = 404;
		return next(err);
	}
	for (const key of Object.keys(entry)) {
		entry[key] = entry[key] instanceof Array && key !== 'definition' ? entry[key].join(', ') : entry[key];
	}
	entry._index = entryId;
	res.render('entry', entry);
});

process.on('SIGUSR2', () => {
	console.log('Received SIGUSR2, reloading database...');
	raw = fs.readFileSync('data.json');
	search.init(raw);
	data = search.getData();
});

app.listen(8080)