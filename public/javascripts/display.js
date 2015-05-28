/* global document, _, Tree */
var linkedTemplate = _.template(document.getElementById('linkedItem').innerText);
var simpleTemplate = _.template(document.getElementById('simpleItem').innerText);
var infopaneTemplate = _.template(document.getElementById('infoPane').innerText);
var historyitemTemplate = _.template(document.getElementById('historyItem').innerText);

var Renderer = function () {
	'use strict';

	var $starter = document.getElementById('starter');
	var $history = document.getElementById('history');
	var treeBuilder = null;

	var keepHistory = false;
	var historyStack = [];

	function onItemClick(e) {
		if (e.target.classList.contains('info')) {
			e.preventDefault();
			var mod = treeBuilder.getModule(e.target.dataset.id),
				deps = treeBuilder.getAllDependencies(mod),
				infopane = infopaneTemplate({
					name: mod.name,
					deps: _.chain(deps).unique().without(mod.name).sortBy().value()
				}),
				$p;

			e.target.innerHTML += infopane;
			$p = e.target.querySelector('.infopane');

			$p.addEventListener('click', function (ce) {
				ce.preventDefault();
				e.target.removeChild($p);
			});
		}

		if (e.target.classList.contains('openModule')) {
			e.preventDefault();
			render(e.target.dataset.name);
		}

		if (e.target.classList.contains('toggle')) {
			e.preventDefault();
			e.target.parentNode.classList.toggle('hide-children');
		}
	}


	function renderTree(module) {
		var displayedNodes = [];

		var drawNode = function (mod, el) {
				var childPlaceholder;

				if (displayedNodes.indexOf(mod.name) !== -1) {
					el.innerHTML += linkedTemplate({name: mod.name, id: mod.id});
				} else {
					displayedNodes.push(mod.name);
					el.innerHTML += simpleTemplate({name: mod.name, id: mod.id, deps: mod.dependencies.length});
					childPlaceholder = el.querySelector('ul#ul_' + mod.id);
					mod.dependencies.forEach(function (i) {
						drawNode(i, childPlaceholder);
					});
				}
			};
		drawNode(module, $starter);
	}

	function render(moduleName) {
		treeBuilder = new Tree(moduleName);
		// clear the existing tree from the DOM
		$starter.innerHTML = '';
		// render the new one
		renderTree(treeBuilder.build(), treeBuilder);
		// keep history
		if (keepHistory) {
			historyStack.push(treeBuilder.getModuleName());
			updateHistory();
		}
	}

	function setupClickHandlers() {
		$starter.removeEventListener('click', onItemClick);
		$history.removeEventListener('click', onItemClick);

		$starter.addEventListener('click', onItemClick);
		$history.addEventListener('click', onItemClick);
	}

	function updateHistory() {
		var renderHistoryItem = function (item) {
			return historyitemTemplate({moduleName: item});
		};
		$history.innerHTML = _.chain(historyStack).unique().map(renderHistoryItem).join('');
	}

	return {
		render: function (moduleName) {
			setupClickHandlers();
			render(moduleName);
		},

		setupHistory: function (storeHistory) {
			keepHistory = storeHistory;
		}
	};
};