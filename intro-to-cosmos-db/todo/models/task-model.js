let DocumentDBClient = require('documentdb').DocumentClient;
let docdbUtils = require('./cosmosdb-manager.js');

function TaskModel(documentDBClient, databaseId, collectionId) {
    this.client = documentDBClient;
    this.databaseId = databaseId;
    this.collectionId = collectionId;
 
    this.database = null;
    this.collection = null;
  }

  TaskModel.prototype = {
      
    init: function(callback) {
        let self = this;

        <initialize database objects>
    },

    find: function(querySpec, callback) {
        let self = this;

        <find data in database>
    },

    addItem: function(item, callback) {
        let self = this;

        <create a document in cosmosdb>
    },

    updateItem: function(itemId, callback) {
        let self = this;

        <update an existing item in cosmosdb>
    },

    getItem: function(itemId, callback) {
        let self = this;
        
        <get a specific item>
    }
};
 
  module.exports = TaskModel;