const app = angular.module('app', []);

app.controller('tableDataCtrl', function($scope, $http) {

    $http.get('https://api.covid19india.org/data.json')
        .then(
            function(result){

                $scope.stateData = result.data.statewise.map(stateObj => {
                    return {
                        NAME: stateObj.state,
                        CONFIRMED: stateObj.confirmed,
                        ACTIVE: stateObj.active,
                        DEATHS: stateObj.deaths,
                        RECOVERED: stateObj.recovered
                    };
                });
            },
            function(error, status){
                console.log(error);
                console.log(status);
            }
        );
});