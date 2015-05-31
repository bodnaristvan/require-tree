/* global document, _, Tree, XMLHttpRequest */
var linkedTemplate = _.template(document.getElementById('linkedItem').innerText),
	simpleTemplate = _.template(document.getElementById('simpleItem').innerText),
	infopaneTemplate = _.template(document.getElementById('infoPane').innerText),
	historyitemTemplate = _.template(document.getElementById('historyItem').innerText),
	Renderer;


Renderer = function () {
	'use strict';

	var $starter = document.querySelector('.starter'),
		$history = document.querySelector('.history'),
		treeBuilder = null,

		keepHistory = false,
		historyStack = [];

	function onItemClick(e) {
		if (e.target.classList.contains('info')) {
			e.preventDefault();
			showInfoPane(e);
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

	function showInfoPane(e) {
		var mod = treeBuilder.getModule(e.target.dataset.id),
			deps = treeBuilder.getAllDependencies(mod),
			infopane = infopaneTemplate({
				name: mod.name,
				deps: _.chain(deps).unique().without(mod.name).sortBy().value()
			}),
			httpRequest = new XMLHttpRequest(),
			infopaneOverlay = document.querySelector('.infopane--overlay'),
			infopanePanel = document.querySelector('.infopane--panel');

		infopanePanel.innerHTML = infopane;
		infopaneOverlay.classList.remove('hide');
		infopanePanel.classList.remove('hide');

		infopanePanel.addEventListener('click', function (ce) {
			ce.preventDefault();
			infopanePanel.innerHTML = '';
			infopaneOverlay.classList.add('hide');
			infopanePanel.classList.add('hide');
		});

		// load items that depend on this module
		httpRequest.onreadystatechange = function () {
			var errorMsg,
				errorJson,
				data,
				html;
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					data = JSON.parse(httpRequest.responseText);
					html = data.map(function (module) {
						return '<li>' + module + '</li>';
					}).join('');
					infopanePanel.querySelector('.items_using_list').innerHTML = html;
					infopanePanel.querySelector('.items_using_count').innerHTML = ' (' + data.length + ' total)';
					infopanePanel.querySelector('.items_using_panel').classList.remove('loading');
				} else {
					try {
						errorJson = JSON.parse(httpRequest.responseText);
						errorMsg = 'Error loading madge API: ' + errorJson.error;
					} catch (e) {
						errorMsg = 'Error loading madge API.';
					}
					document.getElementById('loading-indicator').innerHTML = errorMsg;
				}
			}
		};
		httpRequest.open('GET', '/api/madge/usedby?module=' + mod.name);
		httpRequest.send();
	}

	function renderTree(module) {
		var displayedNodes = [],

			drawNode = function (mod, el) {
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