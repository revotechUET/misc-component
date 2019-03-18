var angular = require('angular');
var imageStable = require('../../image-stable/image-stable.js');
var ngFileUpload = require('./ng-file-upload.min.js');
var showEditField = require('../../show-edit-field/show-edit-field.js');
var app = angular.module('myApp',[imageStable.name,showEditField.name,'ngFileUpload']);

app.controller('myCtrl', function(){
	var self = this;
	this.data = [];
})