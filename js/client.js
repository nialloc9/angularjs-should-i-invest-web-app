var app = angular.module('app', ['ngRoute', 'ngCookies']);
//TODO: Cookies to check if user came to page before. If they did say welcome back. Other wise say 'We see that this is your first visit. Welcome to the site blah blah'

//app config.. routes
app.config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/', {
            templateUrl: 'templates/landingPage.html'
        });
}]);

//controller
app.controller('landingPageCtrl', ['$scope', '$location', '$cookies', '$http', function($scope, $location, $cookies, $http){
        confirm("This is a portfolio piece for OCWebTech.com. Please do not use recommendations from this site. Thank you for viewing.");

        //set timestamp
        var date = new Date();
        var history = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

        //set msg
        $scope.msg = "Welcome. We see this is your first visit. Take your time to look around and be sure to leave some feedback.";
        $scope.history = '';
        if($cookies.get('history') != null){
            $scope.msg = "Hey, welome back. Thanks for coming back. We see this is your first visit since ";
            $scope.history = $cookies.get('history');

            //set new history cookie
            $cookies.put('history', history);
        }else{
            $cookies.put('history', history);
        }

        $scope.userTickerInputBtnClick = function(){
                $http.get(
                        "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22"+$scope.UserInputTicker.toUpperCase()+"%22,%22AAPL%22)&format=json&env=http://datatables.org/alltables.env"
                ).then(function(response){
                        var results =response.data.query.results.quote[0];

                        //add to scope
                        $scope.companyStockPrice = (results.LastTradeWithTime != null) ? results.LastTradeWithTime : "NA";
                        $scope.companyName = (results.Name != null) ? results.Name : "NA";
                        $scope.companyPreviousClose = (results.PreviousClose != null) ? results.PreviousClose : "NA";
                        $scope.companyStockChange = (results.Change != null) ? results.Change : "NA";
                        $scope.companyStockCurrency = results.Currency; (results.Change != null) ? results.Change : "NA";
                        $scope.companyDividendShare = (results.DividendShare != null) ? results.DividendShare : "NA";
                        $scope.companyDividendYield = (results.DividendYield != null) ? results.DividendYield : "NA"; //how much company pays out relative to share price each year
                        $scope.companyDividendPayDate = (results.DividendPayDate != null) ? results.DividendPayDate : "NA";
                        $scope.companyEBITDA = (results.EBITDA != null) ? results.EBITDA : "NA"; //earnings after tax etc
                        $scope.companyEPSEstimateCurrentYr = (results.EPSEstimateCurrentYear != null) ? results.EPSEstimateCurrentYear : "NA";
                        $scope.companyEPSEstimateNextQuarter = (results.EPSEstimateNextQuarter != null) ? results.EPSEstimateNextQuarter : "NA";
                        $scope.companyEPSEstimateNextYear = (results.EPSEstimateNextYear != null) ? results.EPSEstimateNextYear : "NA";
                        $scope.companyPEGRatio = (results.PEGRatio != null) ? results.PEGRatio : "NA"; //Profits to earnings to growth ratio less than one is good
                        $scope.companyYearRange = (results.YearRange != null) ? results.YearRange : "NA";
                        $scope.companySymbol = (results.Symbol != null) ? results.Symbol : "NA";

                        //work out if open
                        if($scope.companyOpen != null){
                                $scope.companyOpen = "Open";
                                $scope.openColor = "positiveResult";
                        }else{
                                $scope.companyOpen = "Closed";
                                $scope.openColor = "negativeResult";
                        }

                        $scope.changeColor = ($scope.companyStockChange > 0) ? "positiveResult" : "negativeResult";

                        //do calculations
                        $scope.doCalculations();

                        //show results
                        $scope.showResult = true;
                });
        }

        //company data
        $scope.companyStockPrice = "NA";
        $scope.companyName = "NA";
        $scope.companyPreviousClose = "NA";
        $scope.companyStockChange = "NA";
        $scope.companyStockCurrency = "NA";
        $scope.companyDividendShare = "NA";
        $scope.companyDividendYield = "NA";
        $scope.companyDividendPayDate = "NA";
        $scope.companyEBITDA = "NA";
        $scope.companyEPSEstimateCurrentYr = "NA";
        $scope.companyEPSEstimateNextQuarter = "NA";
        $scope.companyEPSEstimateNextYear = "NA";
        $scope.companyPEGRatio = "NA";
        $scope.companyYearRange = "NA";
        $scope.companySymbol = "NA";
        $scope.companyBeta = "NA";

        $scope.debtRatio = "NA";
        $scope.currentRatio = "NA";

        //show results
        $scope.showResult = false;

        $scope.recommendation = 0;

        //styling
        $scope.debtRatioRatingColor = "";
        $scope.currentRatioRatingColor = "";
        $scope.openColor = "";
        $scope.betaColor = "";
        $scope.totalDividendColor = "";
        $scope.changeColor = "";
        $scope.PEGColor = "";
        $scope.resultColor = "";

        $scope.calculateStockRecommendation = function(){
                if($scope.debtRatio < 0.4){
                        $scope.recommendation = $scope.recommendation + 3.5;
                }

                if($scope.noOfYearlyDividends > 4){
                        $scope.totalDividendColor = "positiveResult";
                        $scope.recommendation = $scope.recommendation + 2;
                }else{
                        $scope.totalDividendColor = "negativeResult";
                }

                if(($scope.companyPEGRatio < 1.2) && ($scope.companyPEGRatio > 0)){
                        $scope.recommendation = $scope.recommendation + 3.5;
                        $scope.PEGColor = "positiveResult";
                }else{
                        $scope.PEGColor = "negativeResult";
                }

                if($scope.companyBeta < 1){
                        $scope.recommendation = $scope.recommendation + 1;
                        $scope.betaColor = "positiveResult";
                }else{
                        $scope.betaColor = "negativeResult";
                }

                //stlyinh
                $scope.resultColor = ($scope.recommendation > 5) ? "positiveResult" : "negativeResult";

                console.log("Recommendation = (debt ratio: " + $scope.debtRatio + ") + (Number of yearly dividends: " + $scope.noOfYearlyDividends + ") + (PEG ratio: " + $scope.companyPEGRatio + ") + Beta: (" + $scope.companyBeta + ")");

        }

        $scope.doCalculations = function(){
                //reset value
                $scope.recommendation = 0;
                $scope.noOfYearlyDividends = 0;
                $scope.totalDividend = 0;

                //dividend1
                if((!isNaN($scope.dividendYr1)) && ($scope.dividendYr1 > 0)){
                        $scope.totalDividend = $scope.totalDividend  + $scope.dividendYr1;
                        $scope.noOfYearlyDividends++;
                }

                //dividend2
                if((!isNaN($scope.dividendYr2)) && ($scope.dividendYr2 > 0)){
                        $scope.totalDividend = $scope.totalDividend  + $scope.dividendYr2;
                        $scope.noOfYearlyDividends++;
                }

                //dividend3
                if((!isNaN($scope.dividendYr3)) && ($scope.dividendYr3 > 0)){
                        $scope.totalDividend = $scope.totalDividend  + $scope.dividendYr3;
                        $scope.noOfYearlyDividends++;
                }

                //dividend4
                if((!isNaN($scope.dividendYr4)) && ($scope.dividendYr4 > 0)){
                        $scope.totalDividend = $scope.totalDividend  + $scope.dividendYr4;
                        $scope.noOfYearlyDividends++;
                }

                //dividend5
                if((!isNaN($scope.dividendYr5)) && ($scope.dividendYr5 > 0)){
                        $scope.totalDividend = $scope.totalDividend  + $scope.dividendYr5;
                        $scope.noOfYearlyDividends++;
                }

                //dividend6
                if((!isNaN($scope.dividendYr6)) && ($scope.dividendYr6 > 0)){
                        $scope.totalDividend = $scope.totalDividend  + $scope.dividendYr6;
                        $scope.noOfYearlyDividends++;
                }

                //dividend7
                if((!isNaN($scope.dividendYr7)) && ($scope.dividendYr7 > 0)){
                        $scope.totalDividend = $scope.totalDividend  + $scope.dividendYr7;
                        $scope.noOfYearlyDividends++;
                }

                //get yearly average dividend
                $scope.yearlyAverageDividend = ($scope.noOfYearlyDividends > 0) ? ($scope.totalDividend / $scope.noOfYearlyDividends) : "NA";

                //getQuarters
                $scope.noOfQuarterDividends =  ($scope.noOfYearlyDividends > 0) ? ($scope.noOfYearlyDividends * 4) : 0;

                //get quarterly average dividend
                $scope.quarterlyAverageDividend = ($scope.noOfYearlyDividends > 0) ? ($scope.totalDividend / $scope.noOfQuarterDividends) : "NA";

                //get debt and current ratio
                if(($scope.companyAssets > 0) && ($scope.companyLiabilities > 0)){
                        //set debt ratio
                        $scope.debtRatio = $scope.companyLiabilities / $scope.companyAssets;
                        $scope.debtRatioRatingColor = ($scope.debtRatio < 1) ? "positiveResult": "negativeResult";

                        //set current ratio
                        $scope.currentRatio = $scope.companyAssets / $scope.companyLiabilities;
                        $scope.currentRatioRatingColor = ($scope.currentRatio > 1) ? "positiveResult": "negativeResult";
                }

                $scope.recommendation = 0;
                $scope.calculateStockRecommendation();
        }
}]);
