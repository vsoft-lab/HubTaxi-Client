'use strict';

angular.module('itaxiApp')
    .controller('MessageCtrl', ['$rootScope', '$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', 'appDataStore', '$socketIo', 'appConfig', '$ionicModal', '$ionicLoading',
        function ($rootScope, $scope, $logger, gmaps, taxi, $fetchData, $auth, appDataStore, $socketIo, appConfig, $ionicModal, $ionicLoading) {
            $logger.moduleName = 'Message Controller';
            $logger.info('Message Controller', 'start', true);

            $scope.messageDetail = {};

            $scope.listMessage = [];

            $scope.systemMessageStatus = false;
            $scope.taxiCompanyStatus = false;

            $scope.systemUnread = 0;
            $scope.companyUnread = 0;

            //filter message for read and unread when click

            $scope.filterMessage = function (filter) {
                if (filter == 0) { // System Messages
                    $scope.systemMessageStatus = !$scope.systemMessageStatus;
                    $scope.taxiCompanyStatus = false;

                    if ($scope.systemMessageStatus) {

                        var data = [];
                        angular.forEach(appDataStore.messageData.all(), function (v, k) {
                            if (v.message.isSystem == 1) {
                                data.push(v);

                            }
                        });
                        $scope.listMessage = data;

                    } else {
                        $scope.listMessage = appDataStore.messageData.all();
                    }
                } else {
                    $scope.taxiCompanyStatus = !$scope.taxiCompanyStatus;
                    $scope.systemMessageStatus = false;
                    if ($scope.taxiCompanyStatus) {
                        var data = [];
                        angular.forEach(appDataStore.messageData.all(), function (v, k) {
                            if (v.message.isSystem == 0) {
                                data.push(v);
                            }
                        });
                        $scope.listMessage = data;
                    } else {
                        $scope.listMessage = appDataStore.messageData.all();
                    }
                }
            };

            //load messages from Schema MessageRelation

            var loadMessage = function () {
                $rootScope.loadingIndicator = $ionicLoading.show({
                    template: 'Đang tải dữ liệu...',
                    noBackdrop : true
                });

                // filters according attributes

                var filter = [
                    {
                        property: 'user',
                        value: $auth.getAppRegisterInfo().id,
                        type: 'string',
                        comparison: 'eq'
                    },
                    {
                        property: 'deleted',
                        value: 0,
                        type: 'number',
                        comparison: 'eq'
                    }
                ];

                // API document

                $fetchData.getData('MessageRelation', null, null, filter).then(function (resp) {

                    appDataStore.messageData = resp;

                    $scope.listMessage = resp.all();

                    angular.forEach(appDataStore.messageData.all(), function (v, k) {
                        if (v.message.isSystem == 1 && v.readed == 0) {
                            $scope.systemUnread += 1;
                        }

                        if (v.message.isSystem == 0 && v.readed == 0) {
                            $scope.companyUnread += 1;
                        }
                    });

                    $logger.info('loadMessage', 'success', true);
                    $ionicLoading.hide();
                })
            };


            $scope.modal = null;

            // delete messages for id

            $scope.deleteMessage = function (item) {
                item.deleted = 1;
                item.save(function (err, result) {
                    if (err) {
                        console.log('err : ', err);
                    } else {
                        $rootScope.notify('Xóa tin nhắn thành công!', 1000);
                        appDataStore.messageData.remove(item);
                    }
                });
            };

            $ionicModal.fromTemplateUrl('modal.html', function (modal) {
                $scope.modal = modal;
            }, {
                animation: 'slide-in-up',
                focusFirstInput: true,
                scope: $scope,
                showBackdrop: false
            });

            // open modal detail message

            $scope.openModal = function (message) {
                /*$logger.info('openModal', message);

                 $scope.messageDetail = message;
                 $scope.modal.show();*/
            };

            loadMessage();
        }]);