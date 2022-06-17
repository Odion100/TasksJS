# TasksJS Service

Service is a TasksJS abstraction used to server objects that can be loaded by a TasksJS Client using the `Client.loadService(url)` method.

Call require("sht-tasks") and de-concatenate from the object it returns.

```javascript
const { Service } = require("sht-tasks");
```

The main abstractions used for client-to-server interactions are the following:
