var express = require('express'),
	Promisejs = require('promise'),

	// madge api for processing requirejs dependencies
	madge = require('madge'),

	// project configuration
	config = require('../config'),
	router = express.Router();

function getDependencyTree() {
	return new Promisejs(function (resolve, reject) {
		if (!config.madge.path || config.madge.path === '') {
			reject('No path set for dependency tree parsing in config.js');
		}
		var dependencyObject = madge(config.madge.path, config.madge.options);
		resolve(dependencyObject);
	});
}

router.get('/', function (req, res) {
	getDependencyTree()
		.then(function (dependencyObject) {
			res.send(dependencyObject.tree);
		})
		.catch(function (errorMessage) {
			res
				.status(500)
				.send({
					error: errorMessage
				});
		});
});

router.get('/usedby', function (req, res) {
	getDependencyTree()
		.then(function (dependencyObject) {
			res.send(dependencyObject.depends(req.query.module));
		})
		.catch(function (errorMessage) {
			res
				.status(500)
				.send({
					error: errorMessage
				});
		});
});

module.exports = router;
