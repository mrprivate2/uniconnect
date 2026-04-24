import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  followUser, 
  unfollowUser, 
  getFollowStats,
  getFollowers,
  getFollowing,
  removeFollower
} from "../controllers/followController.js";

const router = express.Router();

const optionalProtect = (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
};

router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);
router.delete("/remove-follower/:id", protect, removeFollower);
router.get("/:id/follow-stats", getFollowStats);
router.get("/:id/followers", optionalProtect, getFollowers);
router.get("/:id/following", optionalProtect, getFollowing);

export default router;
