import express from "express";
import checkConnectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import noteRouter from "./modules/notes/note.controller.js";
const app = express();
const port = 3000;

const bootstrap = () => {

  app.use(express.json());

  checkConnectionDB()

  app.get("/", (req, res) => {
    res.status(200).json({message:`Welcome to my app`})
  });

  app.use("/users" , userRouter)
  app.use("/notes" , noteRouter)

  app.use("{/*notFound}" , (req,res) => {
    res.status(404).json({message:`URL ${req.originalUrl} not found`})
  })

  app.listen(port, () => console.log(`Server is running on port ${port}`));
};

export default bootstrap;
