package gatling_like;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

public class gatling_like extends Simulation {
  // Add the HttpProtocolBuilder:
  HttpProtocolBuilder httpProtocol = http.baseUrl("http://127.0.0.1:1234");

  ScenarioBuilder myScenario = scenario("My Scenario")
    .exec(http("Request 1").get("/sleep?time=10").check(status().is(200)));
  {
        List<Integer> usersPerSecList = Arrays.asList(1, 6, 16, 36, 86, 186);
        Duration duration = Duration.ofSeconds(60 * 5);
    setUp(
      myScenario.injectOpen(
                usersPerSecList.stream()
                .map(usersPerSec -> constantUsersPerSec(usersPerSec).during(duration).randomized())
                .collect(Collectors.toList())
      )
    ).protocols(httpProtocol);
  }
}
