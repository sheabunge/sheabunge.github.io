(function ($) {
	'use strict';

	/**
	 * The GitHub username
	 * @type {String}
	 */
	var userName = 'bungeshea';

	/**
	 * Put custom repo URLs in this object, keyed by repo name
	 * @type {Object}
	 */
	var repoUrls = {};

	/**
	 * Put custom repo descriptions in this object, keyed by repo name
	 * @type {Object}
	 */
	var repoDescriptions = {};

	/**
	 * Put custom repo homepage URLs in this object, keyed by repo name
	 * @type {Object}
	 */
	var repoHomepages = {};

	/**
	 * Put custom language definitions in this object, keyed by repo name
	 * @type {Object}
	 */
	var repoLanguages = {
		'GitHub-for-Chrome': 'Chrome App',
		'LockCode': 'NXC',
		'nxc-lib': 'NXC',
		'npp-nxc': 'XML',
		'aCmd': 'Bash'
	};

	/**
	 * Repos to exclude from listing
	 * @type {Array}
	 */
	var excludeRepos = [
		'ManageWP-for-Chrome',
		'code-snippets-gist'
	];

	/**
	 * Repos to include in listing that are not by default (eg: forks, empty repos)
	 * @type {Object}
	 */
	var includeRepos = {};

	/**
	 * Return the URL for a repo
	 * @param  {Object} repo The repo to retrieve the URL for
	 * @return {String}      The URL belonging to the repo
	 */
	function getRepoUrl(repo) {
		return repoUrls[repo.name] || repo.html_url;
	}

	/**
	 * Return the description of a repo
	 * @param  {Object} repo The repo to retrieve the description for
	 * @return {String}      The description belonging to the repo
	 */
	function getRepoDesc(repo) {
		return repoDescriptions[repo.name] || repo.description;
	}

	/**
	 * Return the homepage URL of a repo
	 * @param  {Object} repo The repo to retrieve the homepage URL for
	 * @return {String}      The homepage URL belonging to the repo
	 */
	function getRepoHomepage(repo) {
		return repoHomepages[repo.name] || repo.homepage;
	}

	/**
	 * Return the language of a repo
	 * @param  {Object} repo The repo to retrieve the language for
	 * @return {String}      The language the repo is written in
	 */
	function getRepoLang(repo) {
		return repoLanguages[repo.name] || repo.language;
	}

	/**
	 * Turn a raw date into a relative time
	 */
	function prettyDate(rawdate) {
		var date, seconds, formats, i = 0, f;
		date = new Date(rawdate);
		seconds = (new Date() - date) / 1000;
		formats = [
			[60, 'seconds', 1],
			[120, '1 minute ago'],
			[3600, 'minutes', 60],
			[7200, '1 hour ago'],
			[86400, 'hours', 3600],
			[172800, 'Yesterday'],
			[604800, 'days', 86400],
			[1209600, '1 week ago'],
			[2678400, 'weeks', 604800]
		];

		for ( i = 0; i < formats.length; i++ ) {
			f = formats[i];
			if (seconds < f[0]) {
				return f[2] ? Math.floor(seconds / f[2]) + ' ' + f[1] + ' ago' :  f[1];
			}
		}
		return 'a while ago';
	}

	/**
	 * Display a repo's overview (for recent updates section)
	 * @param  {Object} repo The repo to show the overview of
	 */
	function showRepoOverview(repo) {
		var item;
		item  = '<li>';
		item +=     '<span class="name"><a href="' + repo.html_url + '">' + repo.name + '</a></span>';
		item +=     ' &middot; <span class="time"><a href="' + repo.html_url + '/commits">' + prettyDate(repo.pushed_at) + '</a></span>';
		item += '</li>';

		$(item).appendTo('#updated-repos');
	}

	/**
	 * Create an entry for the repo in the grid of repos
	 * @param  {Object} repo The repo to create the entry for
	 */
	function showRepo(repo) {
		var $item = $('<div draggable="true" class="unit-1-3 repo" />');
		var $link = $('<a class="box" href="' + getRepoUrl(repo) + '" />');

		$link.append('<h2 class="repo__name">' + repo.name + '</h2>');

		$link.append('<p class="repo__info">' + repo.watchers + (repo.watchers === 1 ? ' stargazer' : ' stargazers') + ' &middot; ' + getRepoLang(repo) + '</p>');
		$link.append('<p class="repo__desc">' + getRepoDesc(repo) + '</p>');

		var $icons = $('<p class="repo__icons" />');

		if ( getRepoHomepage(repo) )
			$icons.append('<a class="genericon genericon-home" href="' + getRepoHomepage(repo) + '"></a>');

		$icons.append('<a class="genericon genericon-star" href="' + getRepoUrl(repo) + '/stargazers"></a>');
		$icons.append('<a class="genericon genericon-share" href="' + getRepoUrl(repo) + '/network"></a>');

		$icons.appendTo($link);
		$link.appendTo($item);
		$item.appendTo('#repos');
	}

	$.getJSON('https://api.github.com/users/' + userName + '/repos?callback=?', function (result) {
		var repos = result.data;
		$(function () {
			$('#num-repos').text(repos.length);

			/* Convert pushed_at to Date */
			$.each(repos, function (i, repo) {
				repo.pushed_at = new Date(repo.pushed_at);

				var weekHalfLife  = 1.146 * Math.pow(10, -9);

				var pushDelta    = (new Date()) - Date.parse(repo.pushed_at);
				var createdDelta = (new Date()) - Date.parse(repo.created_at);

				var weightForPush = 1;
				var weightForWatchers = 1.314 * Math.pow(10, 7);

				repo.hotness = weightForPush * Math.pow(Math.E, -1 * weekHalfLife * pushDelta);
				repo.hotness += weightForWatchers * repo.watchers / createdDelta;
			});

			/* Sort by hotness */
			repos.sort(function (a, b) {
				if (a.hotness < b.hotness) return 1;
				if (b.hotness < a.hotness) return -1;
				return 0;
			});

			$.each(repos, function (i, repo) {
				if ( $.inArray(repo.name, includeRepos) !== -1 || repo.size !== 0 && ! repo.fork && $.inArray(repo.name, excludeRepos) === -1 )
					showRepo(repo);
			});

			/* Sort by most-recently pushed to */
			repos.sort(function (a, b) {
				if (a.pushed_at < b.pushed_at) return 1;
				if (b.pushed_at < a.pushed_at) return -1;
				return 0;
			});

			$.each(repos.slice(0, 3), function (i, repo) {
				showRepoOverview(repo);
			});
		});
	});

})(jQuery);
