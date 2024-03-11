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
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        commentedBy: {
          type: String,
        },
        commentedData: {
          type: String,
        },
        reply: [
          {
            repliedBy: {
              type: String,
            },
            repliedData: {
              type: String,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
