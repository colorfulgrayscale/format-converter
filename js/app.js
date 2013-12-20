/*jslint vars: true, browser: true, node: true, regexp: true */
/*global angular, $, jQuery, alert*/

'use strict';

var FormatConverter = angular.module('FormatConverter', ['ui.ace']);
var qs = require('qs'),
    xml2js   = require('xml2js'),
    xml2json = require('xml2json'),
    yaml2json = require('js-yaml');

var xmlBuilder = new xml2js.Builder();

FormatConverter.run(function ($rootScope, $location, $log) {
    $rootScope.location = $location;  // page location
    $(document).ready(function () {
        console.log("Loaded");
        console.log(process.version);
        $(".ace_editor").height($(window).height() - 55);
    });

    $(window).on('resize', function () {
        $(".ace_editor").height($(window).height() - 55);
    });

});

FormatConverter.controller("bodyController", function ($scope, $log, $http, $rootScope) {

    $scope.dataJSON = "";
    $scope.dataQS = "";
    $scope.dataXML = "";
    $scope.dataYAML = "";

    $scope.JSONtoQS = function (jsonObject) {
        var result = false;
        try {
            result = qs.stringify(jsonObject);
            $scope.dataQS = result;
        } catch (qsError) {
            console.error("QS Builder Error:", qsError);
            $scope.dataQS = "QS Builder Error";
        }
        return result;
    };

    $scope.JSONtoXML = function (jsonObject) {
        var result = false;
        try {
            result = xmlBuilder.buildObject(jsonObject);
            $scope.dataXML = result;
        } catch (xmlError) {
            console.error("XML Builder Error:", xmlError);
            $scope.dataXML = "XML Builder Error";
        }
        return result;
    };

    $scope.JSONtoYAML = function (jsonObject) {
        var result = false;
        try {
            result = yaml2json.dump(jsonObject);
            $scope.dataYAML = result;
        } catch (yamlError) {
            console.error("YAML Builder Error:", yamlError);
            $scope.dataYAML = "YAML Builder Error";
        }
        return result;
    };


    $scope.dirtyJSON = function () {
        var jsonObject;

        try {
            jsonObject = JSON.parse($scope.dataJSON);
        } catch (jsonError) {
            console.error("JSON Parse error:", jsonError);
            $scope.dataQS = "JSON Parse Error";
            $scope.dataXML = "JSON Parse Error";
            $scope.dataYAML = "JSON Parse Error";
            return;
        }

        console.log("Parsed JSON: ", jsonObject);

        var qsResult = $scope.JSONtoQS(jsonObject);
        var xmlResult = $scope.JSONtoXML(jsonObject);
        var yamlResult = $scope.JSONtoYAML(jsonObject);
        $scope.safeApply();
    };

    $scope.dirtyQS = function () {
        var jsonObject;
        try {
            jsonObject = qs.parse($scope.dataQS);
        } catch (qsError) {
            console.error("QS Parse error:", qsError);
            $scope.dataJSON = "QS Parse Error";
            $scope.dataXML = "QS Parse Error";
            $scope.dataYAML = "QS Parse Error";
            return;
        }

        console.log("Parsed QS: ", jsonObject);

        $scope.dataJSON = JSON.stringify(jsonObject, null, 2);
        var xmlResult = $scope.JSONtoXML(jsonObject);
        var yamlResult = $scope.JSONtoYAML(jsonObject);
        $scope.safeApply();
    };

    $scope.dirtyXML = function () {
        var jsonObject;
        try {
            jsonObject = JSON.parse(xml2json.toJson($scope.dataXML));
        } catch (xmlError) {
            console.error("QS Parse error:", xmlError);
            $scope.dataJSON = "XML Parse Error";
            $scope.dataQS = "XML Parse Error";
            $scope.dataYAML = "XML Parse Error";
            return;
        }

        console.log("Parsed XML: ", jsonObject);

        $scope.dataJSON = JSON.stringify(jsonObject, null, 2);
        var qsResult = $scope.JSONtoQS(jsonObject);
        var yamlResult = $scope.JSONtoYAML(jsonObject);
        $scope.safeApply();
    };

    $scope.dirtyYAML = function () {
        var jsonObject;
        try {
            jsonObject = yaml2json.load($scope.dataYAML);
        } catch (yamlError) {
            console.error("YAML Parse error:", yamlError);
            $scope.dataJSON = "YAML Parse error";
            $scope.dataQS = "YAML Parse error";
            $scope.dataXML = "YAML Parse error";
            return;
        }

        console.log("Parsed YAML: ", jsonObject);

        $scope.dataJSON = JSON.stringify(jsonObject, null, 2);
        var qsResult = $scope.JSONtoQS(jsonObject);
        var xmlResult = $scope.JSONtoXML(jsonObject);
        $scope.safeApply();
    };

    $scope.aceLoaded = function (editor) {
        editor.setHighlightActiveLine(false);
        editor.setFontSize("10px");
        editor.renderer.setShowPrintMargin(false);
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

});
