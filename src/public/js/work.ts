import * as fs from "fs";
import * as topojson from "topojson";

const geojson = require("./map-counties.json");

let topology: any = topojson.topology({counties: geojson});
topology = topojson.presimplify(topology);
topology = topojson.simplify(topology, 0.000008);

fs.writeFileSync("./map-counties-ca-topo.json", JSON.stringify(topology, undefined, " "), "utf8");