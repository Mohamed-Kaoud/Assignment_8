import { Router } from "express";
import * as NS from "./note.service.js"
import { auth } from "../../middlewares/auth.middleware.js";
const noteRouter = Router()

noteRouter.post("/" ,auth,NS.createNote )
noteRouter.patch("/all", auth, NS.updateAllNotesTitle);
noteRouter.patch("/:noteId", auth, NS.updateNote);
noteRouter.put("/replace", auth, NS.replaceNote);
noteRouter.delete("/:noteId" ,auth,NS.deleteNote )
noteRouter.get("/paginate-sort", auth, NS.getPaginatedNotes);
noteRouter.get("/note-by-content" ,auth,NS.getNoteByContent)
noteRouter.get("/note-with-user" , auth,NS.getNoteWithUser)
noteRouter.get("/aggregate", auth, NS.aggregateNotes);
noteRouter.get("/:id" , auth,NS.getNoteById)
noteRouter.delete("/" , auth,NS.deleteAllNotes)



export default noteRouter