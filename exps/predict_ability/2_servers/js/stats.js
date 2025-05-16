var stats = {
    type: "GROUP",
name: "Global Information",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "Global Information",
    "numberOfRequests": {
        "total": "120300",
        "ok": "95792",
        "ko": "24508"
    },
    "minResponseTime": {
        "total": "4",
        "ok": "4",
        "ko": "9300"
    },
    "maxResponseTime": {
        "total": "26161",
        "ok": "23115",
        "ko": "26161"
    },
    "meanResponseTime": {
        "total": "5746",
        "ok": "4110",
        "ko": "12139"
    },
    "standardDeviation": {
        "total": "5451",
        "ok": "4413",
        "ko": "4290"
    },
    "percentiles1": {
        "total": "5909",
        "ok": "2347",
        "ko": "10001"
    },
    "percentiles2": {
        "total": "10001",
        "ok": "6911",
        "ko": "10005"
    },
    "percentiles3": {
        "total": "15537",
        "ok": "12923",
        "ko": "20291"
    },
    "percentiles4": {
        "total": "21910",
        "ok": "15499",
        "ko": "26123"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 42608,
        "percentage": 35
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 2159,
        "percentage": 2
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 51025,
        "percentage": 42
    },
    "group4": {
        "name": "failed",
        "count": 24508,
        "percentage": 20
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "195.928",
        "ok": "156.013",
        "ko": "39.915"
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
        "ok": "95792",
        "ko": "24508"
    },
    "minResponseTime": {
        "total": "4",
        "ok": "4",
        "ko": "9300"
    },
    "maxResponseTime": {
        "total": "26161",
        "ok": "23115",
        "ko": "26161"
    },
    "meanResponseTime": {
        "total": "5746",
        "ok": "4110",
        "ko": "12139"
    },
    "standardDeviation": {
        "total": "5451",
        "ok": "4413",
        "ko": "4290"
    },
    "percentiles1": {
        "total": "5909",
        "ok": "2344",
        "ko": "10001"
    },
    "percentiles2": {
        "total": "10001",
        "ok": "6911",
        "ko": "10005"
    },
    "percentiles3": {
        "total": "15537",
        "ok": "12923",
        "ko": "20291"
    },
    "percentiles4": {
        "total": "21910",
        "ok": "15499",
        "ko": "26123"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 42608,
        "percentage": 35
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 2159,
        "percentage": 2
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 51025,
        "percentage": 42
    },
    "group4": {
        "name": "failed",
        "count": 24508,
        "percentage": 20
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "195.928",
        "ok": "156.013",
        "ko": "39.915"
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
