import salabim as sim

LATENCY = 1.0027235349019368
EXP_TIME = 10
NUMBER = 10

class UserGenerator(sim.Component):
    def process(self):
        for _ in range(NUMBER):
            User()

class User(sim.Component):
    def process(self):
        self.enter(waitingline)
        if service.ispassive():
            service.activate()
        self.passivate()

class Service(sim.Component):
    def process(self):
        while True:
            while len(waitingline) == 0:
                self.passivate()
            self.hold(LATENCY)
            user = waitingline.pop()
            user.activate()

env = sim.Environment(trace=True)

UserGenerator()
service = Service()
waitingline = sim.Queue("waitingline")

env.run(till=EXP_TIME)
print()
waitingline.print_statistics()
