const fs = require('fs');
const rl = require('readline').createInterface({input:process.stdin,output:process.stdout});
function question(questionStr) {
	return new Promise(function(resolve) {
		rl.question(questionStr, (name) => {
			resolve(name);
		});
	});
}
function readDb(file) {
	return JSON.parse(fs.readFileSync(file));
}
function writeDb(file, db) {
	return fs.writeFileSync(file, JSON.stringify(db, null, '\t'));
}
module.exports = { rl, question, readDb, writeDb };
