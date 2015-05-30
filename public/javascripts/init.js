/* global XMLHttpRequest, Renderer, document */
var loadApp, data = {};
loadApp = function () {
	'use strict';
	var httpRequest = new XMLHttpRequest(),
		renderer = new Renderer(),
		$nameInput = document.getElementById('moduleName');

	$nameInput.focus();

	// show history
	renderer.setupHistory(true);
	document.getElementById('moduleForm').addEventListener('submit', function (e) {
		e.preventDefault();
		renderer.render($nameInput.value);
	});
	document.querySelector('.refresh_tree').addEventListener('click', function (e) {
		e.preventDefault();
		document.getElementById('moduleForm').classList.add('loading');
		document.getElementById('loading-indicator').classList.remove('hide');

		data = {};
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					document.getElementById('moduleForm').classList.remove('loading');
					document.getElementById('loading-indicator').classList.add('hide');
					data = JSON.parse(xhr.responseText);
				} else {
					var errorMsg,
						errorJson;
					try {
						errorJson = JSON.parse(xhr.responseText);
						errorMsg = 'Error loading madge API: ' + errorJson.error;
					} catch (e) {
						errorMsg = 'Error loading madge API.';
					}
					document.getElementById('loading-indicator').innerHTML = errorMsg;
				}
			}
		};
		xhr.open('GET', '/api/madge/refresh');
		xhr.send();
		renderer.render($nameInput.value);
	});

	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				document.getElementById('moduleForm').classList.remove('loading');
				document.getElementById('loading-indicator').classList.add('hide');
				data = JSON.parse(httpRequest.responseText);
			} else {
				var errorMsg,
					errorJson;
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
	httpRequest.open('GET', '/api/madge');
	httpRequest.send();
};