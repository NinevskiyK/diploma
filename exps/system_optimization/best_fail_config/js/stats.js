var stats = {
    type: "GROUP",
name: "Global Information",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "Global Information",
    "numberOfRequests": {
        "total": "120300",
        "ok": "58357",
        "ko": "61943"
    },
    "minResponseTime": {
        "total": "3",
        "ok": "3",
        "ko": "10000"
    },
    "maxResponseTime": {
        "total": "51903",
        "ok": "51903",
        "ko": "51730"
    },
    "meanResponseTime": {
        "total": "22314",
        "ok": "21872",
        "ko": "22731"
    },
    "standardDeviation": {
        "total": "12890",
        "ok": "14370",
        "ko": "11306"
    },
    "percentiles1": {
        "total": "18904",
        "ok": "17948",
        "ko": "18908"
    },
    "percentiles2": {
        "total": "35381",
        "ok": "36081",
        "ko": "35100"
    },
    "percentiles3": {
        "total": "42142",
        "ok": "42277",
        "ko": "41944"
    },
    "percentiles4": {
        "total": "45404",
        "ok": "45643",
        "ko": "44514"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 9344,
        "percentage": 8
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 164,
        "percentage": 0
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 48849,
        "percentage": 41
    },
    "group4": {
        "name": "failed",
        "count": 61943,
        "percentage": 51
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "187.092",
        "ok": "90.757",
        "ko": "96.334"
    }
},
contents: {
"req_front-page-078e2": {
        type: "REQUEST",
        name: "Front page",
path: "Front page",
pathFormatted: "req_front-page-078e2",
stats: {
    "name": "Front page",
    "numberOfRequests": {
        "total": "120300",
        "ok": "58357",
        "ko": "61943"
    },
    "minResponseTime": {
        "total": "3",
        "ok": "3",
        "ko": "10000"
    },
    "maxResponseTime": {
        "total": "51903",
        "ok": "51903",
        "ko": "51730"
    },
    "meanResponseTime": {
        "total": "22314",
        "ok": "21872",
        "ko": "22731"
    },
    "standardDeviation": {
        "total": "12890",
        "ok": "14370",
        "ko": "11306"
    },
    "percentiles1": {
        "total": "18905",
        "ok": "17949",
        "ko": "18907"
    },
    "percentiles2": {
        "total": "35381",
        "ok": "36081",
        "ko": "35100"
    },
    "percentiles3": {
        "total": "42143",
        "ok": "42277",
        "ko": "41951"
    },
    "percentiles4": {
        "total": "45404",
        "ok": "45643",
        "ko": "44517"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 9344,
        "percentage": 8
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 164,
        "percentage": 0
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 48849,
        "percentage": 41
    },
    "group4": {
        "name": "failed",
        "count": 61943,
        "percentage": 51
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "187.092",
        "ok": "90.757",
        "ko": "96.334"
    }
}
    }
}

}

function fillStats(stat){
    $("#numberOfRequests").append(stat.numberOfRequests.total);
    $("#numberOfRequestsOK").append(stat.numberOfRequests.ok);
    $("#numberOfRequestsKO").append(stat.numberOfRequests.ko);

    $("#minResponseTime").append(stat.minResponseTime.total);
    $("#minResponseTimeOK").append(stat.minResponseTime.ok);
    $("#minResponseTimeKO").append(stat.minResponseTime.ko);

    $("#maxResponseTime").append(stat.maxResponseTime.total);
    $("#maxResponseTimeOK").append(stat.maxResponseTime.ok);
    $("#maxResponseTimeKO").append(stat.maxResponseTime.ko);

    $("#meanResponseTime").append(stat.meanResponseTime.total);
    $("#meanResponseTimeOK").append(stat.meanResponseTime.ok);
    $("#meanResponseTimeKO").append(stat.meanResponseTime.ko);

    $("#standardDeviation").append(stat.standardDeviation.total);
    $("#standardDeviationOK").append(stat.standardDeviation.ok);
    $("#standardDeviationKO").append(stat.standardDeviation.ko);

    $("#percentiles1").append(stat.percentiles1.total);
    $("#percentiles1OK").append(stat.percentiles1.ok);
    $("#percentiles1KO").append(stat.percentiles1.ko);

    $("#percentiles2").append(stat.percentiles2.total);
    $("#percentiles2OK").append(stat.percentiles2.ok);
    $("#percentiles2KO").append(stat.percentiles2.ko);

    $("#percentiles3").append(stat.percentiles3.total);
    $("#percentiles3OK").append(stat.percentiles3.ok);
    $("#percentiles3KO").append(stat.percentiles3.ko);

    $("#percentiles4").append(stat.percentiles4.total);
    $("#percentiles4OK").append(stat.percentiles4.ok);
    $("#percentiles4KO").append(stat.percentiles4.ko);

    $("#meanNumberOfRequestsPerSecond").append(stat.meanNumberOfRequestsPerSecond.total);
    $("#meanNumberOfRequestsPerSecondOK").append(stat.meanNumberOfRequestsPerSecond.ok);
    $("#meanNumberOfRequestsPerSecondKO").append(stat.meanNumberOfRequestsPerSecond.ko);
}
