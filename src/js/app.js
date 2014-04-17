/*jslint nomen: true*/
/*global $, _*/

$(function () {
    'use strict';
    var utils = {
        ls: function (key, value) {
            /*global localStorage*/
            if (arguments.length > 1) {
                return localStorage.setItem(key, JSON.stringify(value));
            }
            return JSON.parse(localStorage.getItem(key));
        }
    };

    var Board = (function () {
        function Class() {
            this.todos = this.fetch();
        }

        Class.prototype.fetch = function () {
            var data = utils.ls('todo-board-items');
            if (!data) {
                $.ajax({
                    type: 'GET',
                    url: 'data.json',
                    dataType: 'json',
                    async: false,
                    success: function (newData) {
                        data = newData;
                    }
                });
            }
            return data;
        };

        Class.prototype.save = function () {
            setTimeout(function () {
                utils.ls('todo-board-items', this.todos);
            }, 0);
        };

        Class.prototype.addTodo = function (todo) {
            this.todos.push(todo);
            this.save();
        };

        Class.prototype.changeTodo = function (todo) {
            var index = _.findIndex(this.todos, {id: todo.id});
            this.todos[index] = todo;
            this.save();
        };

        Class.prototype.removeTodo = function (id) {
            _.remove(this.todos, {id: id});
            this.save();
        };

        return Class;
    }());
});