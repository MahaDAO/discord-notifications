import bodyParser from "body-parser";
import express from "express";
import * as http from "http";

import routes from "./routes";
import arth from "./bots/arth";
import mahaLocks from "./bots/mahaLocks";
// import twitterMetions from "./bots/twitter";

const app = express();
const server = new http.Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));

// arth();
// mahaLocks();
// twitterMetions();

// setInterval(arth, 60000);
// setInterval(mahaLocks, 60000);
app.use(routes);

app.set("port", process.env.PORT || 5000);
const port = app.get("port");
server.listen(port, () => console.log(`Server started on port ${port}`));
