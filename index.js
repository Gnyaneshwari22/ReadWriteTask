const http = require("http");
const fs = require("fs");

const httpServer = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    res.setHeader("Content-Type", "text/html");

    fs.readFile("formvalue.txt", (err, data) => {
      let savedValue = "";

      if (!err) {
        savedValue = data.toString();
      }

      res.end(`
        <h1>Saved Value: ${savedValue || "No data saved yet"}</h1>
        <form action="/message" method="POST">
          <label>Name :</label>
          <input type="text" name="username" required></input>
          <button type="submit">Submit</button>
        </form>
      `);
    });
  } else if (url === "/message" && method === "POST") {
    let body = [];

    req.on("data", (chunks) => {
      body.push(chunks);
    });

    req.on("end", () => {
      let buffer = Buffer.concat(body);
      let formData = buffer.toString();
      let formValue = formData.split("=")[1];

      fs.writeFile("formvalue.txt", formValue, (err) => {
        res.statusCode = 302;
        res.setHeader("Location", "/");
        res.end();
      });
    });
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

httpServer.listen(4000, () => {
  console.log("Server is running on port 4000");
});
