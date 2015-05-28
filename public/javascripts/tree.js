/* global data, _ */
var Tree = function (moduleName) {
	'use strict';
	var moduleCache = {};
	function RequireModule(name) {
		this.id = name.replace(/\/|\./g, '-');
		this.name = name;
		this.dependencies = [];
	}

	function buildTree(name) {
		var modid = name.replace(/\/|\./g, '-');
		if (moduleCache[modid]) {
			return moduleCache[modid];
		} else {
			var mod = new RequireModule(name);
			moduleCache[modid] = mod;
			mod.dependencies = (data[name] || []).map(buildTree);
			return mod;
		}
	}

	function getAllDependencies(module) {
		var deps = _.reduce(module.dependencies, function (memo, mod) {
			memo.push(mod.name);
			if (mod.dependencies.length > 0) {
				memo = memo.concat(_.flatten(_.map(mod.dependencies, getAllDependencies)));
			}
			return memo;
		}, [module.name]);
		return deps;
	}

	return {
		build: function () {
			return buildTree(moduleName);
		},
		getModuleName: function () {
			return moduleName;
		},
		getAllDependencies: function (module) {
			return getAllDependencies(module);
		},
		getModule: function (id) {
			return moduleCache[id];
		}
	};
};