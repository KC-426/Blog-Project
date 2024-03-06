const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema(
  {
    author: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      name: {
        type: String,
      },
      path: {
        type: String,
      },
    },
    blogName: {
      type: String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
