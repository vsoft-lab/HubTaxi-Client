'use strict';

angular.module('itaxiApp')
    .controller('BookmarkCtrl', ['$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', '$rootScope', '$baseModel', 'appDataStore', '$ionicPopup', '$timeout', '$ionicActionSheet',
        function ($scope, $logger, gmaps, taxi, $fetchData, $auth, $rootScope, $baseModel, appDataStore, $ionicPopup, $timeout, $ionicActionSheet) {

            $logger.info('Bookmark Controller', 'start', true);

            $scope.listBookmarks = [];


            // Get bookmark from AppDataStore, you can see API Document

            $scope.listBookmarks = appDataStore.listBookmark.all();

            if (appDataStore.listBookmark.all().length == 0) {
                $scope.checkBookmarks = true;
            }


            // Delete bookmark, you can see API Document


            $scope.deleteBookmark = function (bookmark) {
                $ionicPopup.confirm({
                    title: 'Xóa Địa chỉ yêu thích',
                    content: 'Bạn có chắc chắn muốn xóa Bookmark này? '
                }).then(function (res) {
                    if (res) {
                        bookmark.destroy(function (err, result) {
                            if (err) {
                                console.log('err : ', err);
                            } else {
                                console.log('OK Delete');
                                appDataStore.listBookmark.remove(bookmark);
                            }
                        });
                    } else {
                    }
                });
            };


            // Create bookmark

            $scope.showAddBookmark = function () {
                $scope.bookmarkItem = {};

                $ionicPopup.show({
                    templateUrl: 'views/utils/addBookmarkModal.html',
                    title: 'Tạo địa chỉ yêu thích',
                    /*subTitle: 'WPA2',*/
                    scope: $scope,
                    buttons: [
                        {
                            text: 'Hủy',
                            onTap: function (e) {
                                return true;
                            }
                        },
                        {
                            text: '<b>Đồng ý</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                if (Object.keys($scope.bookmarkItem).length > 0) {
                                    return $scope.bookmarkItem;
                                } else {
                                    alert('Vui lòng nhập đầy đủ');
                                    return false;
                                }
                            }
                        }
                    ]
                }).then(function (res) {
                    if (angular.isObject(res)) {
                        console.log(res);
                        $scope.addBookmark(res);
                    }
                }, function (err) {
                    console.log('Err:', err);
                }, function (msg) {
                    console.log('message:', msg);
                });
            };


            $scope.selectBookmark = function (data) {
                $ionicActionSheet.show({
                    titleText: 'Địa chỉ yêu thích',
                    buttons: [
                        { text: 'Chọn làm điểm đến' }
                        /* { text: 'Chọn làm điểm đi' },
                         { text: 'Sửa' }*/
                    ],
                    destructiveText: 'Xóa',
                    cancelText: 'Hủy',
                    cancel: function () {
                        console.log('CANCELLED');
                    },
                    buttonClicked: function (index) {
                        console.log(index);
                        if (index == 0) { // make current address as end point
                            console.log(data);
                            /*$scope.destinationInput = */
                            return true;
                        } else if (index == 1) { // make current address as start point


                        } else if (index == 2) { // Edit bookmark

                        }
                    },
                    destructiveButtonClicked: function () { // Remove bookmark action in here
                        $scope.deleteBookmark(data);
                        console.log('DESTRUCT');
                        return true;
                    }
                });
            };

            $scope.addBookmark = function (data) {
                var startPoint = data.bookmarkPoint;

                if (startPoint.length > 1) {

                    var bookmarkItem = {
                        customer: $auth.getAppRegisterInfo().id,
                        bookmarkPoint: startPoint
                    };

                    var saveItem = new $baseModel('Bookmarks', bookmarkItem);
                    saveItem.save(function (err, result) {
                        if (err) {
                            $rootScope.notify('Lưu địa chỉ thất bại!');
                            $logger.info('addBookmarks', 'err', err);
                        } else {
                            /*$scope.listBookmarks.push(result);*/
                            $rootScope.bookmarked = true;
                            $logger.info('addBookmarks', 'resp', result);
                            $rootScope.notify('Lưu địa chỉ thành công!');
                            $scope.quickstylebookmark = 'booksave';
                            console.log('Lưu địa chỉ thành công!');
                            $scope.notBookmark = false;

                            appDataStore.listBookmark.add(bookmarkItem);

                            $scope.listBookmarks = [];

                            $scope.listBookmarks = appDataStore.listBookmark.all();
                        }
                    })
                } else {
                    $rootScope.notify('Vui lòng nhập đầy đủ thông tin');
                }
            };

        }]);