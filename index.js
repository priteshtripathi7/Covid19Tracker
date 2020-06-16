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

app.controller("tableDataCtrl", function ($scope, $http) {
  $http.get("https://api.covid19india.org/data.json").then(
    function (result) {
      $scope.stateData = result.data.statewise.map((stateObj) => {
        return {
          NAME: stateObj.state,
          CONFIRMED: stateObj.confirmed,
          ACTIVE: stateObj.active,
          DEATHS: stateObj.deaths,
          RECOVERED: stateObj.recovered,
        };
      });
    },
    function (error, status) {
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
