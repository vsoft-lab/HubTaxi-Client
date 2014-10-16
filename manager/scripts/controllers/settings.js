/**
 * Created by taipham.it on 6/25/2014.
 */

'use strict';

angular.module('itaxiManagerApp')
    .controller('settingCtrl', ['$rootScope','$scope', '$logger', '$timeout', '$fetchData', 'appDataStore' , '$baseModel', '$restful', '$http', 'ngProgress',
        function ($rootScope,$scope, $logger, $timeout, $fetchData, appDataStore, $baseModel, $restful, $http, ngProgress) {
            $scope.enabale = true;

            $scope.changeLogo = function () {
                //var cLogo = document.getElementById("changeLogo");
                var cLogo = $('#changeLogo');
                cLogo.click();
            };

            var readURL = function (input) {

                if (input.files && input.files[0]) {
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        $('#img-logo').attr('src', e.target.result);
                    };

                    reader.readAsDataURL(input.files[0]);
                }
            };

            $("#changeLogo").change(function () {
                readURL(this);
            });

            $scope.change = function () {
                $scope.enabale = !$scope.enabale;
            };

            $scope.cancelEdit = function () {
                $scope.enabale = true;
            };

            var _id = '543f99dcc55e21ab3f000004';

            var loadTaxiCompany = function () {

                $restful.get({table: 'TaxiCompany', id: _id}, function (resp) {
                    if (resp.success) {
                        $scope.data = resp.data;
                        console.log('Data :', resp.data);

                    } else {
                        console.log(resp);
                    }
                });
            };


            $scope.update = function (item) {

                var itemSave = new $baseModel('TaxiCompany', item);

                itemSave.save(function (err, result) {
                    if (!err) {
                        toastr.info('Cập nhật Hãng thành công!');
                        $scope.enabale = true;
                    } else {
                        toastr.error('Lỗi cập nhật thông tin Hãng');
                    }
                });
            };

            loadTaxiCompany();


        }]);
