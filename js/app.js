var mainCtrl = function mainCtrl($scope, $http) {

	$scope.loading	= true;
	$scope.error	= false;
	$scope.sharing	= false;
	$scope.share	= false;

	$scope.title		= 'Chargement en cours';
	$scope.url			= 'http://videos-mdr.com/';
	$scope.thumb		= 'img/replace.gif';
	$scope.description	= '';
	$scope.author		= '';
	$scope.website		= '';

	$scope.testLink = function testLink(tab) {

		var webPattern = new RegExp(/^http/);

		if(webPattern.test(tab.url)) {

			var youtubePattern = new RegExp(/^(http|https):\/\/(?:youtu\.be\/|(?:[a-z]{2,3}\.)?youtube\.com\/watch(?:\?|#\!)v=)([\w-]{11}).*/);

			if(youtubePattern.test(tab.url)) {

				var videoId = tab.url.split(/.*v=|.*v\//);

				if(videoId.length == 2) {

					videoId = videoId[1].split(/&/)[0];

					$.ajax('https://gdata.youtube.com/feeds/api/videos/' + videoId, {
						type: 'get',
						dataType: 'json',
						data: {
							v: 2,
							alt: 'json'
						}
					})

					.success(function(data, status) {

						$scope.title		= data.entry.title.$t;
						$scope.url			= data.entry.media$group.media$player.url;
						$scope.thumb		= data.entry.media$group.media$thumbnail[1].url;
						$scope.description	= data.entry.media$group.media$description.$t;
						$scope.author		= data.entry.author[0].name.$t;
						$scope.website		= 'YouTube';
						$scope.loading		= false;

						$scope.$digest();
					})

					.error(function(data, status) {
						$scope.error = true;
						$scope.$digest();
					});
				}
			}
			else {
				
				$scope.title		= tab.title;
				$scope.url			= tab.url;
				$scope.thumb		= chrome.extension.getURL('img/replace.gif');
				$scope.description	= '';
				$scope.author		= '';
				$scope.website		= '';
				$scope.loading		= false;

				$scope.$digest();
			}
		}
		else {
			$scope.loading = false;
			$scope.error = true;
			$scope.$digest();
		}
	};

	$scope.openLink = function openLink(url) {
		chrome.tabs.create({
			url: url,
			active: true
		});
	};

	$scope.share = function share() {

		$scope.sharing = true;

		$.ajax('http://videos-mdr.com/postit.php', {
			type: 'post',
			data: {
				title:			$scope.title,
				url:			$scope.url,
				thumb:			$scope.thumb.search(/^chrome/) >= 0 ? '' : $scope.thumb,
				description:	$scope.description,
				author:			$scope.author,
				website:		$scope.website
			}
		})

		.success(function(data, status) {

			$scope.sharing = false;
			$scope.share = true;
			$scope.$digest();
		})

		.error(function(data, status) {
			$scope.sharing = false;
			$scope.error = true;
			$scope.$digest();
		});
	};

	chrome.tabs.getSelected(function(tab) {
		$scope.testLink(tab);
	});
};

mainCtrl.$inject = ['$scope', '$http'];
