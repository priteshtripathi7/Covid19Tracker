import * as CommonFunc from './modules/commonFunc.js';

const app = angular.module("app", ["ngRoute"]);

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix("");
    $routeProvider

        .when("/", {
            templateUrl: "pages/covidIndia.html",
            controller: "tableDataCtrl",
        })

        .when("/world", {
            templateUrl: "pages/covidWorld.html",
            controller: "worldTableDataCtrl",
        });
});

app.controller('tableDataCtrl', function($scope, $http) {

    $scope.stateData =  [];
    $scope.countryData = [];

    $http.get('https://api.covid19india.org/data.json')
        .then(
            function(result){

                const states = result.data.statewise;

                // India Country Data
                $scope.countryData.push(
                    {
                        CASE_TYPE : "Confirmed",
                        CASE_COUNT: CommonFunc.formatNumber(states[0].confirmed),
                        CSS: "confirmedData"
                    }
                )
                $scope.countryData.push(
                    {
                        CASE_TYPE : "Active",
                        CASE_COUNT: CommonFunc.formatNumber(states[0].active),
                        CSS: "activeData"
                    }
                )
                $scope.countryData.push(
                    {
                        CASE_TYPE : "Recovered",
                        CASE_COUNT: CommonFunc.formatNumber(states[0].recovered),
                        CSS: "recoveredData"
                    }
                )
                $scope.countryData.push(
                    {
                        CASE_TYPE : "Deceased",
                        CASE_COUNT: CommonFunc.formatNumber(states[0].deaths),
                        CSS: "deceasedData"
                    }
                )

                // StateWise Data
                for(let iterator=1; iterator < states.length; iterator++) {

                    const stateObj = states[iterator];
                    $scope.stateData.push({
                        NAME: stateObj.state,
                        CONFIRMED: stateObj.confirmed,
                        ACTIVE: stateObj.active,
                        DEATHS: stateObj.deaths,
                        RECOVERED: stateObj.recovered
                    });
                }

                // Line Graph Data
                const dailyData = result.data.cases_time_series;

                $scope.dailyData = {
                    LABEL: [],
                    CONFIRMED: [],
                    ACTIVE: [],
                    RECOVERED: [],
                    DECEASED: [],
                    TOTAL_CONFIRMED: [],
                    TOTAL_ACTIVE: [],
                    TOTAL_RECOVERED: [],
                    TOTAL_DECEASED: []
                };

                for(let iterator = dailyData.length - 30; iterator < dailyData.length; iterator++){
                    const currentDayData = dailyData[iterator];
                    $scope.dailyData.LABEL.push(currentDayData.date);

                    $scope.dailyData.CONFIRMED.push(parseInt(currentDayData.dailyconfirmed));
                    $scope.dailyData.TOTAL_CONFIRMED.push(parseInt(currentDayData.totalconfirmed));

                    $scope.dailyData.DECEASED.push(parseInt(currentDayData.dailydeceased));
                    $scope.dailyData.TOTAL_DECEASED.push(parseInt(currentDayData.totaldeceased));

                    $scope.dailyData.RECOVERED.push(parseInt(currentDayData.dailyrecovered));
                    $scope.dailyData.TOTAL_RECOVERED.push(parseInt(currentDayData.totalrecovered));

                    $scope.dailyData.ACTIVE.push(parseInt(currentDayData.dailyconfirmed) - parseInt(currentDayData.dailydeceased) - parseInt(currentDayData.dailyrecovered));
                    $scope.dailyData.TOTAL_ACTIVE.push(parseInt(currentDayData.totalconfirmed) - parseInt(currentDayData.totaldeceased) - parseInt(currentDayData.totalrecovered));
                }

                $scope.changeChartDisplayToCumulative();
            },
            function(error, status){
                alert('Some Error Occurred!!');
                console.log(error);
                console.log(status);
            }
        );

    $scope.changeChartDisplayToCumulative = function() {

        const ctxConfirmed = document.getElementById('confirmedChart').getContext('2d');
        const confirmedChart = new Chart(ctxConfirmed, {

            type: 'line',
            data: {
                labels: $scope.dailyData.LABEL,
                datasets: [{
                    label: 'Confirmed Cases',
                    backgroundColor: 'rgba(255,7,58,.12549)',
                    borderColor: '#ff073a',
                    data: $scope.dailyData.TOTAL_CONFIRMED
                }]
            },
        });

        const ctxActive = document.getElementById('activeChart').getContext('2d');
        const activeChart = new Chart(ctxActive, {

            type: 'line',
            data: {
                labels: $scope.dailyData.LABEL,
                datasets: [{
                    label: 'Active Cases',
                    backgroundColor: 'rgba(0,123,255,.0627451)',
                    borderColor: '#007bff',
                    data: $scope.dailyData.TOTAL_ACTIVE
                }]
            },
        });

        const ctxRecovered = document.getElementById('recoveredChart').getContext('2d');
        const recoveredChart = new Chart(ctxRecovered, {

            type: 'line',
            data: {
                labels: $scope.dailyData.LABEL,
                datasets: [{
                    label: 'Recovered Cases',
                    backgroundColor: 'rgba(40,167,69,.12549)',
                    borderColor: '#28a745',
                    data: $scope.dailyData.TOTAL_RECOVERED
                }]
            },
        });

        const ctxDeceased = document.getElementById('deceasedChart').getContext('2d');
        const deceasedChart = new Chart(ctxDeceased, {

            type: 'line',
            data: {
                labels: $scope.dailyData.LABEL,
                datasets: [{
                    label: 'Deceased Cases',
                    backgroundColor: 'rgba(108,117,125,.0627451)',
                    borderColor: '#6c757d',
                    data: $scope.dailyData.TOTAL_DECEASED
                }]
            },
        });
    }

    $scope.changeChartDisplayToDaily = function() {

        const ctxConfirmed = document.getElementById('confirmedChart').getContext('2d');
        const confirmedChart = new Chart(ctxConfirmed, {

            type: 'bar',
            data: {
                labels: $scope.dailyData.LABEL,
                datasets: [{
                    label: 'Confirmed Cases',
                    backgroundColor: '#ff073aaa',
                    borderColor: '#ff073aaa',
                    data: $scope.dailyData.CONFIRMED
                }]
            },
        });

        const ctxActive = document.getElementById('activeChart').getContext('2d');
        const activeChart = new Chart(ctxActive, {

            type: 'bar',
            data: {
                labels: $scope.dailyData.LABEL,
                datasets: [{
                    label: 'Active Cases',
                    backgroundColor: '#007bffaa',
                    borderColor: '#007bffaa',
                    data: $scope.dailyData.ACTIVE
                }]
            },
        });

        const ctxRecovered = document.getElementById('recoveredChart').getContext('2d');
        const recoveredChart = new Chart(ctxRecovered, {

            type: 'bar',
            data: {
                labels: $scope.dailyData.LABEL,
                datasets: [{
                    label: 'Recovered Cases',
                    backgroundColor: '#28a745aa',
                    borderColor: '#28a745aa',
                    data: $scope.dailyData.RECOVERED
                }]
            },
        });

        const ctxDeceased = document.getElementById('deceasedChart').getContext('2d');
        const deceasedChart = new Chart(ctxDeceased, {

            type: 'bar',
            data: {
                labels: $scope.dailyData.LABEL,
                datasets: [{
                    label: 'Deceased Cases',
                    backgroundColor: '#6c757daa',
                    borderColor: '#6c757daa',
                    data: $scope.dailyData.DECEASED
                }]
            },
        });
    }

});
app.controller("worldTableDataCtrl", function ($scope, $http) {
    $http.get("https://api.covid19api.com/summary").then(
        function (result) {
            //console.log(result);
            $scope.countryData = result.data.Countries.map((countryObj) => {
                return {
                    NAME: countryObj.Country,
                    CONFIRMED: countryObj.TotalConfirmed,
                    ACTIVE:
                        countryObj.TotalConfirmed -
                        (countryObj.TotalDeaths + countryObj.TotalRecovered),
                    DEATHS: countryObj.TotalDeaths,
                    RECOVERED: countryObj.TotalRecovered,
                };
            });
        },
        function (error, status) {
            console.log(error);
            console.log(status);
        }
    );
});