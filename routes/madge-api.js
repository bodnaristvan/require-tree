var express = require('express');
var router = express.Router();
// madge api for processing requirejs dependencies
var madge = require('madge');
// project configuration
var config = require('../config');


router.get('/', function(req, res, next) {
	if (!config.madge.path || config.madge.path === '') {
		res
			.status(500)
			.send({
				error: 'No path set for dependency tree parsing in config.js'
			});
		return;
	}
	var dependencyObject = madge(config.madge.path, config.madge.options);
	res.send(dependencyObject.tree);
});

router.get('/usedby', function(req, res, next) {
	if (!config.madge.path || config.madge.path === '') {
		res
			.status(500)
			.send({
				error: 'No path set for dependency tree parsing in config.js'
			});
		return;
	}
	var dependencyObject = madge(config.madge.path, config.madge.options);
	res.send(dependencyObject.depends(req.query.module));
});

module.exports = router;
