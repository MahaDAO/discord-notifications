import arth from "./bots/arth";
import mahaLocks from "./bots/mahaLocks";
// import twitterMetions from "./bots/twitter";

arth();
mahaLocks();
// twitterMetions();

setInterval(arth, 60000);
setInterval(mahaLocks, 60000);
