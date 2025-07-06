import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:5173", ""],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Welcome to Smart Marks" });
});

// app.use("/api", router);

app.use((req: Request, res: Response) => {
  res.status(404).send({
    statusCode: 404,
    success: false,
    message: "Sorry, We can't find that!",
  });
});

export default app;
