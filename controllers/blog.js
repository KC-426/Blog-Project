const BlogSchema = require("../models/blog");
const path = require("path");
const fs = require("fs");

const createBlog = async (req, res) => {
  try {
    const { author, description, blog } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded !" });
    }

    const { filename, path } = req.file;

    const blg = new BlogSchema({
      author,
      description,
      image: {
        name: filename,
        path: path,
      },
      blogName: blog,
    });

    const result = await blg.save();
    console.log(result);
    return res
      .status(201)
      .json({ success: true, message: "Blog saved !!", blog: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};

const likeBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const findBlog = await BlogSchema.findById(id);
    if (!findBlog) {
      return res.status(404).json({ message: "No blog found!" });
    }

    findBlog.likes++;
    await findBlog.save();
    res
      .status(200)
      .json({ message: "Blog liked successfully!", likes: findBlog.likes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};

const shareBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const findBlog = await BlogSchema.findById(id);
    if (!findBlog) {
      return res.status(404).json({ message: "No blog found!" });
    }

    findBlog.shares++;
    await findBlog.save();
    res
      .status(200)
      .json({ message: "Blog shared successfully!", shares: findBlog.shares });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};

const commentOnBlog = async (req, res) => {
  const { id } = req.params;
  const { commentedBy, commentedData } = req.body;
  try {
    const findBlog = await BlogSchema.findById(id);
    if (!findBlog) {
      return res.status(404).json({ message: "No blog found!" });
    }

    const newComment = {
      commentedBy: commentedBy,
      commentedData: commentedData,
    };

    findBlog.comments.push(newComment);
    const result = await findBlog.save();

    console.log(result);
    res.status(201).json({ message: "Comment added successfully !", result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};

const addReplyOnComment = async (req, res) => {
  const {id, commentId } = req.params
  const {repliedBy, repliedData} = req.body
  try {
    const findBlog = await BlogSchema.findById(id);
    if (!findBlog) {
      return res.status(404).json({ message: "No blog found!" });
    }

    const findComment = findBlog.comments.find(comment => comment._id.toString() === commentId);
    if (!findComment) {
      return res.status(404).json({ message: "No comment found!" });
    }

    const newReply = {
      repliedBy: repliedBy,
      repliedData: repliedData
    }
 
    findComment.reply.push(newReply)
    await findBlog.save()
    return res.status(201).json({message: "Reply added to the commment !", findBlog})
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};

const retrieveBlog = async (req, res) => {
  try {
    const findBlog = await BlogSchema.find();
    if (findBlog.length === 0) {
      return res.status(404).json({ message: "No Blog found !!" });
    }

    const updatedBlogs = await Promise.all(
      findBlog.map(async (ele) => {
        const imagePath = path.join(ele.image.path);
        try {
          const data = await fs.promises.readFile(imagePath);
          const base64Image = Buffer.from(data).toString("base64");

          return { ...ele, fileContent: base64Image };
        } catch (err) {
          console.error("Error reading image file:", err);
          return ele;
        }
      })
    );

    return res
      .status(200)
      .json({ message: "Post retrieved !!", post: updatedBlogs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};

const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await BlogSchema.findById(id);
    console.log(blog);
    if (!blog) {
      return res.status(404).json({ message: "No blog found !" });
    }

    return res
      .status(200)
      .json({ message: "Blog fetched successfully !", blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error !" });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const findBlog = await BlogSchema.findById(id);
    console.log(findBlog);
    if (!findBlog) {
      return res.status(404).json({ message: "No blog found !!" });
    }

    await BlogSchema.findByIdAndRemove(id);

    res.status(200).json({ message: "Blog Deleted !" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};

exports.createBlog = createBlog;
exports.likeBlog = likeBlog;
exports.shareBlog = shareBlog;
exports.commentOnBlog = commentOnBlog;
exports.addReplyOnComment = addReplyOnComment;
exports.retrieveBlog = retrieveBlog;
exports.getBlogById = getBlogById;
exports.deleteBlog = deleteBlog;
