import { Router } from "express";
import {
  getPosts,
  getPostById,
  createPost,
  votePost,
  addComment,
  deletePost,
  deleteComment,
} from "../controller/forum.controller.js";
import { authMiddleware, ensureAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// Retrieve posts list (auth optional, fetches personal upvote statuses if signed in)
router.get("/posts", authMiddleware, getPosts);

// Retrieve single experience post details
router.get("/posts/:id", authMiddleware, getPostById);

// Publish new experience (requires authentication)
router.post("/posts", authMiddleware, ensureAuthenticated, createPost);

// Delete experience post (requires authentication & authorship)
router.delete("/posts/:id", authMiddleware, ensureAuthenticated, deletePost);

// Toggle upvote/downvote status (requires authentication)
router.post("/posts/:id/vote", authMiddleware, ensureAuthenticated, votePost);
router.post("/posts/:id/upvote", authMiddleware, ensureAuthenticated, votePost);

// Add comment to experience (requires authentication)
router.post("/posts/:id/comments", authMiddleware, ensureAuthenticated, addComment);

// Delete comment (requires authentication & authorship)
router.delete("/comments/:id", authMiddleware, ensureAuthenticated, deleteComment);

export default router;
