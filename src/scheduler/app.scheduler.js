const schedule = require("node-schedule");
const reddit = require("../reddit");
const scheduledTasks = require("./scheduled-tasks");

function initialise() {
  for (let taskName in scheduledTasks) {
    if (scheduledTasks.hasOwnProperty(taskName)) {
      let task = scheduledTasks[taskName];
      schedule.scheduleJob(task.cron, () => {
        console.log(
          "Running scheduled task: " +
            taskName +
            " " +
            new Date().toLocaleString()
        );
        console.log(task.preProcessMessage);
        task
          .execute(reddit)
          .then(response => {
            console.log(response);
            console.log(task.postProcessMessage);
            console.log(
              "Finished Running scheduled task: " +
                taskName +
                " " +
                new Date().toLocaleString()
            );
          })
          .catch(err => {
            console.log(err);
            console.log(
              "Finished Running scheduled task: " +
                taskName +
                " " +
                new Date().toLocaleString()
            );
          });
      });
    }
  }
}

module.exports = {
  initialise: initialise
};
