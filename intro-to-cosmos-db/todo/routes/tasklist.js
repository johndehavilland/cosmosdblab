let DocumentDBClient = require('documentdb').DocumentClient;
let async = require('async');

function TaskList(taskModel) {
    this.taskModel = taskModel;
}

TaskList.prototype = {
    showTasks: function(req, res) {
        let self = this;

        <get tasks to show on UI>
    },

    addTask: function(req, res) {
        let self = this;

        <add a task to database>
    },

    completeTask: function(req, res) {
        let self = this;
        
        <update status of task>
    }
};

module.exports = TaskList;