// Index bridge intentionally points to the stubbed CommonJS file to avoid
// accidentally re-introducing the legacy implementation during tests or scripts.
try {
	module.exports = require('../mockData.cjs');
} catch (e) {
	module.exports = {};
}
