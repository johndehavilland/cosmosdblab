
# Cosmos DB Application Lab

This Node.js tutorial shows you how to use Azure Cosmos DB and the SQL API to store and access data from a Node.js Express application hosted on Azure Websites. You build a simple web-based task-management application, a ToDo app, that allows creating, retrieving, and completing tasks. The tasks are stored as JSON documents in Azure Cosmos DB. This tutorial walks you through the creation and deployment of the app and explains what's happening in each snippet.

![Screen shot of the My Todo List application created in this Node.js tutorial](./media/sql-api-nodejs-application/cosmos-db-node-js-mytodo.png)

Don't have time to complete the tutorial and just want to get the complete solution? Not a problem, you can get the complete sample solution from [GitHub][GitHub]. Just read the [Readme](https://github.com/Azure-Samples/documentdb-node-todo-app/blob/master/README.md) file for instructions on how to run the app.

## Prerequisites
Before following the instructions in this article, you should ensure
that you have the following:

* If you don't have an Azure subscription, create a [free account](https://azure.microsoft.com/free) before you begin. 
* [Node.js][Node.js] version v0.10.29 or higher. We recommend Node.js 6.10 or higher.
* [Express generator](http://www.expressjs.com/starter/generator.html) (you can install this via `npm install express-generator -g`)
* [Git][Git].

## Step 1: Create an Azure Cosmos DB database account
Let's start by creating an Azure Cosmos DB account. If you already have an account or if you are using the Azure Cosmos DB Emulator for this tutorial, you can skip to [Step 2: Create a new Node.js application](#_Toc395783178).

[!INCLUDE [cosmos-db-create-dbaccount](../../includes/cosmos-db-create-dbaccount.md)]

[!INCLUDE [cosmos-db-keys](../../includes/cosmos-db-keys.md)]

## Step 2: Create a new Node.js application
Now let's learn to create a basic Hello World Node.js project using the [Express](http://expressjs.com/) framework.

1. Open your favorite terminal, such as the Node.js command prompt.
2. Navigate to the directory in which you'd like to store the new application.
3. Use the express generator to generate a new application called **todo**.
   
        express todo
4. Open your new **todo** directory and install dependencies.
   
        cd todo
        npm install
5. Run your new application.
   
        npm start
6. You can view your new application by navigating your browser to [http://localhost:3000](http://localhost:3000).
   
    ![Starting of node.js app](./media/sql-api-nodejs-application/cosmos-db-node-js-express.png)

    Then, to stop the application, press CTRL+C in the terminal window and then, on Windows machines only, click **y** to terminate the batch job.

## Step 3: Install additional modules
The **package.json** file is one of the files created in the root of the project. This file contains a list of additional modules that are required for your Node.js application. Later, when you deploy this application to Azure Websites, this file is used to determine which modules need to be installed on Azure to support your application. We still need to install two more packages for this tutorial.

* Install the **documentdb** module via npm. This is the module where all the Azure Cosmos DB magic happens.
   
        npm install documentdb --save

## Step 4: Using the Azure Cosmos DB service in a node application
That takes care of all the initial setup and configuration, now let’s get down to why we’re here, and that’s to write some code using Azure Cosmos DB.

### Create the database manager
1. In **cosmosdb-manager.js** add a reference to the cosmos db node package by replacing `<require package>` with `require('documentdb').DocumentClient;`

2. Under the `getOrCreateDatabase` add in the query to get a list of databases:

    ```nodejs
    {
        query: 'SELECT * FROM root r WHERE r.id = @id',
        parameters: [{ name: '@id', value: databaseId }]
    };

3. Add a create database statement.

    ```nodejs
    client.createDatabase(databaseSpec, (err, created) => {
                callback(null, created);
            });

4. Under the `getOrCreateCollection` add in the query to get a list of collections:

    ```nodejs
    {
        query: 'SELECT * FROM root r WHERE r.id=@id',
        parameters: [{ name: '@id', value: collectionId }]
    };

5. Add a create collection statement:

    ```nodejs
    client.createCollection(databaseLink, collectionSpec, (err, created) => {
        callback(null, created);
    });

6. Save and close the **cosmosdb-manager.js** file.

### Create model

1. Initialize the database objects in the model in the `init` function:

    ```nodejs
    docdbUtils.getOrCreateDatabase(self.client, self.databaseId, function(err, db) {
        if (err) {
            callback(err);
        } else {
            self.database = db;
            docdbUtils.getOrCreateCollection(self.client, self.database._self, self.collectionId, function(err, coll) {
            if (err) {
                callback(err);
            } else {
                self.collection = coll;
            }
            });
        }
        });    
    ```

2. Add code for querying cosmos db:

    ```nodejs
    self.client.queryDocuments(self.collection._self, querySpec).toArray(function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
        });
    ```

3. Add code for creating a document:

    ```nodejs
    item.date = Date.now();
    item.completed = false;

    self.client.createDocument(self.collection._self, item, function(err, doc) {
    if (err) {
        callback(err);
    } else {
        callback(null, doc);
    }
    });
    ```

4. Add code to update a document:

    ```nodejs
    self.getItem(itemId, function(err, doc) {
        if (err) {
            callback(err);
        } else {
            doc.completed = true;

            self.client.replaceDocument(doc._self, doc, function(err, replaced) {
            if (err) {
                callback(err);
            } else {
                callback(null, replaced);
            }
            });
        }
        });
    ```

5. Add code to get a specific item from cosmos db:

    ```nodejs
    let querySpec = {
        query: 'SELECT * FROM root r WHERE r.id = @id',
        parameters: [{ name: '@id', value: itemId }]
    };

    self.client.queryDocuments(self.collection._self, querySpec).toArray(function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results[0]);
        }
    });
    ```

6. Save and close the **task-model.js** file. 

### Create the controller
1. In the **routes** directory of your project, create a new file named **tasklist.js**. 
2. Add code to get list of tasks from Cosmos DB:

    ```nodejs
    let querySpec = {
        query: 'SELECT * FROM root r WHERE r.completed=@completed',
        parameters: [
            {
            name: '@completed',
            value: false
            }
        ]
        };

        self.taskModel.find(querySpec, function(err, items) {
        if (err) {
            throw err;
        }

        res.render('index', {
            title: 'My ToDo List ',
            tasks: items
        });
        });
        ```
3. Add code to create a task object and insert it:
    ```nodejs
    let item = req.body;

    self.taskModel.addItem(item, function(err) {
    if (err) {
        throw err;
    }

    res.redirect('/');
    });
    ```

4. Add some code to update a task's status:

    ```nodejs
    let completedTasks = Object.keys(req.body);

    async.forEach(
        completedTasks,
        function taskIterator(completedTask, callback) {
            self.taskModel.updateItem(completedTask, function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
            });
        },
        function goHome(err) {
            if (err) {
            throw err;
            } else {
            res.redirect('/');
            }
        }
    );
    ```

5. Save and close the **tasklist.js** file.

### Update the config.js
1. In the **config.js** file, update the values of HOST and AUTH_KEY using the values found in the Keys page of your Azure Cosmos DB account on the [Microsoft Azure portal](https://portal.azure.com).
2. Save and close the **config.js** file.

### Modify app.js
1. In the project directory, open the **app.js** file. 

2. Add the following code to the top of **app.js**:
   
    ```nodejs
    var DocumentDBClient = require('documentdb').DocumentClient;
    var config = require('./config');
    var TaskList = require('./routes/tasklist');
    var TaskModel = require('./models/taskModel');
    ```
3. This code defines the config file to be used, and proceeds to read values out of this file into some variables we will use soon.
4. Replace the following two lines in **app.js** file:
   
    ```nodejs
    app.use('/', index);
    app.use('/users', users); 
    ```
   
    with the following snippet:
   
    ```nodejs
    let docDbClient = new DocumentDBClient(config.host, {
        masterKey: config.authKey
    });
    let taskModel = new TaskModel(docDbClient, config.databaseId, config.collectionId);
    let taskList = new TaskList(taskModel);
    taskModel.init();
   
    app.get('/', taskList.showTasks.bind(taskList));
    app.post('/addtask', taskList.addTask.bind(taskList));
    app.post('/completetask', taskList.completeTask.bind(taskList));
    app.set('view engine', 'jade');
    ```
5. These lines define a new instance of our **TaskModel** object, with a new connection to Azure Cosmos DB (using the values read from the **config.js**), initialize the task object and then bind form actions to methods on our **TaskList** controller. 
6. Finally, save and close the **app.js** file, we're just about done.

## Step 5: Build a user interface
Now let’s turn our attention to building the user interface so a user can actually interact with our application. The Express application we created uses **Jade** as the view engine. For more information on Jade please refer to [http://jade-lang.com/](http://jade-lang.com/).

1. The **layout.jade** file in the **views** directory is used as a global template for other **.jade** files. In this step you will modify it to use [Twitter Bootstrap](https://github.com/twbs/bootstrap), which is a toolkit that makes it easy to design a nice looking website. 
3. Now open the **index.jade** file, the view that will be used by our application, and replace the content of the file with the following:
   
        extends layout
        block content
           h1 #{title}
           br
        
           form(action="/completetask", method="post")
             table.table.table-striped.table-bordered
               tr
                 td Name
                 td Category
                 td Date
                 td Complete
               if (typeof tasks === "undefined")
                 tr
                   td
               else
                 each task in tasks
                   tr
                     td #{task.name}
                     td #{task.category}
                     - var date  = new Date(task.date);
                     - var day   = date.getDate();
                     - var month = date.getMonth() + 1;
                     - var year  = date.getFullYear();
                     td #{month + "/" + day + "/" + year}
                     td
                       input(type="checkbox", name="#{task.id}", value="#{!task.completed}", checked=task.completed)
             button.btn.btn-primary(type="submit") Update tasks
           hr
           form.well(action="/addtask", method="post")
             .form-group
               label(for="name") Item Name:
               input.form-control(name="name", type="textbox")
             .form-group
               label(for="category") Item Category:
               input.form-control(name="category", type="textbox")
             br
             button.btn(type="submit") Add item
   

This extends layout, and provides content for the **content** placeholder we saw in the **layout.jade** file earlier.
   
In this layout we created two HTML forms.

The first form contains a table for our data and a button that allows us to update items by posting to **/completetask** method of our controller.
    
The second form contains two input fields and a button that allows us to create a new item by posting to **/addtask** method of our controller.

This should be all that we need for our application to work.

## Step 6: Run your application locally
1. To test the application on your local machine, run `npm start` in the terminal to start your application, then refresh your [http://localhost:3000](http://localhost:3000) browser page. The page should now look like the image below:
   
    ![Screenshot of the MyTodo List application in a browser window](./media/sql-api-nodejs-application/cosmos-db-node-js-localhost.png)

    > [!TIP]
    > If you receive an error about the indent in the layout.jade file or the index.jade file, ensure that the first two lines in both files is left justified, with no spaces. If there are spaces before the first two lines, remove them, save both files, then refresh your browser window. 

2. Use the Item, Item Name and Category fields to enter a new task and then click **Add Item**. This creates a document in Azure Cosmos DB with those properties. 
3. The page should update to display the newly created item in the ToDo
   list.
   
    ![Screenshot of the application with a new item in the ToDo list](./media/sql-api-nodejs-application/cosmos-db-node-js-added-task.png)
4. To complete a task, simply check the checkbox in the Complete column,
   and then click **Update tasks**. This updates the document you already created and removes it from the view.

5. To stop the application, press CTRL+C in the terminal window and then click **Y** to terminate the batch job.

