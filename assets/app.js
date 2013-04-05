(function ($, undefined) {

	var userName = 'bungeshea';

	// Put custom repo URL's in this object, keyed by repo name.
	var repoUrls = {};

	// Put custom repo descriptions in this object, keyed by repo name.
	var repoDescriptions = {};

	// Repos to exclude from listing
	var excludeRepos = [
		"ManageWP-for-Chrome"
	];

	// Return the repo url
	function getRepoUrl(repo) {
		return repoUrls[repo.name] || repo.html_url;
	}

	// Return the repo description
	function getRepoDesc(repo) {
		return repoDescriptions[repo.name] || repo.description;
	}

	// Display a repo's overview (for recent updates section)
	function showRepoOverview(repo) {
		var item;
		item  = '<li>';
		item +=     '<span class="name"><a href="' + repo.html_url + '">' + repo.name + '</a></span>';
		item +=     ' &middot; <span class="time"><a href="' + repo.html_url + '/commits">' + prettyDate(repo.pushed_at) + '</a></span>';
		item += '</li>';

		$(item).appendTo("#updated-repos");
	}

	// Create an entry for the repo in the grid of org repos
	function showRepo(repo) {
		var $item = $('<div class="unit-1-3 repo" />');
		var $link = $('<a class="box" href="' + getRepoUrl(repo) + '" />');

		$link.append('<h2 class="repo__name">' + repo.name + '</h2>');
		$link.append('<p class="repo__info">' + repo.watchers + ' stargazers &middot; ' + repo.language + '</p>');
		$link.append('<p class="repo__desc">' + getRepoDesc(repo) + '</p>');

		$link.append('<p class="repo__time"><a href="' + repo.html_url + '/commits">Last updated <time datetime="' + repo.pushed_at + '">' + prettyDate(repo.pushed_at) + '</time></a></span>');

		$link.appendTo($item);
		$item.appendTo('#repos');
	}

	$.getJSON('https://api.github.com/users/' + userName + '/repos?callback=?', function (result) {
		var repos = result.data;
		$(function () {
			$('#num-repos').text(repos.length);

			// Convert pushed_at to Date.
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

			// Sort by hotness.
			repos.sort(function (a, b) {
				if (a.hotness < b.hotness) return 1;
				if (b.hotness < a.hotness) return -1;
				return 0;
			});

			$.each(repos, function (i, repo) {
				if ( ! repo.fork && $.inArray(repo.name, excludeRepos) == -1 )
					showRepo(repo);
			});

			// Sort by most-recently pushed to.
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

	// Relative times
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

		while (f = formats[i ++]) {
			if (seconds < f[0]) {
				return f[2] ? Math.floor(seconds / f[2]) + ' ' + f[1] + ' ago' :  f[1];
			}
		}
		return 'a while ago';
	}

})(jQuery);