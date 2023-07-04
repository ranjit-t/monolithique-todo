const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  tasks: [
    {
      taskID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: mongoose.Types.ObjectId,
      },
      title: { type: String, required: true },
      isCompleted: { type: Boolean, default: false },
    },
  ],
  photo: { type: Buffer },
});

const usersDB = mongoose.model("users", usersSchema);

module.exports = usersDB;
