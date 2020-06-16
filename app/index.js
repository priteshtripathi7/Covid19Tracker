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

                // Data array for Pie Chart\
                $scope.countryPieChart = [
                    parseInt(states[0].active),
                    parseInt(states[0].recovered),
                    parseInt(states[0].deaths)
                ]

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
            },
            function(error, status){
                alert('Some Error Occurred!!');
                console.log(error);
                console.log(status);
            }
        );
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
