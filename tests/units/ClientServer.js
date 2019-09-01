const { expect } = require("chai");
const fs = require("fs");

module.exports = (TasksJSClient, TasksJSServer) => {
  return async () => {
    //1. Launch an express server
    const port = 4789;
    const url = `http://localhost:${port}/test`;
    const singleFileUrl = `http://localhost:${port}/sf/test`;
    const multiFileUrl = `http://localhost:${port}/mf/test`;
    const { server } = TasksJSServer();
    const Client = TasksJSClient();

    const body = { testPassed: false };

    const response = (req, res) => {
      const { body, method } = req;
      body.testPassed = true;
      res.json({ method, ...body });
    };

    const uploadResponse = (req, res) => {
      const { file } = req;
      const json = JSON.parse(fs.readFileSync(file.path));

      res.json({ file, ...json });
    };

    const multiUploadResponse = (req, res) => {
      const { files } = req;
      const json = JSON.parse(fs.readFileSync(files[0].path));

      res.json({ files, ...json });
    };

    server.get("/test", response);
    server.put("/test", response);
    server.post("/test", response);
    server.delete("/test", response);
    server.post("/sf/test", uploadResponse);
    server.post("/mf/test", multiUploadResponse);
    server.listen(port, console.log(`(TestServer) listening on port:${port}`));

    describe("Client", () => {
      it("should be a TasksJSClient instance", () => {
        expect(Client)
          .to.be.an("Object")
          .that.has.all.keys("request", "upload")
          .that.respondsTo("request")
          .that.respondsTo("upload");
      });

      it("should be able to succesfully make http requests returning a promise", async () => {
        const get = await Client.request({ method: "GET", url });
        const put = await Client.request({ method: "PUT", url, body });
        const post = await Client.request({ method: "POST", url, body });
        const del = await Client.request({ method: "DELETE", url, body });

        expect(Client.request({ method: "GET", url })).to.be.a("promise");

        expect(get)
          .to.be.an("Object")
          .that.has.property("method", "GET");

        expect(put).to.be.an("Object");
        expect(put).to.have.property("method", "PUT");
        expect(put).to.have.property("testPassed", true);

        expect(post).to.be.an("Object");
        expect(post).to.have.property("method", "POST");
        expect(post).to.have.property("testPassed", true);

        expect(del).to.be.an("Object");
        expect(del).to.have.property("method", "DELETE");
        expect(del).to.have.property("testPassed", true);
      });

      it("should be able to upload a files", async () => {
        const file = fs.createReadStream(__dirname + "\\testFile.json");
        const uploadResponse = await Client.upload({
          url: singleFileUrl,
          formData: { file }
        });
        expect(uploadResponse)
          .to.be.an("Object")
          .that.has.property("testPassed", true);
        expect(uploadResponse)
          .to.have.property("file")
          .that.is.an("object")
          .that.has.property("originalname", "testFile.json");
        expect(uploadResponse).to.have.property("fileUploadTest", true);
      });
      it("should be able to upload multiple files", async () => {
        const files = [
          fs.createReadStream(__dirname + "\\testFile.json"),
          fs.createReadStream(__dirname + "\\testFile.json")
        ];
        const multiUploadResponse = await Client.upload({
          url: multiFileUrl,
          formData: { files }
        });
        expect(multiUploadResponse)
          .to.be.an("Object")
          .that.has.property("testPassed", true);
        expect(multiUploadResponse)
          .to.have.property("files")
          .that.is.an("Array");
        expect(multiUploadResponse).to.have.property("fileUploadTest", true);
      });
    });
  };
  // it("should handle bad requests", () => {});
};
