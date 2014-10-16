/**
 * Created by TungNguyen on 6/24/2014.
 *
 *  Table RouteHistories
     customer: {type: ObjectId, require: true, ref: 'Users'},
     driver: {type: ObjectId, required: true, ref: 'Drivers'},
     startPoint: {type: String, required: true},
     endPoint: {type: String, require: true},
     duration: {type: String, default: 0},
     distance: {type: String, default: 0},
     startAt: {type: Date, default: Date.now}, // Time start
     endAt: {type: Date, default: new Date()}, // Time end routes
     amount: {type: String, default: 0},
     deleteReason: {type: String},
     status: {type: Number, default: 0},
     roomID: {type: String, require: true}
 */
'use strict';

angular.module('itaxiManagerApp')
    .controller('reportSystemCtrl', function ($scope) {
        $scope.activeForm = 0;

        $scope.back =  function(){
            $scope.activeForm = 0;
        }

    });
