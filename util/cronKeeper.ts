import { Job } from "node-schedule";

export interface CronKeeper {
  addCronJob: (job: Job) => void;
  getCronList: () => [Job?];
}

export default (function() {
  var instance: CronKeeper;
  function init(): CronKeeper {
    const cronList: [Job?] = [];
    return {
      addCronJob: function(job: Job) {
        cronList.push(job);
      },
      getCronList: function() {
        return cronList;
      }
    };
  }
  return {
    getInstance: function() {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };
})();
