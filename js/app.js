(function () {
	'use strict';

	var app = {

		/**
		 * The GitHub username
		 * @type {String}
		 */
		username: 'sheabunge',

		/**
		 * Put custom repo URLs in this object, keyed by repo name
		 * @type {Object}
		 */
		urlOverrides: {},

		/**
		 * Put custom repo descriptions in this object, keyed by repo name
		 * @type {Object}
		 */
		descriptionOverrides: {},

		/**
		 * Put custom repo homepage URLs in this object, keyed by repo name
		 * @type {Object}
		 */
		homepageOverrides: {},

		/**
		 * Put custom language definitions in this object, keyed by repo name
		 * @type {Object}
		 */
		languageOverrides: {
			'LockCode': 'NXC',
			'nxc-lib': 'NXC',
			'npp-nxc': 'XML',
			'aCmd': 'Bash'
		},

		/**
		 * Repos to exclude from listing
		 * @type {Array}
		 */
		excludeRepos: [
			'ManageWP-for-Chrome',
			'GitHub-for-Chrome',
			'code-snippets-gist',
			'css-social-buttons-plugin'
		],

		/**
		 * Repos to include in listing that are not by default (eg: forks, empty repos)
		 * @type {Array}
		 */
		includeRepos: [],

		/**
		 * Return the URL for a repo
		 * @param  {Object} repo The repo to retrieve the URL for
		 * @return {String}      The URL belonging to the repo
		 */
		getRepoUrl: function (repo) {
			return this.urlOverrides[repo.name] || repo.html_url;
		},

		/**
		 * Return the description of a repo
		 * @param  {Object} repo The repo to retrieve the description for
		 * @return {String}      The description belonging to the repo
		 */
		getRepoDesc: function (repo) {
			return this.descriptionOverrides[repo.name] || repo.description;
		},

		/**
		 * Return the homepage URL of a repo
		 * @param  {Object} repo The repo to retrieve the homepage URL for
		 * @return {String}      The homepage URL belonging to the repo
		 */
		getRepoHomepage: function (repo) {
			return this.homepageOverrides[repo.name] || repo.homepage;
		},

		/**
		 * Return the language of a repo
		 * @param  {Object} repo The repo to retrieve the language for
		 * @return {String}      The language the repo is written in
		 */
		getRepoLang: function (repo) {
			return this.languageOverrides[repo.name] || repo.language;
		},

		/**
		 * Turn a raw date into a relative time
		 */
		prettyDate: function (rawdate) {
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
		},

		/**
		 * Create an entry for the repo in the grid of repos
		 * @param  {Object} repo The repo to create the entry for
		 */
		showRepo: function (repo) {
			var item = document.createElement('a');
			item.className = 'box repo';
			item.href = this.getRepoUrl(repo);

			var repoName = document.createElement('h2');
			repoName.className = 'repo-name';
			repoName.textContent = repo.name;
			item.appendChild(repoName);

			var repoInfo = document.createElement('p');
			repoInfo.className = 'repo-info';
			repoInfo.innerHTML = repo.watchers + (repo.watchers === 1 ? ' stargazer' : ' stargazers');
			repoInfo.innerHTML += ' &middot; ' + this.getRepoLang(repo);
			item.appendChild(repoInfo);

			var repoDesc = document.createElement('p');
			repoDesc.className = 'repo-desc';
			repoDesc.textContent = this.getRepoDesc(repo);
			item.appendChild(repoDesc);

			var icons = document.createElement('p');
			icons.className = 'repo-icons';
			icons.innerHTML = '';

			if (this.getRepoHomepage(repo)) {
				icons.innerHTML = '<a class="genericon genericon-home" href="' + this.getRepoHomepage(repo) + '"></a>';
			}
			icons.innerHTML += '<a class="genericon genericon-star" href="' + this.getRepoUrl(repo) + '/stargazers"></a>';
			icons.innerHTML += '<a class="genericon genericon-sitemap" href="' + this.getRepoUrl(repo) + '/network"></a>';
			item.appendChild(icons);

			document.querySelector('.grid').appendChild(item);
		},

		/**
		 * Display a list of repositories
		 * @param {Array} The list of repositories
		 */
		displayRepos: function (repos) {
			document.getElementById('num-repos').textContent = repos.length;

			repos.forEach(function(repo, i) {
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

			var that = this;

			repos.forEach(function(repo, i) {
				if (that.includeRepos.indexOf(repo.name) !== -1 || repo.size !== 0 && ! repo.fork && that.excludeRepos.indexOf(repo.name) === -1) {
					that.showRepo(repo);
				}
			});
		},

		fetchRepos: function (onload) {
			var requesturl = 'https://api.github.com/users/' + this.username + '/repos';
			var request = new XMLHttpRequest();
			request.open('GET', requesturl, true);
			request.onload = onload;
			request.send();
		},

		fetchSaveDisplayRepos: function () {
			var that = this;
			this.fetchRepos(function () {
				if (this.status >= 200 && this.status < 400) {
					window.localStorage.repos = this.response;
					window.localStorage.saveTime = Date.now();
					that.displayRepos(JSON.parse(this.response));
				}
			});
		}
	};

	if (window.localStorage.repos !== 'undefined') {
		var expiry = 30*60*1000; // 30 mins

		if (window.localStorage.saveTime + expiry > Date.now()) {
			window.localStorage.repos = 'undefined';
			window.localStorage.saveTime = 'undefined';
			app.fetchSaveDisplayRepos();
		} else {
			var repos = JSON.parse(window.localStorage.repos);
			app.displayRepos(repos);
		}
	} else {
		app.fetchSaveDisplayRepos();
	}

}());
