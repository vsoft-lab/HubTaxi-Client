'use strict';

angular.module('itaxiManagerApp')
        .controller('overviewCtrl', ['$scope', '$interval', function ($scope, $interval) {
        $scope.currentTime = new Date();
        $interval(function () {
            $scope.currentTime = new Date();
        }, 1000);



        //google.load("visualization", "1", {packages:["corechart"]});
        //google.setOnLoadCallback(drawChart);
//        function drawChart() {
//            var data = google.visualization.arrayToDataTable([
//                ['Task', 'Hours per Day'],
//                ['Work',     11],
//                ['Eat',      2],
//                ['Commute',  2],
//                ['Watch TV', 2],
//                ['Sleep',    7]
//            ]);
//
//            var options = {
//                title: 'My Daily Activities',
//                pieHole: 0.4
//            };

//
//            var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
//            chart.draw(data, options);
//        }




    }]);




