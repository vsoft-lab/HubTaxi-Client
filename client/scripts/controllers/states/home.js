'use strict';

angular.module('itaxiApp')
    .controller('HomeCtrl', ['$rootScope', '$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', 'appConfig', '$timeout', '$state', '$restful', 'appDataStore', '$baseModel', '$ionicModal', '$ionicPopup', '$ionicSlideBoxDelegate', 'routes', '$ionicSideMenuDelegate', '$ionicLoading', '$socketIo', '$ionicActionSheet',

        function ($rootScope, $scope, $logger, gmaps, taxi, $fetchData, $auth, appConfig, $timeout, $state, $restful, appDataStore, $baseModel, $ionicModal, $ionicPopup, $ionicSlideBoxDelegate, routes, $ionicSideMenuDelegate, $ionicLoading, $socketIo, $ionicActionSheet) {

            $logger.moduleName = 'Home Controller';
            $logger.info('Home Controller', 'start', true);

            var listTaxi = [],
                destroyRouteFlag = true;

            $scope.seatNum4 = true;  // Seat number default is 4
            $scope.seatNum7 = false;
            $scope.seatChecked = false;

            $scope.phoneNumber = {};
            $rootScope.showPlace = [];
            $scope.stylebookmark = '';
            $scope.stylebookmark1 = '';

            angular.element(document.querySelector('.title')).css("display", "none");

            $rootScope.cssResult = '';


            $scope.settingsList = [
                { text: "hide-footer active", checked: false },
                { text: "custom class my-footer active", checked: false }
            ];


            $scope.checkSeat = function (num) { // Button select seat number
                $scope.seatChecked = true;
                if (num == 1) {
                    $scope.seatNum7 = false;
                    $scope.seatNum4 = true;

                } else {
                    $scope.seatNum4 = false;
                    $scope.seatNum7 = true;
                }
            };


            $scope.refreshTaxi = function () {
                gmaps.findTaxi(4);
            };


            $scope.goToTaxi = function () { // Run when click to taxi in map , map will set center is position of taxi
                if (taxi.getDirectionInfo()) {
                    angular.forEach(gmaps.listMarkerTaxi, function (v, k) {
                        if (v.options.carLic == taxi.getDirectionInfo()[0].driver.username) {
                            gmaps.map.panTo(v.getLatLng());
                        }
                    })
                }
            };


            $scope.toggelPinPosition = function () {
                $logger.info('toggelPinPosition', 'status', $rootScope.status.pinPosition);
            };


            var callTaxi = function () { // Run when user click to "Goi taxi"
                $rootScope.hideButtonCall = false;
                $rootScope.status.callTaxiProcess = true;

                $scope.notDriver = false;
                var filter = null;

                if (!$scope.seatChecked) { // Check seat number
                    filter = 0;
                } else {
                    filter = ($scope.seatNum4) ? 4 : 7;
                }
                var location;
                if (document.getElementById('originInput') == null) {
                    location = $rootScope.startPoint;
                } else {
                    location = document.getElementById('originInput').value
                }
               // console.log('document.getElementById().value :', document.getElementById('originInput'));

                var callTaxiData = {
                    customerDeviceId: appConfig.deviceId,
                    roomID: taxi.getCurrentRoomID(),
                    phoneNumber: $auth.getPhoneNumber(),
                    startPoint: location,
                    filter: filter
                };

                // Check if user not choose end point then end point will equal start point

                if (document.getElementById('destinationInput') == null) {
                    callTaxiData.endPoint = callTaxiData.startPoint;

                    angular.element(document.querySelector('#form-callTaxi')).removeClass("on");
                } else {
                    callTaxiData.endPoint = document.getElementById('destinationInput').value;
                }


                // Display direction if user choose end point
                if (callTaxiData.startPoint !== callTaxiData.endPoint) {
                    gmaps.getDirectionByGeoCode(callTaxiData.startPoint, callTaxiData.endPoint);
                }

                socketIo.emit('call:taxi', callTaxiData); // Emit event 'call:taxi' and data to server

                $rootScope.originInput = callTaxiData.startPoint;
                $rootScope.destinationInput = callTaxiData.endPoint;

                $rootScope.status.callCounter = 10;
                $rootScope.listCall = true;
                $rootScope.status.showCounter = true;
                onTimeout(); // Count down
                $rootScope.hideButtonCall = false;

            };


            $scope.callTaxi = function () { // TODO: Action when click button call taxi

                if (!$auth.getPhoneNumber()) { // if user not have phone number will display popup require user type phone number

                    $ionicPopup.show({
                        templateUrl: 'views/utils/getPhoneNumber.html',
                        title: 'Nhập số điện thoại',
                        subTitle: '(chỉ cần nhập lần đầu)',
                        scope: $scope,
                        buttons: [
                            { text: 'Hủy', onTap: function (e) {
                                return true;
                            } },
                            {
                                text: '<b>Xác nhận</b>',
                                type: 'button-positive',
                                onTap: function (e) {

                                    $restful.put({table: 'Users', id: $auth.getAppRegisterInfo().id}, {phone: $scope.phoneNumber.phone}, function (resp) {
                                        $logger.info('updateRoute', 'resp', resp);
                                        if (resp.success) {
                                            $auth.setPhoneNumber($scope.phoneNumber.phone);
                                            callTaxi();
                                            return true;
                                        } else {
                                            $auth.setPhoneNumber($scope.phoneNumber.phone);
                                            callTaxi();
                                            return true;
                                        }
                                    });

                                }
                            }
                        ]
                    }).then(function (res) {
                        console.log('Tapped!', res);
                    }, function (err) {
                        console.log('Err:', err);
                    }, function (msg) {
                        console.log('message:', msg);
                    });


                } else {
                    callTaxi();
                }
            };

            var onTimeout = function () { // Count down when call taxi
                $rootScope.status.callCounter--;

                if ($rootScope.status.callCounter < 1) {
                    $rootScope.status.showCounter = false;
                    $rootScope.status.callTaxiProcess = false;
                    var hasTaxi = false;
                    if ($rootScope.status.callCounter <= -2) {
                        $rootScope.customerCalling = false;
                        hasTaxi = true;
                    }
                    $rootScope.status.showListTaxi = true;
                    $state.go('app.listTaxiAccept', {hasTaxi: hasTaxi}); // if have taxi accept will display list taxi


                    return;
                }
                var mytimeout = $timeout(onTimeout, 1000);
            };

            $scope.addBookmark = function (isOriginPoint) { // Add favorite addrress
               
               // bookmar load,
                $rootScope.loadingIndicator = $ionicLoading.show({
                    template: 'Đang thêm địa chỉ yêu thích...',
                    noBackdrop: true
                });

                var bookmarkPoint = isOriginPoint.description;
                console.log('bookmarkPoint :',bookmarkPoint);
/*
                if (isOriginPoint) {
                    bookmarkPoint = document.getElementById('originInput').value;
                } else {
                    bookmarkPoint = document.getElementById('destinationInput').value;
                }*/

                if (bookmarkPoint.length > 1) {

                    var bookmarkItem = {
                        customer: $auth.getAppRegisterInfo().id,
                        bookmarkPoint: bookmarkPoint
                    };

                    console.log(bookmarkItem, bookmarkPoint);
                    var flag = true;

                    for (var i = 0; i < appDataStore.listBookmark.all().length; i++) {
                        if (appDataStore.listBookmark.all()[i].bookmarkPoint == bookmarkPoint) {
                               $ionicLoading.hide();
                            $rootScope.notify('Bạn đã lưu địa chỉ này');
                            flag = false;
                            return;
                        }
                    }
                    if (flag) {
                        var saveItem = new $baseModel('Bookmarks', bookmarkItem);
                        saveItem.save(function (err, result) {

                            if (err) {
                                   $ionicLoading.hide();
                                $rootScope.notify('Có lỗi xảy ra !. Vui lòng thử lại sau');
                                $logger.info('addBookmarks', 'err', err);
                            } else {
                                $logger.info('addBookmarks', 'resp', result);
                                appDataStore.listBookmark.add(result);
                                $rootScope.bookmarked = true;
                                if (isOriginPoint) {
                                    $scope.stylebookmark = 'booksave';
                                } else {
                                    $scope.stylebookmark1 = 'booksave';
                                }
                                $ionicLoading.hide();
                                $rootScope.notify('Lưu địa chỉ thành công!');

                                $scope.notBookmark = false;
                            }
                        })
                    }
                } else {
                    $rootScope.notify('Vui lòng nhập địa chỉ');
                }
            };


            /*
             *
             * */
            $scope.destroyRoute = function (deleteInfo) { // Run when user click button "Huy lo trinh"
                var deleteReason;

                deleteReason = (deleteInfo.otherReason) ? deleteInfo.otherReason : deleteInfo.deleteReason;
                /*$rootScope.tooltip.open('Lộ trình này sẽ kết thúc sau 10s', 5000);*/

                var destroyLoading = $ionicLoading.show({
                    content: '<i class="ion-loading-c"></i> <br/>Đang hủy lộ trinh',
                    animation: 'fade-in',
                    showBackdrop: false,
                    maxWidth: 200
                });

                $rootScope.watingTaxi = false;
                $rootScope.status.showListTaxi = false;
                $logger.info('destroyRoute', 'start', true);

                socketIo.emit('customer:destroy:route', { // Emit event to taxi
                    roomID: taxi.getCurrentRoomID(),
                    reason: deleteReason
                });


                // After 5 seconds route will automatic destroy
                $timeout(function () {
                    if (destroyRouteFlag) {
                        $logger.info('destroyRoute', 'start', true);
                        taxi.updateRoute(taxi.getDirectionInfo()[0].id, {status: 3, deleteReason: deleteReason}, function (error, result) {
                            if (result) {
                                /*$rootScope.tooltip.open('Hủy lộ trình thành công');*/
                                $rootScope.notify('Hủy lộ trình thành công');

                                taxi.setCurrentStatus(0);
                                taxi.setDirectionInfo(null);

                                if (gmaps.endPointMarker && gmaps.startPointMarker) { // Remove marker on map
                                    gmaps.map.removeLayer(gmaps.endPointMarker);
                                    gmaps.map.removeLayer(gmaps.startPointMarker);
                                }
                                if (gmaps.RoutePolyline) {
                                    gmaps.map.removeLayer(gmaps.RoutePolyline);
                                }


                                gmaps.map.setZoom(15);

                                gmaps.map.panTo(gmaps.currentPoint.getLatLng());

                                $rootScope.status.hasRouter = false;

                                $rootScope.messageData = [];

                                navigator.geolocation.getCurrentPosition(gmaps.getPositionSuccess, gmaps.getPositionError);

                                setTimeout(function () {
                                    gmaps.iniSearchPoint();
                                }, 2000);

                                $rootScope.hideStatus();

                                /*$scope.refreshTaxi(4);*/
                            }
                        });
                    } else {
                        destroyRouteFlag = true;
                    }
                }, 5000);

            };


            $scope.openConfirmDestroyRoute = function () { // Confirm before destroy route

                $scope.deleteInfo = {};

                $ionicPopup.show({
                    templateUrl: 'views/utils/destroyModal.html',
                    title: 'Xác nhận hủy lộ trình',
                    subTitle: 'Nhập lý do',
                    scope: $scope,
                    buttons: [
                        { text: 'Không', onTap: function (e) {
                            return true;
                        } },
                        {
                            text: '<b>Hủy</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                if ($scope.deleteInfo.deleteReason != null) {
                                    $scope.destroyRoute($scope.deleteInfo);
                                    return true;
                                } else {
                                    $rootScope.notify('Vui lòng chọn lý do!!!', 1000);
                                    setTimeout(function () {
                                        $scope.openConfirmDestroyRoute();
                                    }, 1000)
                                }
                            }
                        }
                    ]
                }).then(function (res) {
                    console.log('Tapped!', res);
                }, function (err) {
                    console.log('Err:', err);
                }, function (msg) {
                    console.log('message:', msg);
                });
                /*$scope.destroyModal.show();*/
            };


            /*
             * Working with socketIO
             * */


            window.socketIo.on('send:quick:taxi:reject', function (data) {
                $rootScope.hideStatus();
                $rootScope.notify('Taxi đã từ chối yêu cầu của bạn.');
                $rootScope.watingTaxi = false;
            });


            /*
             * Functionally overlay map when open menu
             * */

            $scope.overlaymap = false;
            var checkOverlay = false;

            $scope.watchSlideMenu = function () {
                return $ionicSideMenuDelegate.isOpen();
            };

            $scope.$watch('watchSlideMenu()', function (oldV, newV) {
                if (checkOverlay == false) {
                    checkOverlay = true;
                } else {
                    (newV) ? $scope.overlaymap = false : $scope.overlaymap = true;
                }
            });


            window.socketIo.on('taxi:send:location', function (data) {


                console.log('hello');
                angular.forEach(gmaps.listMarkerTaxi, function (v, k) { // Update position taxi on map
                    //console.log(data);
                    if (v.options.carLic == data.taxi) {
                        v.setLatLng(new L.LatLng(data.LatLng.lat, data.LatLng.lng));
                        if ($rootScope.status.pinPosition) {
                            gmaps.map.panTo(new L.LatLng(data.LatLng.lat, data.LatLng.lng));
                        }
                    }
                });
            });


            $scope.goToCenter = function () { // go to current position on maps

                $rootScope.notify('Tìm vị trí', 2000);

                $logger.info('gotoCenter', 'start', true);
                navigator.geolocation.getCurrentPosition(function (position) { // GET POSITION SUCCESS

                        $logger.info('gotoCenter', 'success', true);

                        $ionicLoading.hide();

                        gmaps.setCurrentPoint(new L.LatLng(position.coords.latitude, position.coords.longitude));

                        gmaps.map.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude), {
                            animate: true,
                            duration: 1
                        });

                        gmaps.map.setZoom(15);
                    },

                    function (error) { /// GET POSITION ERROR

                        $logger.info('gotoCenter', 'error', error);

                        $ionicLoading.hide();

                        gmaps.map.panTo(gmaps.currentPoint.getLatLng(), {
                            animate: true,
                            duration: 1
                        });
                        gmaps.map.setZoom(15);
                    }, {timeout: 1500});
            };

            /*
             * Start controller
             * */

            gmaps.init();


            $scope.$on('$viewContentLoaded', function () {
                //$logger.info('$viewContentLoaded', 'start', true);
                // document.getElementById('loadingPage').style.display = 'none';
                //document.getElementsByClassName('leaflet-control-attribution')[0].style.display = 'none';
            });


            /*window.ionic.DomUtil.ready(function (e) {

             if ($rootScope.homeLoaded) {

             console.log('$rootScope.status', $rootScope.status);

             if (gmaps.lastPosition) {
             gmaps.getPositionSuccess(gmaps.lastPosition);
             }
             } else {
             $rootScope.homeLoaded = true;
             }

             });
             */
            var searchValue = '';
            $scope.isOrigin = false;

            $scope.inputOnChange = function (el) { // Listen event when user typing origin and destination

                if ($scope.isOrigin) {
                    searchValue = document.getElementById('originInput').value;
                } else {
                    searchValue = document.getElementById('destinationInput').value;
                }
                if (searchValue.length > 0) {
                    // Search address
                    gmaps.placeService.getPlacePredictions({ input: searchValue, types: ['geocode'], componentRestrictions: { 'country': 'VN' }}, function (predictions, status) {

                        if (status == google.maps.places.PlacesServiceStatus.OK) {

                            $rootScope.resultPlace = [];

                            $rootScope.$apply(function () {
                                $rootScope.startPoint = document.getElementById('originInput').value;
                                $rootScope.cssResult = 'showR';
                                $rootScope.resultPlace = predictions;
                            })
                        }
                    });
                }

            };


            $scope.onFocus = function (input) { //Listen event when user focus to input
                $scope.isOrigin = (input == 'originInput');
                $scope.showList(input);
            };


            $scope.showList = function (name) { // Display list address
                $rootScope.cssResult = 'showR';
                if (name == 'originInput' || name == 'destinationInput') {

                    if ($rootScope.showPlace != 0) {
                        $rootScope.resultPlace = [];
                        for (var property in $rootScope.showPlace) {
                            if ($rootScope.showPlace.hasOwnProperty(property) && angular.isObject($rootScope.showPlace[property])) {
                                $rootScope.resultPlace.push({
                                    description: $rootScope.showPlace[property].bookmarkPoint
                                });
                            }
                        }
                    }
                }


            };


            var loadBookmark = function () {

                $logger.info("loadBookmark", "Bookmark loading.....", true);

                var userId = $auth.getAppRegisterInfo().id;
                var filter = [
                    {
                        property: 'customer',
                        value: userId,
                        type: 'string',
                        comparison: 'eq'
                    }
                ];

                $fetchData.getData('Bookmarks', 0, 1000, filter, null).then(function (resp) {
                    $rootScope.showPlace = resp.all();
                    appDataStore.listBookmark = resp;

                    if ($rootScope.showPlace == 0) {
                        $rootScope.resultPlace = [
                            {description: 'Ngã tư cổ nhuế - Hà Nội'},
                            {description: 'Royal City - Hà Nội'},
                            {description: 'Công viên Hòa Bình - Hà Nội'},
                            {description: 'Trung tâm hội nghị quốc gia - Hà Nội'},
                            {description: 'VNT Tower Ngã Tư sở - Hà Nội'}
                        ];
                    }
                }, function (err) {
                    console.log('err : ', err);
                })
            };

            if (appDataStore.listBookmark.size()) { // Chec bookmark loaded .
                $rootScope.showPlace = appDataStore.listBookmark.all();

                if ($rootScope.showPlace == 0) {
                    $rootScope.resultPlace = [
                        {description: 'Ngã tư cổ nhuế - Hà Nội'},
                        {description: 'Royal City - Hà Nội'},
                        {description: 'Công viên Hòa Bình - Hà Nội'},
                        {description: 'Trung tâm hội nghị quốc gia - Hà Nội'},
                        {description: 'VNT Tower Ngã Tư sở - Hà Nội'}
                    ];
                }
            } else {
                loadBookmark();
            }


            $rootScope.selectAdd = function (add, index) {
                var originInput = document.getElementById('originInput');
                var destinationInput = document.getElementById('destinationInput');
                console.log('add ', add);
                $rootScope.cssResult = '';
                if (index == 1) {
                    console.log('add startPoint', add.description);
                    originInput.value = add.description;
                    $rootScope.startPoint = add.description;
                } else {
                    console.log('add endPoint', add.description);
                    $rootScope.endPoint = add.description;
                    destinationInput.value = add.description;
                }
                /* if ($scope.isOrigin) {
                 originInput.value = add.description;
                 $rootScope.startPoint = add.description;
                 $scope.stylebookmark = '';
                 angular.forEach(appDataStore.listBookmark.all(), function (v, k) {
                 if (v.startPoint == originInput.value) {
                 $scope.stylebookmark = 'booksave';
                 }
                 })

                 } else {
                 destinationInput.value = add.description;
                 $rootScope.endPoint = add.description;

                 $scope.stylebookmark = '';

                 angular.forEach(appDataStore.listBookmark.all(), function (v, k) {
                 if (v.endPoint == destinationInput.value) {
                 $scope.stylebookmark = 'booksave';
                 }
                 })
                 }*/

                gmaps.geocoder.geocode({'address': originInput.value}, function (results, status) {
                    if (status === 'OK') {
                        gmaps.currentPointInputLocation = results[0].geometry.location;

                        if (destinationInput.value.length > 0 && originInput.value.length > 0) {

                            gmaps.getDirectionByGeoCode(gmaps.currentPointInputLocation, destinationInput.value);
                        }
                    }
                });

            };


            var sendMessage = function (messageContent) { // Send quick message to taxi

                var emitData = {
                    from: appConfig.deviceId,
                    to: taxi.getDirectionInfo()[0].driver.username,
                    name: 'Khách hàng',
                    deviceId: appConfig.deviceId,
                    content: messageContent,
                    time: new Date(),
                    roomId: taxi.getCurrentRoomID(),
                    status: 0
                };

                $socketIo.emit('send:message', emitData);
                $rootScope.notify('Gửi tin nhắn thành công!', 1500);

            };

            $scope.showPrompt = function () {
                $ionicPopup.prompt({
                    title: 'Ghi chú',
                    subTitle: 'Nhập tin nhắn gửi tới lái xe! (chờ đại sảnh,ngõ 155....)'
                }).then(function (res) {
                    if (res) {
                        sendMessage(res);
                    } else {
                        $rootScope.notify('Vui lòng nhập nội dung', 1000);
                    }
                });
            };
            $scope.classRouter1 = 'slide-box-active';
            $scope.slideHasChanged = function (index) {
                if (index == 0) {
                    $scope.classRouter1 = 'slide-box-active';
                    $scope.classRouter2 = '';
                    $scope.classRouter3 = '';

                } else if (index == 1) {
                    $scope.classRouter1 = '';
                    $scope.classRouter2 = 'slide-box-active';
                    $scope.classRouter3 = '';
                } else {
                    $scope.classRouter1 = '';
                    $scope.classRouter2 = '';
                    $scope.classRouter3 = 'slide-box-active';
                }
            };


            $scope.slideOne = function () {
                $ionicSlideBoxDelegate.$getByHandle('route').slide(0, 300);
            };
            $scope.slideTwo = function () {
                $ionicSlideBoxDelegate.$getByHandle('route').slide(1, 300);
            };
            $scope.slideThree = function () {
                $ionicSlideBoxDelegate.$getByHandle('route').slide(2, 300);
            };

            $ionicModal.fromTemplateUrl('./views/states/child/router.html', {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true
            }).then(function (modal) {
                $scope.modalInput = modal;
            });

            $scope.openModalInput = function () {
                if (!$rootScope.status.callTaxiProcess) {
                    $scope.modalInput.show();
                }


            };

            $scope.closeModalInput = function () {
                $scope.modalInput.hide();
            };

            /*

             $ionicModal.fromTemplateUrl('./views/states/child/go-to.html', {
             scope: $scope,
             animation: 'slide-in-up',
             focusFirstInput: true
             }).then(function (modal) {
             $scope.modalGoTo = modal;
             });
             $scope.openModalGoTo = function () {
             $scope.modalGoTo.show();
             };

             $scope.closeModalGoTo = function () {
             $scope.modalGoTo.hide();
             };


             $ionicModal.fromTemplateUrl('./views/states/child/go-from.html', {
             scope: $scope,
             animation: 'slide-in-up',
             focusFirstInput: true
             }).then(function (modal) {
             $scope.modalFromTo = modal;
             });
             $scope.openModalFromTo = function () {
             $scope.modalFromTo.show();
             };

             $scope.closeModalFromTo = function () {
             $scope.modalFromTo.hide();
             };

             */

            $scope.listHistory = [];
            var loadHistory = function () {
                // get User id from AppRegisterInfo

                var userId = $auth.getAppRegisterInfo().id;
                // filter
                var filter = [
                    {
                        property: 'customer',
                        value: userId,
                        type: 'string',
                        comparison: 'eq'
                    },
                    {
                        property: 'status',
                        value: 5, // status route has been destroy
                        type: 'number',
                        comparison: 'ne' // Not Equal
                    }
                ];

                var sorter = [
                    {
                        property: 'endAt', // time
                        direction: 'DESC'
                    }
                ];
                $fetchData.getData('RouteHistories', 0, 1000, filter, sorter).then(function (result) {
                    var leg = result.all().length, dataRo = [], dataNew = [];
                    if (leg > 0) {
                        for (var i = 0; i < leg; i++) {
                            dataRo.push(result.all()[i].startPoint);
                        }
                        var dataNew = _.uniq(dataRo);
                        for (var j = 0; j < dataNew.length; j++) {
                            $scope.listHistory.push({description: dataNew[j]});
                        }

                    } else {
                        $scope.checkHistory = false;
                    }
                })
            };

            loadHistory();

        }]);