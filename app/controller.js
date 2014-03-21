(function(window, $, angular, undefined){
	var noSelectText = '選択解除';
	var mrkrdbApp = angular.module('mrkrdbApp',['angularLocalStorage']);
	mrkrdbApp.controller('SearchCtrl', function($scope, $http, $q, storage){
		storage.bind($scope, 'favoritedListString', $scope.favoritedListString);
		storage.bind($scope, 'isTinyMode', $scope.isTinyMode);

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
		$scope.sortOrder = 'ASC';
		$scope.sortKey = '';

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
			$scope.searchResult = $scope.typeSearch();
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
			if(showAsResult){
				$scope.searchMode = 'composition';
				$scope.searchResult = searchBaffer;
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.nameSearch = function(str, showAsResult){
			var searchBaffer = $scope.characters;
			var searchRegexp;
			if(!angular.isString(str)){
				showAsResult = str;
				str = $scope.searchCondition.name;
			}
			if(showAsResult !== true){
				showAsResult = false;
			}
			if(str !== ''){
				searchRegexp = new RegExp(str.toLowerCase(), 'i');
				searchBaffer = searchBaffer.filter(function(item, index){
					if(searchRegexp.test(item.name)){
						return true;
					}
				});
			}
			if(showAsResult){
				$scope.searchMode = 'name';
				$scope.searchResult = searchBaffer;
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.skillTextSearch = function(str, showAsResult){
			var searchBaffer = $scope.characters;
			if(!angular.isString(str)){
				showAsResult = str;
				str = $scope.searchCondition.skill;
			}
			if(showAsResult !== true){
				showAsResult = false;
			}
			if(str !== ''){
				searchRegexp = new RegExp(str.toLowerCase(), 'i');
				searchBaffer = searchBaffer.filter(function(item, index){
					if(searchRegexp.test(item.skillDescription) || searchRegexp.test(item.skillName)){
						return true;
					}
				});
			}
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

			if(showAsResult){
				$scope.searchMode = 'reach';
				$scope.searchResult = searchBaffer;
				return searchBaffer;
			}else{
				return searchBaffer;
			}
		};

		$scope.sortResult = function(key, order, showAsResult){
			var searchBaffer = $scope.searchResult;
			if(showAsResult !== true){
				showAsResult = false;
			}

			searchBaffer = searchBaffer.sort(function(a, b){
				var result = 0;
				if(Number(a[key]) > Number(b[key])){
					result = 1;
				}else if(Number(a[key]) < Number(b[key])){
					result = -1;
				}

				if(order === 'DESC'){
					result = result * -1;
				}else if(order === 'ASC'){
					result = result;
				}
				return result;
			});

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
	});
	
})(this, jQuery, angular);