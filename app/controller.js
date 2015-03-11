(function(window, $, angular, undefined){
	var noSelectText = '選択解除';
	var changeItemsPerPageTimer;
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
		storage.bind($scope, 'isSearchFilterBoxShow', $scope.isSearchFilterBoxShow);
		storage.bind($scope, 'sortOrder', $scope.sortOrder);
		storage.bind($scope, 'sortKey', $scope.sortKey);
		storage.bind($scope, 'itemsPerPage', $scope.itemsPerPage);

		$scope.searchResult = [];
		$scope.currentPageIndex = 0;
		$scope.itemsPerPage = $scope.itemsPerPage || 114514;
		$scope._itemsPerPage = $scope.itemsPerPage;
		$scope.resultPageMinIndex = 0;
		$scope.resultPageMaxIndex = $scope.resultPageMinIndex + $scope.itemsPerPage;
		$scope.resultPages = [];

		$scope.searchResultView = [];
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
		$scope.filter = 'nofilter';

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
				$scope.showResult();
			});

		$scope.$watch('searchResult', $scope.showResult);
		$scope.$watch('itemsPerPage', $scope.showResult);
		$scope.$watch('resultPageMaxIndex', $scope.showResult);
		$scope.$watch('currentPageIndex', $scope.showResult);

		$scope.showResult = function(searchBaffer){
			searchBaffer =  searchBaffer || $scope.searchResult;
			getResultPages();
			getResultPageMaxIndex();
			searchBaffer = sortResult(filterRresult(searchBaffer));
			$scope.searchResultLength = searchBaffer.length;
			if($scope.itemsPerPage > 1){
				$scope.searchResultView = [];
				var min = $scope.itemsPerPage * $scope.currentPageIndex;
				var max = $scope.itemsPerPage * $scope.currentPageIndex + $scope.itemsPerPage;
				if(min !== max){
					if(max > searchResult.length){
						max = searchResult.length;
					}
					$scope.searchResultView = searchBaffer.slice(min, max);
				}
			}else{
				$scope.searchResultView = searchBaffer;
			}
		};

		function getResultPages(){
			var i = 0;
			$scope.resultPages = [];
			for(;i < $scope.resultPageMaxIndex; i += 1){
				$scope.resultPages[i] = i + 1;
			}
		}

		function getResultPageMaxIndex(){
			$scope.resultPageMaxIndex = Math.ceil($scope.searchResult.length / $scope.itemsPerPage);
		}

		$scope.changeFilter = function(){
			$scope.showResult();
		};

		function filterRresult(searchBaffer){
			searchBaffer = searchBaffer || $scope.searchResult;
			if($scope.filter === 'nofilter'){
				return searchBaffer;
			}else{
				var filterFunction;
				switch($scope.filter){
					case 'favorite':
						filterFunction = function(item){
							return $scope.isFavorited(item.name);
						};
					break;
					case 'cookieonly':
						filterFunction = function(item){
							return isCookieOnly(item.name);
						};
					break;
					case 'zun':
						filterFunction = function(item){
							return isZun(item.name);
						};
					break;
					case 'noskill':
						filterFunction = function(item){
							return !item.skillName;
						};
					break;
					default :
						filterFunction = function(){
							return true;
						};
					break;
				}
				return searchBaffer.filter(filterFunction);
			}
		}

		function sortResult(searchBaffer){
			searchBaffer = searchBaffer || $scope.searchResult;
			var key = $scope.sortKey;
			var order = $scope.sortOrder;
			var pow = (order === 'DESC') ? -1 : 1;
			var result = 0;

			if(key !== 'tekito' && searchBaffer.length){
				searchBaffer = searchBaffer.sort(function(a, b){
					return (parseFloat(a[key]) > parseFloat(b[key]) ? 1 : parseFloat(a[key]) < parseFloat(b[key]) ? -1 : 0) * pow;
				});
			}

			return searchBaffer;
		}

		function isCookieOnly(name){
			return $.inArray(name, $scope.gamedata.cookieOnlyList) !== -1;
		}

		function isZun(name){
			return $.inArray(name, $scope.gamedata.zunList) !== -1;
		}

		$scope.resetSearch = function(){
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
			$scope.sortOrder = 'ASC';
			$scope.sortKey = 'tekito';
			$scope.filter = 'nofilter';
			$scope.searchResult = $scope.characters;
			$scope.showResult($scope.characters);
		};

		$scope.changeItemsPerPage = function(){
			if($scope.itemsPerPage !== $scope._itemsPerPage){
				$scope.itemsPerPage = parseInt($scope._itemsPerPage, 10) || 1;
				$scope.currentPageIndex = 0;
				console.log($scope.itemsPerPage);
			}
		};

		$scope.changeResultPageTo = function(pageIndex){
			$scope.currentPageIndex = pageIndex;
		};

		$scope.changeResultPageNext = function(){
			var index = $scope.currentPageIndex + 1;
			if(index < $scope.resultPageMaxIndex){
				$scope.changeResultPageTo(index);
			}
		};

		$scope.changeResultPagePrev = function(){
			var index = $scope.currentPageIndex - 1;
			if(index >= 0){
				$scope.changeResultPageTo(index);
			}
		};

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

			finalizeSearchResult('type', searchBaffer, showAsResult);
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

			finalizeSearchResult('composition', searchBaffer, showAsResult);
		};

		$scope.search = function(searchMode){
			$scope.searchMode = searchMode;
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

			finalizeSearchResult('name', searchBaffer, showAsResult);
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

			finalizeSearchResult('skill', searchBaffer, showAsResult);
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

			finalizeSearchResult('num', searchBaffer, showAsResult);
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

			finalizeSearchResult('reach', searchBaffer, showAsResult);
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
			$scope.filter = 'favorite';
			finalizeSearchResult('favorite', $scope.characters);
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

		function finalizeSearchResult(searchMode, searchBaffer, showAsResult){
			showAsResult = showAsResult || true;
			if(showAsResult){
				$scope.searchMode = searchMode;
				$scope.currentPageIndex = 0;
				//$scope.showResult(searchBaffer);
				$scope.searchResult = searchBaffer;
				$scope.showResult();
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		}

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