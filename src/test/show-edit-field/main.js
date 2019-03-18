var angular = require('angular');
var showEditField = require('../../show-edit-field/show-edit-field.js');
var app = angular.module('myApp',[showEditField.name]);
app.controller('myCtrl', function(){
	var self = this;
	this.input = ['Well','Name'];
	this.input1 = 'Nam';
})