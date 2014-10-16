'use strict';


// không được sử dụng

angular.module('itaxiApp')
    .directive('noScroll', function ($document) {

        return {
            restrict: 'A',
            link: function ($scope, $element, $attr) {

                $document.on('touchmove', function (e) {
                    e.preventDefault();
                });
            }
        }
    })
    .controller('CardCtrl', ['$scope', '$ionicSwipeCardDelegate', function ($scope, $ionicSwipeCardDelegate) {
        $scope.goAway = function () {
            var card = $ionicSwipeCardDelegate.getSwipebleCard($scope);
            card.swipe();
        };
    }])
    .controller('SupportCtrl', ['$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', '$ionicSwipeCardDelegate', function ($scope, $logger, gmaps, taxi, $fetchData, $auth, $ionicSwipeCardDelegate) {
        $logger.info('Support Controller', 'start', true);

        var cardTypes = [
            { title: 'Swipe down to clear the card', image: '../../images/pic.png' },
            { title: 'Where is this?', image: '../../images/pic.png' },
            { title: 'What kind of grass is this?', image: '../../images/pic2.png' },
            { title: 'What beach is this?', image: '../../images/pic3.png' },
            { title: 'What kind of clouds are these?', image: '../../images/pic4.png' }
        ];


        $scope.cards = Array.prototype.slice.call(cardTypes, 0, 0);
        $scope.cardSwiped = function (index) {
            $scope.addCard();
        };

        $scope.cardDestroyed = function (index) {
            $scope.cards.splice(index, 1);
        };

        $scope.addCard = function () {
            var newCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
            newCard.id = Math.random();
            $scope.cards.push(angular.extend({}, newCard));
        }

    }])
;