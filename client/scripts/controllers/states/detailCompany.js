/**
 * Created by Minh on 5/12/2014.
 */


angular.module('itaxiApp')
    .controller('companyDetailCtrl', ['$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', '$timeout', '$q', '$ionicPopup', '$restful', '$stateParams', function ($scope, $logger, gmaps, taxi, $fetchData, $auth, $timeout, $q, $ionicPopup, $restful, $stateParams) {

        // get id from URL with ui-router
        var idCompany = $stateParams.id;

        // get Data from TaxiCompany Schema with id Company,you can see API document

        $restful.get({table: 'TaxiCompany', id: idCompany}, function (resp) {
            if (resp) {
                $scope.dataCompany = resp.data;
                console.log('$scope.dataCompany ',$scope.dataCompany);
            } else {
                console.log('err');
            }
        });
    }]);
