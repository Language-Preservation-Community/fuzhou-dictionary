const databaseFile = require('../config').database;
const { question, readDb, writeDb } = require('./util');
const fallback = (a, b) => a.length === 1 && a[0] === '' ? b : a;
const setProp = (obj, prop, value) => obj[prop] = fallback(value, obj[prop]);
(async () => {
	const db = readDb(databaseFile);
	const word = await question('Word: ');
	const foochowRomanized = (await question('Foochow Romanized: ')).split(',');
	const rongpin = (await question('Rong Pinyin: ')).split(',');
	const definition = (await question('Definition: ')).split('|');
	const mandarin = (await question('Mandarin: ')).split(',');
	const bayin = (await question('Qi Lin Bayin: ')).split(',');
	const entry = db.find(item => item.word === word);
	if (!entry) {
		throw new Error(`No such entry "${word}." Please use new_db_entry.js if you wish to create a new entry.`);
	}
	setProp(entry, 'foochowRomanized', foochowRomanized);
	setProp(entry, 'rongpin', rongpin);
	setProp(entry, 'definition', definition);
	setProp(entry, 'mandarin', mandarin);
	setProp(entry, 'bayin', bayin);
	writeDb(databaseFile, db);
	process.exit(0);
})().catch(err => { throw err; });