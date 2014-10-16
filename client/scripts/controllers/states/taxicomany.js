'use strict';

angular.module('itaxiApp')
    .controller('TaxiCompanyCtrl', ['$scope', '$logger', 'gmaps', 'taxi', '$fetchData', '$auth', '$timeout', '$q', '$ionicPopup', '$restful', function ($scope, $logger, gmaps, taxi, $fetchData, $auth, $timeout, $q, $ionicPopup, $restful) {
        $logger.info('TaxiCompany Controller', 'start', true);

        // list Taxi company from TaxiCompany

        $scope.listTaxiGroup = [
            {logo: './images/mailinh.png', group: 'Taxi Mai Linh', call: '0438222666', star: 5.0, firstKm: '9.000', secondKm: '12.000'},
            {logo: './images/basao.jpg', group: 'Taxi Ba Sao – Morning', call: '0432202020', star: 4.8, firstKm: '9000', secondKm: '12000'},
            {logo: './images/daukhi.png', group: 'Taxi Dầu khí', call: '04363636363', star: 4.4, firstKm: '7.000', secondKm: '12.000'},
            {logo: './images/vinasun.jpg', group: 'Taxi VinaSun', call: '0436668888', star: 5.0, firstKm: '7.000', secondKm: '19.000'},
            {logo: './images/thanhcongtaxi.png', group: 'Taxi Thành Công', call: '043575757', star: 5.0, firstKm: '7.000', secondKm: '19.000'},
            {logo: './images/logo-itaxi-new.png', group: '3A Taxi', call: '01247247247', star: 4.5, firstKm: '8.000', secondKm: '14.000'},
            {logo: './images/logo-itaxi-new.png', group: 'StartCab Nội Bài', call: '01247247247', star: 4.8, firstKm: '9.000', secondKm: '15.000'},
            {logo: './images/logo-itaxi-new.png', group: 'Mỹ Đình', call: '0438333888', star: 5.0, firstKm: '10.000', secondKm: '11.000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Thủ Đô', call: '0438333333', star: 4.5, firstKm: '9.000', secondKm: '12.000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Mỹ Việt', call: '0437195983', star: 4.5, firstKm: '9.000', secondKm: '12.000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Minh Đức', call: '0438555555', star: 4.6, firstKm: '9.000', secondKm: '12.000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Tải Gia Đình', call: '0439714343', star: 4.8, firstKm: '9.000', secondKm: '12.000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Tải An Thịnh', call: '0437530000', star: 4.5, firstKm: '9.000', secondKm: '12.000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Vân Sơn', call: '0437686990', star: 4.5, firstKm: '9.000', secondKm: '12.000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Tây Hồ', call: '0438454545', star: 4.4, firstKm: '9000', secondKm: '12000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Hoàn Thắng', call: '0435736020', star: 4.2, firstKm: '9000', secondKm: '12000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Hương Nam', call: '0438373737', star: 4.4, firstKm: '9000', secondKm: '12000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi vận tải Nội Bài', call: '0438865615', star: 4.7, firstKm: '9000', secondKm: '12000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Hoàng Hợp', call: '0437181818', star: 4.4, firstKm: '9000', secondKm: '12000'},
            {logo: './images/logo-itaxi-new.png', group: 'Taxi Thành Lợi', call: '0438551551', star: 4.5, firstKm: '9000', secondKm: '12000'}
        ];

        /*$fetchData.getData('TaxiCompany').then(function (resp) {
            if (resp) {
                console.log('Data company : ', resp.all());
                //5343c72a365cfcaf0930c418
            } else {
                console.log('err');
            }
        });*/


    }]);