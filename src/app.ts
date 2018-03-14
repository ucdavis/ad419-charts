import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public"), { maxAge: 0 }));

export default app;
