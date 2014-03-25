(function(window, $, angular, undefined){
	var noSelectText = '選択解除';
	angular
	.module('mrkrdbApp',['angularLocalStorage'])
	.controller('SearchCtrl', ['$scope', '$http', '$q', 'storage', '$sce', function($scope, $http, $q, storage, $sce){
		storage.bind($scope, 'favoritedListString', $scope.favoritedListString);
		storage.bind($scope, 'isTinyMode', $scope.isTinyMode);
		storage.bind($scope, 'isSearchSortBoxShow', $scope.isSearchSortBoxShow);
		//storage.bind($scope, 'isSearchFavoritedBoxShow', $scope.isSearchFavoritedBoxShow);
		storage.bind($scope, 'isSearchNumBoxShow', $scope.isSearchNumBoxShow);
		storage.bind($scope, 'isSearchReachBoxShow', $scope.isSearchReachBoxShow);
		storage.bind($scope, 'isSearchNameBoxShow', $scope.isSearchNameBoxShow);
		storage.bind($scope, 'isSearchSkillBoxShow', $scope.isSearchSkillBoxShow);
		storage.bind($scope, 'isSearchTypeBoxShow', $scope.isSearchTypeBoxShow);
		storage.bind($scope, 'sortOrder', $scope.sortOrder);
		storage.bind($scope, 'sortKey', $scope.sortKey);

		$scope.searchResult = [];
		$scope.searchCondition = {
			selectedTypeList: [],
			selectedTypes:{},
			composition: noSelectText,
			mode: 'and',
			name: '',
			skill: '',
			numSearch:{
				min: null,
				max: null,
				key: 'cost'
			},
			target: '単体',
			reach: '物理'
		};
		$scope.sortOrder = $scope.sortOrder || 'ASC';
		$scope.sortKey = $scope.sortKey || 'tekito';

		if($scope.favoritedListString !== ''){
			$scope.favoritedList = $.parseJSON($scope.favoritedListString);
		}else{
			$scope.favoritedList = [];
		}

		$scope.wikiUrl = 'http://marikore.wiki.fc2.com/wiki/';

		$scope.searchMode = '';

		$q
			.all([
				$http.get('app/data/characters.json'),
				$http.get('app/data/gamedata.json')
			])
			.then(function(res){
				$scope.characters = res[0].data;
				$scope.gamedata = res[1].data;
				$scope.searchResult = $scope.characters;
			});

		$scope.toggleTypeCheckbox = function(type){
			var index = $scope.searchCondition.selectedTypeList.indexOf(type);
			if(index !== -1){
				$scope.searchCondition.selectedTypeList.splice(index, 1);
			}else{
				$scope.searchCondition.selectedTypeList.push(type);
			}
			$scope.typeSearch(true);
		};

		$scope.typeSearch = function(showAsResult){
			var mode = $scope.searchCondition.mode;
			var types = $scope.searchCondition.selectedTypeList;
			var i = 0, typesLength = types.length;
			var result = [];
			var searchBaffer = $scope.characters;
			if(showAsResult !== true){
				showAsResult = false;
			}
			if(typesLength > 0){
				if(mode === 'and'){
					angular.forEach(types, function(type){
						searchBaffer = searchBaffer.filter(function(item, index){
							if($.inArray(type, item.types) !== -1){
								return true;
							}
						});
					});
				}else if(mode === 'or'){
					angular.forEach(types, function(type, index){
						result = result.concat(searchBaffer.filter(function(item, index){
							if($.inArray(type, item.types) !== -1){
								return true;
							}
						}));
					});
					searchBaffer = uniqueItemList(result);
				}
			}

			searchBaffer = $scope.sortResult(false, searchBaffer);

			if(showAsResult){
				$scope.searchMode = 'type';
				$scope.searchResult = searchBaffer;
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.compositionSearch = function(showAsResult){
			var composition = $scope.searchCondition.composition;
			var searchBaffer = $scope.characters;
			if(showAsResult !== true){
				showAsResult = false;
			}
			if(composition !== noSelectText){
				searchBaffer = searchBaffer.filter(function(item, index){
					var i = 0, length = item.compositionList.length;
					for(;i < length; i += 1){
						if(
							$.inArray(composition, item.compositionList[i].with) !== -1 ||
							item.compositionList[i].base === composition ||
							item.compositionList[i].to === composition
						){
							return true;
						}
					}
				});
			}

			searchBaffer = $scope.sortResult(false, searchBaffer);

			if(showAsResult){
				$scope.searchMode = 'composition';
				$scope.searchResult = searchBaffer;
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.nameSearch = function(showAsResult){
			var searchBaffer = $scope.characters;
			var searchRegexp;
			var str = $scope.searchCondition.name;
			if(showAsResult !== true){
				showAsResult = false;
			}
			if(angular.isString(str) && str !== ''){
				searchRegexp = new RegExp(str.toLowerCase(), 'i');
				searchBaffer = searchBaffer.filter(function(item, index){
					if(searchRegexp.test(item.name)){
						return true;
					}
				});
			}

			searchBaffer = $scope.sortResult(false, searchBaffer);

			if(showAsResult){
				$scope.searchMode = 'name';
				$scope.searchResult = searchBaffer;
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.skillTextSearch = function(showAsResult){
			var searchBaffer = $scope.characters;
			var searchRegexp;
			var str = $scope.searchCondition.skill;
			if(showAsResult !== true){
				showAsResult = false;
			}
			if(angular.isString(str) && str !== ''){
				searchRegexp = new RegExp(str.toLowerCase(), 'i');
				searchBaffer = searchBaffer.filter(function(item, index){
					if(searchRegexp.test(item.skillDescription) || searchRegexp.test(item.skillName)){
						return true;
					}
				});
			}

			searchBaffer = $scope.sortResult(false, searchBaffer);

			if(showAsResult){
				$scope.searchMode = 'skill';
				$scope.searchResult = searchBaffer;
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.numSearch = function(showAsResult){
			var min = $scope.searchCondition.numSearch.min;
			var max = $scope.searchCondition.numSearch.max;
			var key = $scope.searchCondition.numSearch.key;
			var searchBaffer = $scope.characters;
			if(showAsResult !== true){
				showAsResult = false;
			}

			if(min === null || !angular.isNumber(min)){
				min = -Infinity;
			}

			if(max === null || !angular.isNumber(max)){
				max = Infinity;
			}

			searchBaffer = searchBaffer.filter(function(item){
				if(min <= item[key] && item[key] <= max){
					return true;
				}
			});

			searchBaffer = $scope.sortResult(false, searchBaffer);

			if(showAsResult){
				$scope.searchMode = 'num';
				$scope.searchResult = searchBaffer;

				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.searchReach = function(showAsResult){
			var searchBaffer = [];
			var reach = $scope.searchCondition.reach;
			var target = $scope.searchCondition.target;
			if(showAsResult !== true){
				showAsResult = false;
			}

			searchBaffer = $scope.characters.filter(function(item) {
				if(item.reach === reach && item.target === target){
					return true;
				}
			});

			searchBaffer = $scope.sortResult(false, searchBaffer);

			if(showAsResult){
				$scope.searchMode = 'reach';
				$scope.searchResult = searchBaffer;
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.sortResult = function(showAsResult, itemList){
			var searchBaffer = itemList || $scope.searchResult;
			var key = $scope.sortKey;
			var order = $scope.sortOrder;
			var pow = (order === 'DESC') ? -1 : 1;
			var result = 0;
			if(showAsResult !== true){
				showAsResult = false;
			}

			if(key !== 'tekito' && searchBaffer.length){
				searchBaffer = searchBaffer.sort(function(a, b){
					return (parseFloat(a[key]) > parseFloat(b[key]) ? 1 : parseFloat(a[key]) < parseFloat(b[key]) ? -1 : 0) * pow;
				});
			}

			if(showAsResult){
				$scope.searchResult = searchBaffer;
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.toggleItemFavorite = function(name){
			var index = $scope.favoritedList.indexOf(name);
			if(index !== -1){
				$scope.favoritedList.splice(index, 1);
			}else{
				$scope.favoritedList.push(name);
			}

			$scope.favoritedListString = JSON.stringify($scope.favoritedList);
		};

		$scope.isFavorited = function(name){
			return $scope.favoritedList.indexOf(name) !== -1;
		};

		$scope.showFavorite = function(){
			var searchBaffer = [];
			angular.forEach($scope.favoritedList, function(name){
				searchBaffer = searchBaffer.concat($scope.characters.filter(function(item, index){
					if(name === item.name){
						return true;
					}
				}));
			});
			$scope.searchMode = 'favorite';
			searchBaffer = uniqueItemList(searchBaffer);
			searchBaffer = $scope.sortResult(false, searchBaffer);
			$scope.searchResult = searchBaffer;
		};

		$scope.isEventFinished = function(placeName){
			if(!angular.isUndefined($scope.gamedata.eventList[placeName])){
				return $scope.gamedata.eventList[placeName].isFinished;
			}else{
				return false;
			}
		};

		$scope.toggleTinyMode = function(){
			if($scope.isTinyMode){
				$scope.isTinyMode = false;
			}else{
				$scope.isTinyMode = true;
			}
		};

		$scope.toggleSearchBox = function(valueName){
			$scope[valueName] = !$scope[valueName];
		};

		function uniqueItemList(itemList){
			var results = [];
			var nameList = [];
			angular.forEach(itemList, function(item, index){
				if(nameList.indexOf(item.name) === -1){
					nameList.push(item.name);
					results.push(item);
				}
			});
			return results;
			
		}
	}]);
})(this, jQuery, angular);