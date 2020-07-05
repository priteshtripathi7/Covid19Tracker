import * as CommonFunc from './modules/commonFunc.js';
import * as ConfigDetails from './config.js';

const app = angular.module("app", ["ngRoute"]);

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix("");
    $routeProvider

        .when("/", {
            templateUrl: "pages/homepage.html",
            controller: "homePageCtrl",
        })
        .when("/india", {
            templateUrl: "pages/covidIndia.html",
            controller: "indiaPageCtrl",
        })

        .when("/world", {
            templateUrl: "pages/covidWorld.html",
            controller: "worldTableDataCtrl",
        })

        .when("/assessYourself", {
            templateUrl: "pages/assessYourself.html",
            controller: "assessYourselfPageCtrl"
        })

        .when("/knowMore", {
            templateUrl: "pages/knowMore.html",
            controller: "knowMorePageCtrl"
        })

});

app.controller('indiaPageCtrl', function ($scope, $http) {

    $scope.stateData = [];
    $scope.countryData = [];
    $scope.chartData = {};
    $scope.stateDailyData = {};
    $scope.currentChartType = 'line';
    $scope.currentStateShown = 'India';
    $scope.stateCodeMap = {
        'INDIA': 'India'
    };

    let confirmedChart, recoveredChart, activeChart, deceasedChart;

    $http.get('https://api.covid19india.org/data.json')
        .then(
            function (result) {

                const states = result.data.statewise;
                // India Country Data
                $scope.countryData.push(
                    {
                        CASE_TYPE: "Confirmed",
                        CASE_COUNT: CommonFunc.formatNumber(states[0].confirmed),
                        CSS: "confirmedData"
                    }
                )
                $scope.countryData.push(
                    {
                        CASE_TYPE: "Active",
                        CASE_COUNT: CommonFunc.formatNumber(states[0].active),
                        CSS: "activeData"
                    }
                )
                $scope.countryData.push(
                    {
                        CASE_TYPE: "Recovered",
                        CASE_COUNT: CommonFunc.formatNumber(states[0].recovered),
                        CSS: "recoveredData"
                    }
                )
                $scope.countryData.push(
                    {
                        CASE_TYPE: "Deceased",
                        CASE_COUNT: CommonFunc.formatNumber(states[0].deaths),
                        CSS: "deceasedData"
                    }
                )

                $scope.countryData.push(
                    {
                        CASE_TYPE: "Tested",
                        CASE_COUNT: CommonFunc.formatNumber(result.data.tested[result.data.tested.length - 1].totalsamplestested),
                        CSS: 'testedData'
                    }
                )

                // StateWise Data
                for (let iterator = 1; iterator < states.length; iterator++) {

                    const stateObj = states[iterator];
                    $scope.stateData.push({
                        NAME: stateObj.state,
                        CONFIRMED: stateObj.confirmed,
                        ACTIVE: stateObj.active,
                        DEATHS: stateObj.deaths,
                        RECOVERED: stateObj.recovered,
                        STATE_CODE: stateObj.statecode
                    });

                    $scope.stateDailyData[stateObj.statecode] = {
                        LABEL: [],
                        CONFIRMED: [],
                        ACTIVE: [],
                        RECOVERED: [],
                        DECEASED: [],
                        TOTAL_CONFIRMED: [],
                        TOTAL_ACTIVE: [],
                        TOTAL_RECOVERED: [],
                        TOTAL_DECEASED: []
                    }

                    $scope.stateCodeMap[stateObj.statecode] = stateObj.state;
                }

                // Line Graph Data
                const dailyData = result.data.cases_time_series;
                const indiaData = {
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
                for (let iterator = dailyData.length - 30; iterator < dailyData.length; iterator++) {
                    const currentDayData = dailyData[iterator];
                    indiaData.LABEL.push(currentDayData.date);

                    indiaData.CONFIRMED.push(parseInt(currentDayData.dailyconfirmed));
                    indiaData.TOTAL_CONFIRMED.push(parseInt(currentDayData.totalconfirmed));

                    indiaData.DECEASED.push(parseInt(currentDayData.dailydeceased));
                    indiaData.TOTAL_DECEASED.push(parseInt(currentDayData.totaldeceased));

                    indiaData.RECOVERED.push(parseInt(currentDayData.dailyrecovered));
                    indiaData.TOTAL_RECOVERED.push(parseInt(currentDayData.totalrecovered));

                    indiaData.ACTIVE.push(parseInt(currentDayData.dailyconfirmed) - parseInt(currentDayData.dailydeceased) - parseInt(currentDayData.dailyrecovered));
                    indiaData.TOTAL_ACTIVE.push(parseInt(currentDayData.totalconfirmed) - parseInt(currentDayData.totaldeceased) - parseInt(currentDayData.totalrecovered));
                }

                $scope.chartData = indiaData;
                $scope.stateDailyData.INDIA = indiaData;
                $scope.changeChartDisplayToCumulative();
            },
            function (error, status) {
                console.log(error);
                console.log(status);
            }
        );

    $http.get('https://api.covid19india.org/states_daily.json')
        .then(
            function (result) {
                const dailyData = result.data.states_daily;

                for (let iterator = dailyData.length - 90; iterator < dailyData.length; iterator += 3) {

                    // For Confirmed
                    for (const state in dailyData[iterator]) {
                        const stateCode = state.toUpperCase();
                        if ($scope.stateDailyData[stateCode] !== undefined) {
                            $scope.stateDailyData[stateCode].LABEL.push(dailyData[iterator].date);
                            $scope.stateDailyData[stateCode].CONFIRMED.push(parseInt(dailyData[iterator][state]));
                        }
                    }

                    // For Recovered
                    for (const state in dailyData[iterator + 1]) {
                        const stateCode = state.toUpperCase();
                        if ($scope.stateDailyData[stateCode] !== undefined)
                            $scope.stateDailyData[stateCode].RECOVERED.push(parseInt(dailyData[iterator + 1][state]));
                    }

                    // For Deceased
                    for (const state in dailyData[iterator + 2]) {
                        const stateCode = state.toUpperCase();
                        if ($scope.stateDailyData[stateCode] !== undefined) {
                            $scope.stateDailyData[stateCode].DECEASED.push(parseInt(dailyData[iterator + 2][state]));
                        }
                    }
                }

                // Formatting other data
                for (let state in $scope.stateDailyData) {
                    if (state !== 'INDIA') {

                        let totalConfirmed = 0, totalActive = 0, totalRecovered = 0, totalDeceased = 0;

                        for (let iterator = 0; iterator < $scope.stateDailyData[state].CONFIRMED.length; iterator++) {

                            const currentState = $scope.stateDailyData[state];
                            currentState.ACTIVE.push(currentState.CONFIRMED[iterator] - currentState.RECOVERED[iterator] - currentState.DECEASED[iterator]);

                            totalConfirmed += currentState.CONFIRMED[iterator];
                            currentState.TOTAL_CONFIRMED.push(totalConfirmed);

                            totalActive += currentState.ACTIVE[iterator];
                            currentState.TOTAL_ACTIVE.push(totalActive);

                            totalRecovered += currentState.RECOVERED[iterator];
                            currentState.TOTAL_RECOVERED.push(totalRecovered);

                            totalDeceased += currentState.DECEASED[iterator];
                            currentState.TOTAL_DECEASED.push(totalDeceased);
                        }
                    }
                }
            },
            function (error, status) {
                console.log(error);
                console.log(status);
            }
        )

    $scope.updateChartToHoveredState = function (stateCode = 'INDIA') {
        $scope.chartData = $scope.stateDailyData[stateCode];

        if ($scope.currentStateShown === $scope.stateCodeMap[stateCode])
            return;

        if ($scope.currentChartType === 'line')
            $scope.changeChartDisplayToCumulative();
        else
            $scope.changeChartDisplayToDaily();

        $scope.currentStateShown = $scope.stateCodeMap[stateCode];
    };

    $scope.changeChartDisplayToCumulative = function () {

        $scope.currentChartType = 'line';

        if (confirmedChart !== undefined)
            confirmedChart.destroy();
        if (activeChart !== undefined)
            activeChart.destroy();
        if (deceasedChart !== undefined)
            deceasedChart.destroy();
        if (recoveredChart !== undefined)
            recoveredChart.destroy();

        const ctxConfirmed = document.getElementById('confirmedChart').getContext('2d');
        confirmedChart = new Chart(ctxConfirmed, {

            type: 'line',
            data: {
                labels: $scope.chartData.LABEL,
                datasets: [{
                    label: 'Confirmed Cases',
                    backgroundColor: 'rgba(255,7,58,.12549)',
                    borderColor: '#ff073a',
                    data: $scope.chartData.TOTAL_CONFIRMED
                }]
            },
        });

        const ctxActive = document.getElementById('activeChart').getContext('2d');
        activeChart = new Chart(ctxActive, {

            type: 'line',
            data: {
                labels: $scope.chartData.LABEL,
                datasets: [{
                    label: 'Active Cases',
                    backgroundColor: 'rgba(0,123,255,.0627451)',
                    borderColor: '#007bff',
                    data: $scope.chartData.TOTAL_ACTIVE
                }]
            },
        });

        const ctxRecovered = document.getElementById('recoveredChart').getContext('2d');
        recoveredChart = new Chart(ctxRecovered, {

            type: 'line',
            data: {
                labels: $scope.chartData.LABEL,
                datasets: [{
                    label: 'Recovered Cases',
                    backgroundColor: 'rgba(40,167,69,.12549)',
                    borderColor: '#28a745',
                    data: $scope.chartData.TOTAL_RECOVERED
                }]
            },
        });

        const ctxDeceased = document.getElementById('deceasedChart').getContext('2d');
        deceasedChart = new Chart(ctxDeceased, {

            type: 'line',
            data: {
                labels: $scope.chartData.LABEL,
                datasets: [{
                    label: 'Deceased Cases',
                    backgroundColor: 'rgba(108,117,125,.0627451)',
                    borderColor: '#6c757d',
                    data: $scope.chartData.TOTAL_DECEASED
                }]
            },
        });
    }

    $scope.changeChartDisplayToDaily = function () {

        $scope.currentChartType = 'bar';

        if (confirmedChart !== undefined)
            confirmedChart.destroy();
        if (activeChart !== undefined)
            activeChart.destroy();
        if (deceasedChart !== undefined)
            deceasedChart.destroy();
        if (recoveredChart !== undefined)
            recoveredChart.destroy();

        const ctxConfirmed = document.getElementById('confirmedChart').getContext('2d');
        confirmedChart = new Chart(ctxConfirmed, {

            type: 'bar',
            data: {
                labels: $scope.chartData.LABEL,
                datasets: [{
                    label: 'Confirmed Cases',
                    backgroundColor: '#ff073aaa',
                    data: $scope.chartData.CONFIRMED
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        barPercentage: 0.4
                    }]
                }
            }
        });

        const ctxActive = document.getElementById('activeChart').getContext('2d');
        activeChart = new Chart(ctxActive, {

            type: 'bar',
            data: {
                labels: $scope.chartData.LABEL,
                datasets: [{
                    label: 'Active Cases',
                    backgroundColor: '#007bffaa',
                    data: $scope.chartData.ACTIVE
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        barPercentage: 0.4
                    }]
                }
            }
        });

        const ctxRecovered = document.getElementById('recoveredChart').getContext('2d');
        recoveredChart = new Chart(ctxRecovered, {

            type: 'bar',
            data: {
                labels: $scope.chartData.LABEL,
                datasets: [{
                    label: 'Recovered Cases',
                    backgroundColor: '#28a745aa',
                    data: $scope.chartData.RECOVERED
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        barPercentage: 0.4
                    }]
                }
            }
        });

        const ctxDeceased = document.getElementById('deceasedChart').getContext('2d');
        deceasedChart = new Chart(ctxDeceased, {

            type: 'bar',
            data: {
                labels: $scope.chartData.LABEL,
                datasets: [{
                    label: 'Deceased Cases',
                    backgroundColor: '#6c757daa',
                    data: $scope.chartData.DECEASED
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        barPercentage: 0.4
                    }]
                }
            }
        });
    }

    $scope.generateStateReport = function (stateName) {

        $http.get('https://api.covid19india.org/state_district_wise.json\n')
            .then(
                function (result) {
                    const stateData = result.data[stateName].districtData;
                    const fileName = `${stateName.split(' ').join('_')}_report.txt`;

                    let data = `DISTRICT WISE CASE REPORT OF ${stateName.toUpperCase()}\n\n`;
                    for (const district in stateData) {
                        const notes = stateData[district].notes === '' ? 'No' : stateData[district].notes;

                        data = data + `DISTRICT NAME : ${district}\n`;
                        data = data + `TOTAL CONFIRMED CASES : ${CommonFunc.formatNumber(stateData[district].confirmed)}\n`;
                        data = data + `TOTAL ACTIVE CASES : ${CommonFunc.formatNumber(stateData[district].active)}\n`;
                        data = data + `TOTAL RECOVERED CASES : ${CommonFunc.formatNumber(stateData[district].recovered)}\n`;
                        data = data + `TOTAL DECEASED CASES : ${CommonFunc.formatNumber(stateData[district].deceased)}\n`;
                        data = data + `ANY OTHER NOTES: ${notes}\n\n`;
                    }

                    $http.get('https://api.covid19india.org/resources/resources.json')
                        .then(
                            function (result) {

                                const resources = result.data.resources;
                                data = data + `OTHER USEFUL RESOURCES\n\n`;

                                for (let iterator = 0; iterator < resources.length; iterator++) {

                                    const resource = resources[iterator];
                                    if (resource.state === stateName) {

                                        data = data + `CATEGORY OF RESOURCE(TYPE): ${resource.category}\n`;
                                        data = data + `CITY: ${resource.city}\n`;
                                        data = data + `NAME OF THE ORGANISATION: ${resource.nameoftheorganisation}\n`;
                                        data = data + `DESCRIPTION OF THE RESOURCE GIVEN BY ORGANISATION: ${resource.descriptionandorserviceprovided}\n`;
                                        data = data + `CONTACT: ${resource.contact}\n`;
                                        data = data + `PHONE NUMBER: ${resource.phonenumber}\n\n`;
                                    }
                                }
                                CommonFunc.generateDownload(fileName, data);

                            },
                            function (error, status) {
                                console.log(error);
                                console.log(status);
                            }
                        );
                },
                function (error, status) {
                    console.log(error);
                    console.log(status);
                }
            );
    }
});

app.controller('assessYourselfPageCtrl', function ($scope, $http) {

    $scope.request = {
        method: 'POST',
        url: 'https://api.infermedica.com/covid19/diagnosis',
        headers: {
            'App-Id': ConfigDetails.configAPI.ID,
            'App-Key': ConfigDetails.configAPI.KEY,
            'Content-Type': 'application/json'
        },
        data: {
            'sex': undefined,
            'age': undefined,
            'evidence': []
        }
    }

    $scope.questionCount = 0;
    $scope.answeredQuestion = [];

    $scope.setRequestGender = function (gender) {
        if ($scope.request.data['sex'] === undefined) {
            $scope.request.data['sex'] = gender;
            document.querySelector('#ageQues').style.display = 'block';
            CommonFunc.scrollIntoNewElementView();
        }
    }

    $scope.setRequestAge = function () {
        if ($scope.request.data['age'] === undefined) {
            const ageInput = parseInt(document.querySelector('#ageInput').value);

            if (document.querySelector('#ageInput').value === '') {
                alert('Please enter you age to proceed!!');
                document.querySelector('#ageInput').focus();
                return;
            }
            else if (ageInput < 0) {
                alert('Age cannot be negative!!');
                document.querySelector('#ageInput').focus();
                return;
            }

            $scope.request.data['age'] = ageInput;
            $scope.requestAPI();
        }
    }

    $scope.singleAnswer = function (event) {
        const parentDiv = event.target.parentElement;

        if ($scope.answeredQuestion.includes(parentDiv.id))
            return;

        const inputElement = event.target;
        $scope.request.data['evidence'].push({
            "id": inputElement.getAttribute('question-id'),
            "choice_id": inputElement.getAttribute('name')
        });
        $scope.answeredQuestion.push(parentDiv.id);
        $scope.requestAPI();
    };

    $scope.groupSingleAnswer = function (event) {
        const parentDiv = event.target.parentElement;

        if ($scope.answeredQuestion.includes(parentDiv.id))
            return;

        const inputElement = event.target;
        $scope.request.data['evidence'].push({
            "id": inputElement.getAttribute('question-id'),
            "choice_id": "present"
        });
        $scope.answeredQuestion.push(parentDiv.id);
        $scope.requestAPI();
    }

    $scope.groupMultipleAnswer = function (event) {
        const parentDiv = event.target.parentElement;

        if ($scope.answeredQuestion.includes(parentDiv.id))
            return;

        const checkBoxElements = parentDiv.querySelectorAll('input[type="checkbox"]');
        for (let iterator = 0; iterator < checkBoxElements.length; iterator++) {

            const checkBoxElement = checkBoxElements[iterator];
            if (checkBoxElement.checked) {
                $scope.request.data['evidence'].push({
                    "id": checkBoxElement.id,
                    "choice_id": "present"
                });
            } else {
                $scope.request.data['evidence'].push({
                    "id": checkBoxElement.id,
                    "choice_id": "absent"
                });
            }
        }
        $scope.answeredQuestion.push(parentDiv.id);
        $scope.requestAPI();
    }

    $scope.endAssessment = function (result) {
        let finalAPIRequest = $scope.request;
        finalAPIRequest.url = "https://api.infermedica.com/covid19/triage";

        $http(finalAPIRequest).then(
            function (response) {
                CommonFunc.printFinalReport(response.data);
                CommonFunc.scrollIntoNewElementView();
            },
            function (error, status) {
                console.log(error);
                console.log(status);
            }
        )
    }

    $scope.requestAPI = function () {
        $http($scope.request).then(
            function (result) {
                if (result.data.should_stop) {
                    $scope.endAssessment(result);
                } else {
                    CommonFunc.addQuestionToDOM(result.data.question, $scope.questionCount++);
                    CommonFunc.scrollIntoNewElementView();
                }
            },
            function (error, status) {
                console.log(error);
                console.log(status);
            }
        )
    }

});

app.controller("worldTableDataCtrl", function ($scope, $http) {
    $scope.countryData = [];

    $http.get("https://api.covid19api.com/summary").then(
        function (result) {
            $scope.worldData = [];

            //World Data
            $scope.worldData.push({
                CASE_TYPE: "Confirmed",
                CASE_COUNT: CommonFunc.formatNumber(result.data.Global.TotalConfirmed),
                CSS: "confirmedData",
            });
            $scope.worldData.push({
                CASE_TYPE: "Active",
                CASE_COUNT: CommonFunc.formatNumber(
                    result.data.Global.TotalConfirmed -
                    (result.data.Global.TotalDeaths + result.data.Global.TotalRecovered)
                ),
                CSS: "activeData",
            });
            $scope.worldData.push({
                CASE_TYPE: "Recovered",
                CASE_COUNT: CommonFunc.formatNumber(result.data.Global.TotalRecovered),
                CSS: "recoveredData",
            });
            $scope.worldData.push({
                CASE_TYPE: "Deceased",
                CASE_COUNT: CommonFunc.formatNumber(result.data.Global.TotalDeaths),
                CSS: "deceasedData",
            });
            //console.log(result);
            const countries = result.data.Countries;
            for (let iterator = 1; iterator < countries.length; iterator++) {
                const countryObj = countries[iterator];
                $scope.countryData.push({
                    NAME: countryObj.Country,
                    CONFIRMED: countryObj.TotalConfirmed,
                    ACTIVE:
                        countryObj.TotalConfirmed -
                        (countryObj.TotalDeaths + countryObj.TotalRecovered),
                    DEATHS: countryObj.TotalDeaths,
                    RECOVERED: countryObj.TotalRecovered,
                })
            }
        },
        function (error, status) {
            console.log(error);
            console.log(status);
        }
    );

    // column to sort
    $scope.column = "CONFIRMED";

    // sort ordering (Ascending or Descending). Set true for desending
    $scope.reverse = true;

    // called on header click
    $scope.sortColumn = function (col) {
        $scope.column = col;
        if ($scope.reverse) {
            $scope.reverse = false;
            $scope.reverseclass = "arrow-up";
        } else {
            $scope.reverse = true;
            $scope.reverseclass = "arrow-down";
        }
    };

    // remove and change class
    $scope.sortClass = function (col) {
        if ($scope.column == col) {
            if ($scope.reverse) {
                return "arrow-down";
            } else {
                return "arrow-up";
            }
        } else {
            return "";
        }
    };
});

app.controller('knowMorePageCtrl', function($scope, $http){

    $scope.dataList = '';
    $http.get('https://api.covid19india.org/state_district_wise.json').then(
        function(result){
            for(const state in result.data) {
                const currentStateData = result.data[state].districtData;
                for (const district in currentStateData) {
                    let html =`<option value="${district}">`;
                    $scope.dataList = $scope.dataList + html;
                }
            }
            const dataList = document.querySelector('#cityList');
            dataList.insertAdjacentHTML('beforeend', $scope.dataList);
        },
        function(error, status){
            cosole.log(error);
            console.log(status);
        }
    );

    $scope.searchBar = function(){
        const searchText = document.querySelector('#searchField').value;
        const caseData = [];

        $http.get('https://api.covid19india.org/state_district_wise.json').then(
            function(result){
                for(const state in result.data){
                    const currentStateData = result.data[state].districtData;

                    for(const district in currentStateData){
                        if(district.toLowerCase() === searchText.toLowerCase()){

                            caseData.push(
                                {
                                    CASE_TYPE: "Confirmed",
                                    CASE_COUNT: CommonFunc.formatNumber(currentStateData[district].confirmed),
                                    CSS: "confirmedData"
                                }
                            );
                            caseData.push(
                                {
                                    CASE_TYPE: "Active",
                                    CASE_COUNT: CommonFunc.formatNumber(currentStateData[district].active),
                                    CSS: "activeData"
                                }
                            );
                            caseData.push(
                                {
                                    CASE_TYPE: "Recovered",
                                    CASE_COUNT: CommonFunc.formatNumber(currentStateData[district].recovered),
                                    CSS: "recoveredData"
                                }
                            );
                            caseData.push(
                                {
                                    CASE_TYPE: "Deceased",
                                    CASE_COUNT: CommonFunc.formatNumber(currentStateData[district].deceased),
                                    CSS: "deceasedData"
                                }
                            );
                        }
                    }
                }

                // Clearing div
                document.querySelector('#cityData').innerHTML = '';

                if(caseData.length === 0){
                    CommonFunc.noResultFound(searchText);
                    document.querySelector('#searchField').value = '';
                    return;
                }

                $http.get('https://api.covid19india.org/resources/resources.json').then(
                    function(result){
                        const resources = result.data.resources;
                        const requiredRes = [];
                        for(let iterator = 0 ; iterator < resources.length; iterator++){
                            if(resources[iterator].city.toLowerCase() === searchText.toLowerCase()){
                                requiredRes.push({
                                    CATEGORY: resources[iterator].category,
                                    DESCRIPTION: resources[iterator].descriptionandorserviceprovided,
                                    ORGANISATION: resources[iterator].nameoftheorganisation,
                                    CONTACT: resources[iterator].contact,
                                    PHONE: resources[iterator].phonenumber
                                });
                            }
                        }
                        CommonFunc.putCityData(searchText, caseData, requiredRes);
                        document.querySelector('#searchField').value = '';
                    },
                    function(error, status){
                        console.log(error);
                        console.log(status);
                    }
                );
            },
            function(error, status){
                console.log(error);
                console.log(status);
            }
        );
    }
})