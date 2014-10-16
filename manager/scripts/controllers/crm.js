'use strict';

angular.module('itaxiManagerApp')
    .controller('crmCtrl', ['$scope', '$modal', function ($scope, $modal) {

        $scope.open = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });
        };


        $scope.messageGroup = [
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            },
            {
                name: 'Hoàng Văn Lợi',
                title: 'Tiêu đề của bức thư',
                detail: 'Nội dung trong bức thư dài nhất mà tôi từng thấy',
                time: '21:30'
            }
        ];
        var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

            $scope.items = items;


            $scope.ok = function () {
                $modalInstance.close($scope.selected.item);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };
    }]);
