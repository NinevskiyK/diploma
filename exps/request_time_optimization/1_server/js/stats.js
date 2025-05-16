var stats = {
    type: "GROUP",
name: "Global Information",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "Global Information",
    "numberOfRequests": {
        "total": "120300",
        "ok": "61722",
        "ko": "58578"
    },
    "minResponseTime": {
        "total": "3",
        "ok": "3",
        "ko": "9299"
    },
    "maxResponseTime": {
        "total": "28403",
        "ok": "28403",
        "ko": "26154"
    },
    "meanResponseTime": {
        "total": "10619",
        "ok": "9419",
        "ko": "11883"
    },
    "standardDeviation": {
        "total": "5392",
        "ok": "6167",
        "ko": "4064"
    },
    "percentiles1": {
        "total": "10002",
        "ok": "10814",
        "ko": "10001"
    },
    "percentiles2": {
        "total": "12430",
        "ok": "13260",
        "ko": "10002"
    },
    "percentiles3": {
        "total": "19901",
        "ok": "18286",
        "ko": "20126"
    },
    "percentiles4": {
        "total": "24367",
        "ok": "21970",
        "ko": "26117"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 13532,
        "percentage": 11
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 269,
        "percentage": 0
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 47921,
        "percentage": 40
    },
    "group4": {
        "name": "failed",
        "count": 58578,
        "percentage": 49
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "194.66",
        "ok": "99.874",
        "ko": "94.786"
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
        "ok": "61722",
        "ko": "58578"
    },
    "minResponseTime": {
        "total": "3",
        "ok": "3",
        "ko": "9299"
    },
    "maxResponseTime": {
        "total": "28403",
        "ok": "28403",
        "ko": "26154"
    },
    "meanResponseTime": {
        "total": "10619",
        "ok": "9419",
        "ko": "11883"
    },
    "standardDeviation": {
        "total": "5392",
        "ok": "6167",
        "ko": "4064"
    },
    "percentiles1": {
        "total": "10002",
        "ok": "10814",
        "ko": "10001"
    },
    "percentiles2": {
        "total": "12430",
        "ok": "13260",
        "ko": "10002"
    },
    "percentiles3": {
        "total": "19901",
        "ok": "18286",
        "ko": "20126"
    },
    "percentiles4": {
        "total": "24367",
        "ok": "21970",
        "ko": "26117"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 13532,
        "percentage": 11
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 269,
        "percentage": 0
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 47921,
        "percentage": 40
    },
    "group4": {
        "name": "failed",
        "count": 58578,
        "percentage": 49
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "194.66",
        "ok": "99.874",
        "ko": "94.786"
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
