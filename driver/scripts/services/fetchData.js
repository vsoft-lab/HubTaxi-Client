'use strict';

angular.module('taxigoDriverApp')
    .factory('fetchData', ['BaseModel', 'restful', '$q', '$collection', 'logger', function (BaseModel, restful, $q, $collection, logger) {

        logger.moduleName = 'Fetch Data Factory';


        var fetchData;

        fetchData = {
            getData: function (tableName, start, limit, filters, sorters) {

                var _start, _limit, _filters, _sorters;

                var defer = $q.defer();
                var collection = $collection;
                var dataCollection = collection.getInstance();


                _start = start || 0;
                _limit = limit || 1000;
                _filters = JSON.stringify(filters) || null;
                _sorters = JSON.stringify(sorters) || null;


                restful.get({table: tableName, start: _start, limit: _limit, filter: _filters, sort: _sorters}, function (resp) {
                    if (resp.success) {
                        var items = resp.data;
                        angular.forEach(items, function (item) {
                            var dataModel = new BaseModel(tableName, item);
                            dataCollection.add(dataModel);
                        });
                        dataCollection.total = resp.total;
                        defer.resolve(dataCollection);

                    } else {
                        defer.reject(resp.message);
                    }
                }, function (err) {
                    defer.reject(err);
                });

                return defer.promise;
            }
        };
        return fetchData;
    }]);


/*
 operMap = {
 eq: '$eq',
 lt: '$lt',
 gt: '$gt',
 gte: '$gte',
 lte: '$lte',
 ne: '$ne',
 bt: '$in',
 nbt: '$nin',
 like: '$LIKE'
 };
 */

/*var filter = [
 {
 property: 'post',
 value: stackId,
 type: 'string',
 comparison: 'eq'
 }
 ];
 var sorter = [
 {
 property: 'commentAt',
 direction: 'DESC'
 }
 ];*/