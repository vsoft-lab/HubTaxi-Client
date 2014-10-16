'use strict';

angular.module('taxigoDriverApp')
    .factory('BaseModel', ['$resource', '$http', '$cookieStore', '$rootScope', 'logger', '$window', 'restful', function ($resource, $http, $cookieStore, $rootScope, logger, $window, restful) {
        logger.moduleName = 'BaseModel Factory';

        var BaseModel = function (tableName, data) {
            this.omitFields = ['omitFields', 'tableName', 'busy', 'cid', 'acceptSocket'];
            this.tableName = tableName;
            this.busy = false;
            this.acceptSocket = false;
            //this.cid = window.uuid.v4();

            var me = this;
            angular.extend(me, data);
        };

        BaseModel.prototype.fetch = function () {
            var me = this;

            if (me.busy) {
                return;
            }
            me.busy = true;

            restful.get({table: me.tableName, id: me.id}, function (resp) {
                me.busy = false;

                if (resp.success) {
                    if (angular.isObject(window.data)) {
                        angular.extend(me, window.data);

                        if (me._id) {
                            me.id = me._id;
                        }
                    } else {

                    }
                } else {
                    //var errMsg = resp.message;
                    //todo: send or broadcast errMsg to somewhere
                }

                logger.debug('fetch', 'resp', resp);
            });
        };

        BaseModel.prototype.save = function (callback) {
            logger.info('save model', 'start', true);

            var me = this;
            var _isNew = false;

            if (me.busy) {
                return;
            }
            me.busy = true;

            if (me.id) {
                _isNew = false;
            } else {
                _isNew = true;
            }

            var saveData = window._.omit(me, me.omitFields);

            if (_isNew) {
                logger.info('restful save', 'start', true);
                restful.save({table: me.tableName}, saveData, function (resp) {
                    me.busy = false;

                    if (resp.success) {
                        me._id = resp.data._id;
                        me.id = me._id;
                        if (me.acceptSocket) {
                            if (me.tableName === 'comments') {
                                window.socketIo.emit('socket', {table: me.tableName, action: 'create', id: resp.data._id, postID: resp.data.post.id});
                            }
                            else {
                                window.socketIo.emit('socket', {table: me.tableName, action: 'create', id: resp.data._id});
                            }
                        }
                    } else {
                        //var errMsg = resp.message;
                        //TODO: send or broadcast errMsg to somewhere

                    }

                    logger.info('create new model', 'resp', resp);

                    if (callback) {
                        callback(resp.success ? null : resp.message, resp.data);
                    }
                });
            } else {
                logger.info('restful put', 'start', true);
                restful.put({table: me.tableName, id: me.id}, saveData, function (resp) {
                    me.busy = false;

                    if (resp.success) {
                        if (me.acceptSocket) {
                            window.socketIo.emit('socket', {table: me.tableName, action: 'update', id: resp.data.id});
                        }
                        //TODO:
                    } else {
                        //var errMsg = resp.message;
                        //TODO: send or broadcast errMsg to somewhere
                    }

                    logger.info('update existing model', 'resp', resp);

                    if (callback) {
                        callback(resp.success ? null : resp.message, resp.data);
                    }
                });
            }
        };

        BaseModel.prototype.destroy = function (callback) {
            var me = this;

            if (me.busy) {
                return;
            }
            me.busy = true;

            restful.delete({table: me.tableName, id: me.id}, function (resp) {
                me.busy = false;

                if (resp.success) {

                    if (me.acceptSocket) {
                        window.socketIo.emit('socket', {table: me.tableName, action: 'create'});
                        //window.socketIo.emit("comment", {table: "comment", action: 'create'})
                        //window.socketIo.emit("comment/10", {emit: "comments/10", table: "comment", action: 'create'})
                    }

                    if (callback) {
                        callback(null, resp.data);
                    }
                } else {
                    //var errMsg = resp.message;
                    //TODO: send or broadcast errMsg to somewhere
                    if (callback) {
                        callback(resp.message, null);
                    }
                }

                logger.info('delete model', 'resp', resp);
            });
        };


        return BaseModel;
    }]);

