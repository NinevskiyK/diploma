var stats = {
    type: "GROUP",
name: "Global Information",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "Global Information",
    "numberOfRequests": {
        "total": "120300",
        "ok": "43215",
        "ko": "77085"
    },
    "minResponseTime": {
        "total": "1",
        "ok": "5",
        "ko": "1"
    },
    "maxResponseTime": {
        "total": "28257",
        "ok": "28257",
        "ko": "25766"
    },
    "meanResponseTime": {
        "total": "11652",
        "ok": "11218",
        "ko": "11895"
    },
    "standardDeviation": {
        "total": "6940",
        "ok": "6186",
        "ko": "7317"
    },
    "percentiles1": {
        "total": "13850",
        "ok": "14041",
        "ko": "13849"
    },
    "percentiles2": {
        "total": "14201",
        "ok": "14125",
        "ko": "16004"
    },
    "percentiles3": {
        "total": "22370",
        "ok": "19513",
        "ko": "22896"
    },
    "percentiles4": {
        "total": "24519",
        "ok": "23468",
        "ko": "24681"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 7112,
        "percentage": 6
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 344,
        "percentage": 0
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 35759,
        "percentage": 30
    },
    "group4": {
        "name": "failed",
        "count": 77085,
        "percentage": 64
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "195.928",
        "ok": "70.383",
        "ko": "125.546"
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
        "ok": "43215",
        "ko": "77085"
    },
    "minResponseTime": {
        "total": "1",
        "ok": "5",
        "ko": "1"
    },
    "maxResponseTime": {
        "total": "28257",
        "ok": "28257",
        "ko": "25766"
    },
    "meanResponseTime": {
        "total": "11652",
        "ok": "11218",
        "ko": "11895"
    },
    "standardDeviation": {
        "total": "6940",
        "ok": "6186",
        "ko": "7317"
    },
    "percentiles1": {
        "total": "13850",
        "ok": "14041",
        "ko": "13849"
    },
    "percentiles2": {
        "total": "14202",
        "ok": "14125",
        "ko": "16004"
    },
    "percentiles3": {
        "total": "22372",
        "ok": "19513",
        "ko": "22896"
    },
    "percentiles4": {
        "total": "24519",
        "ok": "23468",
        "ko": "24681"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 7112,
        "percentage": 6
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 344,
        "percentage": 0
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 35759,
        "percentage": 30
    },
    "group4": {
        "name": "failed",
        "count": 77085,
        "percentage": 64
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "195.928",
        "ok": "70.383",
        "ko": "125.546"
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
