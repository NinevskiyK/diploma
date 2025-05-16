var stats = {
    type: "GROUP",
name: "Global Information",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "Global Information",
    "numberOfRequests": {
        "total": "237088",
        "ok": "206489",
        "ko": "30599"
    },
    "minResponseTime": {
        "total": "12",
        "ok": "12",
        "ko": "10004"
    },
    "maxResponseTime": {
        "total": "10004",
        "ok": "8812",
        "ko": "10004"
    },
    "meanResponseTime": {
        "total": "4559",
        "ok": "3752",
        "ko": "10004"
    },
    "standardDeviation": {
        "total": "4200",
        "ok": "3900",
        "ko": "0"
    },
    "percentiles1": {
        "total": "6345",
        "ok": "1146",
        "ko": "10004"
    },
    "percentiles2": {
        "total": "8262",
        "ok": "8149",
        "ko": "10004"
    },
    "percentiles3": {
        "total": "10004",
        "ok": "8371",
        "ko": "10004"
    },
    "percentiles4": {
        "total": "10004",
        "ok": "8504",
        "ko": "10004"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 100752,
        "percentage": 42
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 2786,
        "percentage": 1
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 102951,
        "percentage": 43
    },
    "group4": {
        "name": "failed",
        "count": 30599,
        "percentage": 13
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "197.573",
        "ok": "172.074",
        "ko": "25.499"
    }
},
contents: {
"req_request-10573": {
        type: "REQUEST",
        name: "request",
path: "request",
pathFormatted: "req_request-10573",
stats: {
    "name": "request",
    "numberOfRequests": {
        "total": "237088",
        "ok": "206489",
        "ko": "30599"
    },
    "minResponseTime": {
        "total": "12",
        "ok": "12",
        "ko": "10004"
    },
    "maxResponseTime": {
        "total": "10004",
        "ok": "8812",
        "ko": "10004"
    },
    "meanResponseTime": {
        "total": "4559",
        "ok": "3752",
        "ko": "10004"
    },
    "standardDeviation": {
        "total": "4200",
        "ok": "3900",
        "ko": "0"
    },
    "percentiles1": {
        "total": "6350",
        "ok": "1146",
        "ko": "10004"
    },
    "percentiles2": {
        "total": "8262",
        "ok": "8149",
        "ko": "10004"
    },
    "percentiles3": {
        "total": "10004",
        "ok": "8371",
        "ko": "10004"
    },
    "percentiles4": {
        "total": "10004",
        "ok": "8504",
        "ko": "10004"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 100752,
        "percentage": 42
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 2786,
        "percentage": 1
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 102951,
        "percentage": 43
    },
    "group4": {
        "name": "failed",
        "count": 30599,
        "percentage": 13
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "197.573",
        "ok": "172.074",
        "ko": "25.499"
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
