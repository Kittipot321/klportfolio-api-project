require("dotenv").config();
import http from "http";
import { Client } from "@notionhq/client";

const host = "localhost";
const port = process.env.PORT || 4000;

interface Projects {
  project_name: string;
  subtitle: string;
  description: string;
  link: string;
  year: number | null;
  img_url: string;
}

const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notionSecret = process.env.NOTION_SECRET;

if (!notionDatabaseId || !notionSecret) {
  throw new Error("Notion credentials are missing");
}

const notion = new Client({ auth: notionSecret });

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  switch (req.url) {
    case "/":
      res.writeHead(200);
      res.end(
        JSON.stringify({
          message: "This is my api project with made by notion database",
        })
      );
      break;
    case "/projects":
      res.writeHead(200);
      const query = await notion.databases.query({
        database_id: notionDatabaseId,
        sorts: [
          {
            property: "year",
            direction: "descending",
          },
        ],
      });

      const dataList: Projects[] = query.results.map((row) => {
        const project_name =
          row.properties.Project_name?.type === "title"
            ? row.properties.Project_name.title[0]?.plain_text
            : "";
        const subtitle =
          row.properties.Subtitle?.type === "rich_text"
            ? row.properties.Subtitle.rich_text[0]?.plain_text
            : "";
        const description =
          row.properties.Description?.type === "rich_text"
            ? row.properties.Description.rich_text[0]?.plain_text || ""
            : "";
        const link =
          row.properties.link?.type === "rich_text"
            ? row.properties.link.rich_text[0]?.plain_text || ""
            : "!#";
        const year =
          row.properties.year?.type === "number"
            ? row.properties.year.number
            : 0;
        const img_url =
          row.properties.img_url?.type === "rich_text"
            ? row.properties.img_url.rich_text[0]?.plain_text || ""
            : "";

        return {
          project_name,
          subtitle,
          description,
          link,
          year,
          img_url,
        };
      });

      return res.end(JSON.stringify({ data: dataList }));
    default:
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Not found" }));
      break;
  }
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
