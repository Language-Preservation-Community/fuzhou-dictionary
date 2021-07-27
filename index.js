const config = require('./config');
const fs = require('fs');
const search = require('./search');

let raw = fs.readFileSync(config.database);
search.init(raw);
let data = search.getData();

fs.writeFileSync('server.pid', process.pid);

const express = require('express');
const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/static', express.static('static'));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
	res.render('index');
});
app.get('/data.json', (req, res) => {
	res.set('Content-Type', 'application/json');
	res.send(raw);
});

const searchTypes = ['word', 'foochowRomanized', 'rongpin', 'bayin', 'definition', 'mandarin'];
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
app.get('/entry/:entry', (req, res, next) => {
	const entryId = Number(req.params.entry);
	if (!Number.isInteger(entryId)) {
		const err = new Error('Invalid entry ID#');
		err.status = 400;
		return next(err);
	}
	const entry = Object.assign({}, data[entryId]);
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

if (config.suggestions) {
	const { verify: hcaptchaVerify } = require('hcaptcha');
	const { Octokit } = require('@octokit/rest');
	const octokit = new Octokit({ auth: config.githubToken });
	app.get('/suggest', (req, res) => {
		res.render('suggest', { hcaptchaSitekey: config.hcaptchaSitekey });
	});
	app.post('/suggest', async (req, res, next) => {
		const { githubUsername, word, info } = req.body;
		const hcaptchaToken = req.body['h-captcha-response'];
		if (!githubUsername || !word || !info || !hcaptchaToken) {
			const err = new Error('One or more form parameters empty or nonexistent. Please enter "ghost" as your Github username if you do not wish to share your Github account');
			err.status = 400;
			return next(err);
		}
		const { success: hcaptchaSuccess } = await hcaptchaVerify(config.hcaptchaSecret, hcaptchaToken);
		if (!hcaptchaSuccess) {
			const err = new Error('hCaptcha token verification failed. Please try again.');
			err.status = 400;
			return next(err);
		}
		const comment = `User: @${githubUsername}
Word: ${word}
Info: ${info}`;
		const { data: { html_url: issueCommentUrl } } = await octokit.rest.issues.createComment({
			owner: config.suggestionsIssue.owner,
			repo: config.suggestionsIssue.repo,
			issue_number: config.suggestionsIssue.issue,
			body: comment
		});
		res.render('suggest_success', { issueCommentUrl });
	});
}

process.on('SIGUSR2', () => {
	console.log('Received SIGUSR2, reloading database...');
	raw = fs.readFileSync('data.json');
	search.init(raw);
	data = search.getData();
});

app.listen(8080)