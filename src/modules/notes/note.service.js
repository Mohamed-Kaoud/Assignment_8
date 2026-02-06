import noteModel from "../../DB/models/note.model.js";

export const createNote = async (req, res) => {
  try {
    const userId = req.userId;

    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ messgae: `title and content are required` });
    }

    const note = await noteModel.create({ title, content, userId });
    return res.status(201).json({ message: `Note created successfully`, note });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const userId = req.userId;
    const { noteId } = req.params;
    const { title, content } = req.body;

    const note = await noteModel.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this note" });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();

    return res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const replaceNote = async (req, res) => {
  try {
    const userId = req.userId;
    const { noteId } = req.query;
    const { title, content } = req.body;

    if (!noteId) {
      return res.status(400).json({ message: "noteId is required in query" });
    }
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const note = await noteModel.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to replace this note" });
    }

    const result = await noteModel.replaceOne(
      { _id: noteId },
      {
        title,
        content,
        userId,
      },
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Note was not replaced" });
    }

    const updatedNote = await noteModel.findById(noteId);

    return res.status(200).json({
      message: "Note replaced successfully",
      note: updatedNote,
    });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const updateAllNotesTitle = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required in body" });
    }

    if (title === title.toUpperCase()) {
      return res
        .status(400)
        .json({ message: "Title must not be entirely uppercase" });
    }

    const result = await noteModel.updateMany({ userId }, { title });

    return res.status(200).json({
      message: `Updated title for ${result.modifiedCount} notes successfully`,
    });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;
    const note = await noteModel.findById(noteId);
    if (!note) {
      return res
        .status(404)
        .json({ message: `Note with id ${noteId} not found` });
    }
    if (note.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: `You are not allowed to delete this note` });
    }
    await noteModel.findByIdAndDelete(noteId);
    return res.status(200).json({ message: `Note deleted successfully`, note });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const getPaginatedNotes = async (req, res) => {
  try {
    const userId = req.userId;
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;

    const skip = (page - 1) * limit;

    const notes = await noteModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      page,
      limit,
      count: notes.length,
      notes,
    });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const note = await noteModel.findById(id);
    if (!note) {
      return res.status(404).json({ message: `Note not found` });
    }
    if (note.userId.toString() !== userId) {
      return res.status(400).json({ message: `You are not the owner` });
    }
    return res.status(200).json(note);
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const getNoteByContent = async (req, res) => {
  try {
    const userId = req.userId;
    const noteContent = req.query.content;
    const notes = await noteModel.find({ userId, content: noteContent });
    if (notes.length == 0) {
      return res.status(404).json({ message: `No notes found` });
    }
    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const getNoteWithUser = async (req, res) => {
  try {
    const userId = req.userId;
    const notes = await noteModel
      .find({ userId })
      .select("title userId createdAt")
      .populate("userId", "email");
    if (notes.length == 0) {
      return res.status(404).json({ message: "No notes found" });
    }
    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const aggregateNotes = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.query;

    const pipeline = [{ $match: { userId } }];

    if (title) {
      pipeline.push({
        $match: { title },
      });
    }

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });

    pipeline.push({ $unwind: "$user" });

    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        createdAt: 1,
        "user.name": 1,
        "user.email": 1,
      },
    });

    const notes = await noteModel.aggregate(pipeline);

    if (notes.length === 0) {
      return res.status(404).json({ message: "No notes found" });
    }

    return res.status(200).json({
      count: notes.length,
      notes,
    });
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};

export const deleteAllNotes = async (req, res) => {
  try {
      const userId = req.userId
      await noteModel.deleteMany(
        {userId}
      )
      return res.status(200).json({message:`Deleted`})
  } catch (error) {
    return res.status(500).json({ Error: error.message });
  }
};
