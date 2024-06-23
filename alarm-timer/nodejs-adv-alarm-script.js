const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let alarms = [];

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// function displayCurrentTime() {
//   // issue: this will cover the input line, so the user won't see what they are typing, how to solve?
//   setInterval(() => {
//     const now = new Date();
//     rl.write(`\rCurrent time: ${now.toLocaleTimeString()}`);
//   }, 1000);
// }

async function setAlarm() {
  const dayOfWeek = await askQuestion(
    "\n Enter alarm day (0-6, where 0=Sunday, 6=Saturday): "
  );
  const hour = await askQuestion("\nEnter alarm hour (00-23): ");
  const minute = await askQuestion("\nEnter alarm minute (00-59): ");

  const now = new Date();
  const alarmTime = new Date(now);
  alarmTime.setDate(
    now.getDate() + ((7 - now.getDay() + parseInt(dayOfWeek)) % 7)
  );
  alarmTime.setHours(parseInt(hour));
  alarmTime.setMinutes(parseInt(minute));
  alarmTime.setSeconds(0);

  if (alarmTime < now) {
    alarmTime.setDate(alarmTime.getDate() + 7); // Set for next week if time has passed
  }

  const alarm = {
    time: alarmTime,
    snoozesLeft: 3,
  };

  alarms.push(alarm);

  console.log(`Alarm set for ${alarmTime.toLocaleString()}`);
}

function checkAlarms() {
  setInterval(() => {
    const now = new Date();
    alarms.forEach((alarm, index) => {
      const timeToAlarm = alarm.time - now;

      if (timeToAlarm <= 0) {
        console.log("\nAlarm ringing!!!! Beeeep Beeep Beeeep");
        handleSnooze(alarm, index);
      }
    });
  }, 1000);
}

async function handleSnooze(alarm, index) {
  if (alarm.snoozesLeft > 0) {
    const answer = await askQuestion(
      "Do you want to snooze the alarm?\n 1.Yes 2.No\n: "
    );
    switch (answer) {
      case "1":
        alarm.snoozesLeft -= 1;
        alarm.time.setMinutes(alarm.time.getMinutes() + 5);
        console.log(
          `Snooze activated. Alarm will ring again at ${alarm.time.toLocaleTimeString()}`
        );
        break;
      case "2":
        // alarms.splice(index, 1);
        break;
      default:
        console.log("Invalid choice. Alarm stopped.");
        alarms.splice(index, 1);
    }
  } else {
    console.log("No more snoozes left. Alarm stopped.");
    alarms.splice(index, 1);
  }
}

async function main() {
  //   displayCurrentTime();
  checkAlarms();

  while (true) {
    const action = await askQuestion(
      "\nChoose an action: \n1. Set an alarm \n2. Delete an alarm \n3. Exit \n4. Show all alarms\n"
    );

    if (action === "1") {
      await setAlarm();
    } else if (action === "2") {
      process.stdout.write(
        `\n${
          alarms.length === 0
            ? "No alarms set"
            : alarms
                .map(
                  (alarm, index) => `${index}: ${alarm.time.toLocaleString()}`
                )
                .join("\n")
        }\n`
      );
      const index = await askQuestion(
        "Enter the index of the alarm you want to delete: "
      );
      alarms.splice(parseInt(index), 1);
      console.log("Alarm deleted successfully.");
    } else if (action === "3") {
      rl.close();
      process.exit(0);
    } else if (action === "4") {
      process.stdout.write(
        `\n All alarms:\n ${
          alarms.length === 0
            ? "No alarms set"
            : alarms
                .map(
                  (alarm, index) => `${index}: ${alarm.time.toLocaleString()}`
                )
                .join("\n")
        }\n`
      );
    } else {
      console.log("Invalid choice. Please try again.");
    }
  }
}

main().catch((err) => {
  console.error(err);
  rl.close();
});
