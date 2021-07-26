let data;
function init(json) { 
	data = JSON.parse(json);
}
function getData() {
	return data;
}
function search(type, query) {
	const results = [];
	const exact = [];
	const matches = (str, query) => {
		if (str === query) {
			return {exact:true};
		} else if (str.includes(query)) {
			return {exact:false};
		}
		return false;
	};
	for (const [index, word] of data.entries()) {
		word._index = index;
		if (word[type] instanceof Array) {
			for (const item of word[type]) {
				const queryResults = matches(item, query);
				if (queryResults) {
					queryResults.exact ? exact.push(word) : results.push(word);
					break;
				}
			}
		} else {
			const queryResults = matches(word[type], query);
			if (queryResults) {
				queryResults.exact ? exact.push(word) : results.push(word);
			}
		}
	}
	results.unshift(...exact);
	return results;
}
module.exports = { init, getData, search };