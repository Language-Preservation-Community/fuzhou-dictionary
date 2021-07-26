module.exports = {
	database: 'data.json',
	suggestions: true,
	hcaptchaSitekey: process.env.HCAPTCHA_SITEKEY,
	hcaptchaSecret: process.env.HCAPTCHA_SECRET,
	githubToken: process.env.GITHUB_TOKEN,
	suggestionsIssue: {
		owner: 'Language-Preservation-Community',
		repo: 'fuzhou-dictionary',
		issue: 3
	}
};