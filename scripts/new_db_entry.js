const databaseFile = require('../config').database;
const { question, readDb, writeDb } = require('./util');
(async () => {
	const db = readDb(databaseFile);
	const word = await question('Word: ');
	const foochowRomanized = (await question('Foochow Romanized: ')).split(',');
	const rongpin = (await question('Rong Pinyin: ')).split(',');
	const definition = (await question('Definition: ')).split('|'); //split by | so that commas work
	const mandarin = (await question('Mandarin: ')).split(',');
	const bayin = (await question('Qi Lin Bayin: ')).split(',');
	db.push({
		word,
		foochowRomanized,
		rongpin,
		definition,
		mandarin,
		bayin
	});
	writeDb(databaseFile, db);
	process.exit(0);
})();