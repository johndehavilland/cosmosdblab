let DocumentDBClient = <require statement>;

module.exports = {
    getOrCreateDatabase: (client, databaseId, callback) => {
        let querySpec = <database check query>

        client.queryDatabases(querySpec).toArray((err, results) => {
        if (err) {
            callback(err);
        } else {
            if (results.length === 0) {
            let databaseSpec = { id: databaseId };
            <create a database>
            } else {
            callback(null, results[0]);
            }
        }
        });
    },

    getOrCreateCollection: (client, databaseLink, collectionId, callback) => {
        let querySpec = <collection check query>

        client.queryCollections(databaseLink, querySpec).toArray((err, results) => {
        if (err) {
            callback(err);
        } else {
            if (results.length === 0) {
            let collectionSpec = { id: collectionId };
            <create a collection>
            } else {
            callback(null, results[0]);
            }
        }
    });
}
};