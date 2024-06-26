import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT;

app.use(express.json());

app.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password,
      },
    });

    if (email === "" || password === "") {
      throw new Error("Email & password are required!");
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (email === "" || password === "") {
      throw new Error("Email & password are required!");
    }

    if (!user || user.password !== password) {
      throw new Error("Invalid credentials");
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/todos", async (req: Request, res: Response) => {
  const { userId, task } = req.body;
  try {
    const todo = await prisma.todo.create({
      data: {
        task,
        userId,
      },
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Error adding todo" });
  }
});

app.get("/todos/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    const todos = await prisma.todo.findMany({
      where: { userId },
      include: { user: true },
    });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching todos" });
  }
});

app.delete("/todos/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await prisma.todo.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting todo" });
  }
});

app.listen(PORT, () => {
  console.log("server on: ", PORT);
});
