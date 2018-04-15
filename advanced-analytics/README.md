# Advanced Analytics Lab

## Introduction

This lab is to help explore Cosmos DB and how it can be tied into a scenario ingesting a stream of data and surfacing that up via Azure Search.

This assumes you have a Cosmos DB Instance up and running.

## Collecting the data

We are going to be collecting tweets based on a keyword and pushing those to Cosmos DB on a 1 minute schedule. To do this we'll leverage logic apps.

1. In the Azure Portal go to create and search for Logic Apps.
2. Enter the details to deploy the logic app - ideally choosing the same region as your Cosmos DB instance.
3. Once the logic app has been created, navigate to it and open the designer.

4. Within the designer, scroll down and choose the Blank App option
![Blank logic app](./images/blank-create.png)

5. Search for the schedule connector and choose that.
![Schedule connector](./images/schedule.png)

6. Set the interval to 1 minute.

7. Choose *new step* and then *add an action*

8. Search for Cosmos and choose the *Query documents* option.
![Blank logic app](./images/cosmos.png)

9. Enter this as the query: `SELECT top 1 c.id FROM c ORDER BY c.id2 DESC`

10. Choose *new step* and choose *condition*

![condition](./images/condition.png)

11. Set the value to be **_count** and set it to equal 0.

12. Under the **true** condition add an action step.
![Conditional options](./images/true-select.png)
13. Search for *twitter* and scroll down for the *Search tweets* option and choose that.
![Twitter connector](./images/twitter.png)
14. Enter a search term - anything you like though ideally something that returns a lot of tweets (e.g. Microsoft or Azure)
15. Choose *new step* and, expand the *more* option and choose *for each loop*
16. Add a new action within this *for each* module and search for Cosmos. Choose the *Create or update a document* option
17. Enter the following as the document to create: `{
            "id": "@items('For_each')?['TweetId']",
            "text": "@items('For_each')['TweetText']",
            "id2": "@items('For_each')?['TweetId']"
        }`

18. Under the *false* option, choose *new step* and, expand the *more* option and choose *for each loop*
![for each loop](./images/foreach.png)
19. Select **Documents** as the output.
20. Now choose *add an action* **within** the for each module.
21. Search for *twitter* and scroll down for the *Search tweets* option and choose that.
![Twitter connector](./images/twitter.png)
22. Enter a search term - anything you like though ideally something that returns a lot of tweets (e.g. Microsoft or Azure)
23. Expand advanced options and in *sinceid* enter the following `@{items('For_each_2')['id']}`
24. Choose *new step* and, expand the *more* option and choose *for each loop*
25. Add a new action within this for each module and search for Cosmos. Choose the *Create or update a document* option
26. Enter the following as the document to create: `{
            "id": "@items('For_each_3')?['TweetId']",
            "text": "@items('For_each_3')['TweetText']",
            "id2": "@items('For_each_3')?['TweetId']"
        }`

27. Save your logic app and then press **Run** to try it out.

The full logic app should like this

![Full logic app flow](./images/full-logic-app.png)

## Populating Azure Search

1. In the Azure Portal create an Azure Search instance. The free tier is fine for this.
2. Once it is created, navigate to it and choose *import data*
![Import data into Azure search](./images/import.png)
3. From the data source navigate to your Cosmos Db Instance
4. Enter this as the query
>SELECT * FROM c WHERE c._ts >= @HighWaterMark ORDER BY c._ts
5. Mark the text field as *retrievable* and *searchable*
![Index data setup in Azure search](./images/index-import.png)
6. Set up schedule to run every 10minutes.

## Setup front end application

1. Within this repo there is a simple HTML page (under the search-app folder). Run this locally in your browser. It will ask you for three items - Azure Search Name, Search Key and Index Name. You can get these from your Azure Search instance in the portal. 

2. Once you have entered these, you should be able to search across all your collected tweets using the search box.
