/**
 * Created by TungNguyen on 6/24/2014.
 *
 * Table Users Schema
 deviceId: {type: String, index: true},
 username: {type: String, required: true, default: 'anon'},
 fullname: {type: String, index: true},
 phone: {type: String},
 birthday: {type: Date},
 location: {type: String},
 avatar: {type: String},
 salt: {type: String, required: true },
 hash: {type: String, required: true},
 role: {type: String, required: true, "default": 'user'}

 * --- IF deviceId == username Then user is anonymous
 *  ELSE user registed
 */



'use strict';

angular.module('itaxiManagerApp')
    .controller('managerCustomerCtrl', ['$scope', 'appConfig', '$logger', '$timeout', '$fetchData', 'appDataStore' , '$baseModel', '$upload', '$restful', '$http', '$auth',
        function ($scope, appConfig, $logger, $timeout, $fetchData, appDataStore, $baseModel, $upload, $restful, $http, $auth) {

            $scope.activeForm = 0;

            $scope.back = function () {
                $scope.activeForm = 0;
            }

            var loadUser = function () {
                if (appDataStore.listUsers.size() > 0) {
                    $scope.listUsers = appDataStore.listUsers.all();
                    console.log('load Data User from to appDataStorage !');

                } else {
                    $fetchData.getData('Users', null, null, null, null).then(function (resp) {
                        $scope.listUsers = resp.all();
                        appDataStore.listUsers.addAll(resp.all());
                        console.log('listUsers', $scope.listUsers);
                    }, function (err) {
                        console.log('err : ', err);
                    })
                }
            };
            loadUser();
        }]);
