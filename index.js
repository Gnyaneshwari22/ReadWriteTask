const http = require("http");
const fs = require("fs");

const httpServer = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    res.setHeader("Content-Type", "text/html");

    // Read the file and display messages
    fs.readFile("message.txt", (err, data) => {
      let messages = [];
      if (!err) {
        messages = data
          .toString()
          .split("\n")
          .filter((msg) => msg.trim() !== "");
      }

      const messagesHTML = messages
        .reverse()
        .map((msg) => `<p>${msg}</p>`)
        .join("");

      res.end(`
        <div>
          <h1>Messages:</h1>
          ${messagesHTML}
        </div>
        <form action="/message" method="POST">
          <label>Message :</label>
          <input type="text" name="message" required></input>
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
      const buffer = Buffer.concat(body);
      const formData = buffer.toString();
      const message = formData.split("=")[1];

      // Decode the message to handle special characters like spaces
      const decodedMessage = decodeURIComponent(message);

      // Append the new message to the file
      fs.appendFile("message.txt", `${decodedMessage}\n`, (err) => {
        if (err) {
          console.error("Error writing to file:", err);
        }
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
