const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const app = express();


const port = 5001;

app.use(express.json());
app.use("/numbers", require("./routes/routes"));
app.use(errorHandler);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
