import { prisma } from "../config/prismaClient.js";

export const getPosts = async (req, res) => {
  try {
    const { search, tag } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const posts = await prisma.forumPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatarUrl: true,
            college: true,
            branch: true,
          },
        },
        comments: {
          select: { id: true },
        },
        votes: {
          select: { userId: true, value: true },
        },
      },
    });

    const formattedPosts = posts.map((post) => {
      const userVoteObj = req.user
        ? post.votes.find((v) => v.userId === req.user.userId)
        : null;
      const userVote = userVoteObj ? userVoteObj.value : 0;
      const score = post.votes.reduce((sum, v) => sum + v.value, 0);

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.user,
        commentCount: post.comments.length,
        score,
        userVote,
        // Backwards compatibility fields:
        upvoteCount: score,
        isUpvoted: userVote === 1,
      };
    });

    return res.status(200).json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatarUrl: true,
            college: true,
            branch: true,
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                userName: true,
                avatarUrl: true,
                college: true,
                branch: true,
              },
            },
          },
        },
        votes: {
          select: { userId: true, value: true },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userVoteObj = req.user
      ? post.votes.find((v) => v.userId === req.user.userId)
      : null;
    const userVote = userVoteObj ? userVoteObj.value : 0;
    const score = post.votes.reduce((sum, v) => sum + v.value, 0);

    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      tags: post.tags,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.user,
      comments: post.comments.map((c) => ({
        id: c.id,
        content: c.content,
        parentId: c.parentId,
        createdAt: c.createdAt,
        author: c.user,
      })),
      score,
      userVote,
      upvoteCount: score,
      isUpvoted: userVote === 1,
    };
    return res.status(200).json({ post: formattedPost });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, content, tags } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        tags: Array.isArray(tags) ? tags : [],
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatarUrl: true,
            college: true,
            branch: true,
          },
        },
      },
    });

    return res.status(201).json({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.user,
        commentCount: 0,
        score: 0,
        userVote: 0,
        upvoteCount: 0,
        isUpvoted: false,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const votePost = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params; // postId
    const { value } = req.body; // 1 or -1 or 0
    const userId = req.user.userId;

    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || ![-1, 0, 1].includes(numericValue)) {
      return res.status(400).json({ error: "Invalid vote value" });
    }

    // Verify post exists
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true }
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Upsert vote
    if (numericValue === 0) {
      await prisma.vote.deleteMany({
        where: { postId: id, userId }
      });
    } else {
      await prisma.vote.upsert({
        where: {
          userId_postId: { userId, postId: id }
        },
        update: { value: numericValue },
        create: { postId: id, userId, value: numericValue }
      });
    }

    // Fetch the updated score
    const votes = await prisma.vote.findMany({
      where: { postId: id },
      select: { value: true },
    });

    const score = votes.reduce((sum, v) => sum + v.value, 0);

    return res.status(200).json({
      score,
      userVote: numericValue,
    });
  } catch (error) {
    console.error("Error voting on post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params; // postId
    const { content, parentId } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    // Verify post exists
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true }
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // If parentId provided, verify it exists and belongs to this post
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { postId: true }
      });
      if (!parentComment || parentComment.postId !== id) {
        return res.status(400).json({ error: "Invalid parent comment" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        userId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatarUrl: true,
            college: true,
            branch: true,
          },
        },
      },
    });

    return res.status(201).json({
      comment: {
        id: comment.id,
        content: comment.content,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        author: comment.user,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { userId: true }
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden: You are not the author of this post" });
    }
    await prisma.forumPost.delete({
      where: { id }
    });
    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true }
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden: You are not the author of this comment" });
    }
    await prisma.comment.delete({
      where: { id }
    });
    return res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};