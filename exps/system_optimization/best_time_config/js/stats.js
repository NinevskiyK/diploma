var stats = {
    type: "GROUP",
name: "Global Information",
path: "",
pathFormatted: "group_missing-name-b06d1",
stats: {
    "name": "Global Information",
    "numberOfRequests": {
        "total": "120300",
        "ok": "57670",
        "ko": "62630"
    },
    "minResponseTime": {
        "total": "3",
        "ok": "3",
        "ko": "872"
    },
    "maxResponseTime": {
        "total": "1851",
        "ok": "1723",
        "ko": "1851"
    },
    "meanResponseTime": {
        "total": "915",
        "ok": "892",
        "ko": "936"
    },
    "standardDeviation": {
        "total": "283",
        "ok": "403",
        "ko": "55"
    },
    "percentiles1": {
        "total": "929",
        "ok": "1065",
        "ko": "926"
    },
    "percentiles2": {
        "total": "1067",
        "ok": "1098",
        "ko": "928"
    },
    "percentiles3": {
        "total": "1136",
        "ok": "1168",
        "ko": "969"
    },
    "percentiles4": {
        "total": "1224",
        "ok": "1251",
        "ko": "1124"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 10864,
        "percentage": 9
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 45261,
        "percentage": 38
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 1545,
        "percentage": 1
    },
    "group4": {
        "name": "failed",
        "count": 62630,
        "percentage": 52
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "199.834",
        "ok": "95.797",
        "ko": "104.037"
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
        "ok": "57670",
        "ko": "62630"
    },
    "minResponseTime": {
        "total": "3",
        "ok": "3",
        "ko": "872"
    },
    "maxResponseTime": {
        "total": "1851",
        "ok": "1723",
        "ko": "1851"
    },
    "meanResponseTime": {
        "total": "915",
        "ok": "892",
        "ko": "936"
    },
    "standardDeviation": {
        "total": "283",
        "ok": "403",
        "ko": "55"
    },
    "percentiles1": {
        "total": "929",
        "ok": "1065",
        "ko": "926"
    },
    "percentiles2": {
        "total": "1067",
        "ok": "1098",
        "ko": "928"
    },
    "percentiles3": {
        "total": "1136",
        "ok": "1168",
        "ko": "969"
    },
    "percentiles4": {
        "total": "1224",
        "ok": "1251",
        "ko": "1124"
    },
    "group1": {
        "name": "t < 800 ms",
        "count": 10864,
        "percentage": 9
    },
    "group2": {
        "name": "800 ms < t < 1200 ms",
        "count": 45261,
        "percentage": 38
    },
    "group3": {
        "name": "t > 1200 ms",
        "count": 1545,
        "percentage": 1
    },
    "group4": {
        "name": "failed",
        "count": 62630,
        "percentage": 52
    },
    "meanNumberOfRequestsPerSecond": {
        "total": "199.834",
        "ok": "95.797",
        "ko": "104.037"
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
