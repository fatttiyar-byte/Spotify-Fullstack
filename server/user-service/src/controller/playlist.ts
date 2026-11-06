
import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware.js";
import Trycatch from "../Trycatch.js";

export const addToPlaylist = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const songId = String(req.params.songId ?? "");

    if (!user) {
      res.status(401).json({
        message: "لطفاً ابتدا وارد حساب کاربری شوید.",
      });
      return;
    }

    if (!/^[1-9]\d*$/.test(songId)) {
      res.status(400).json({
        message: "شناسه آهنگ معتبر نیست.",
      });
      return;
    }

    if (user.playlist.includes(songId)) {
      res.status(409).json({
        message: "این آهنگ قبلاً به پلی‌لیست اضافه شده است.",
      });
      return;
    }

    user.playlist.push(songId);
    await user.save();

    res.status(200).json({
      message: "آهنگ به پلی‌لیست اضافه شد.",
      playlist: user.playlist,
    });
  }
);

export const getPlaylist = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        message: "لطفاً ابتدا وارد حساب کاربری شوید.",
      });
      return;
    }

    res.status(200).json({
      playlist: req.user.playlist,
    });
  }
);

export const removeFromPlaylist = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const songId = String(req.params.songId ?? "");

    if (!user) {
      res.status(401).json({
        message: "لطفاً ابتدا وارد حساب کاربری شوید.",
      });
      return;
    }

    if (!/^[1-9]\d*$/.test(songId)) {
      res.status(400).json({
        message: "شناسه آهنگ معتبر نیست.",
      });
      return;
    }

    if (!user.playlist.includes(songId)) {
      res.status(404).json({
        message: "این آهنگ در پلی‌لیست شما وجود ندارد.",
      });
      return;
    }

    user.playlist = user.playlist.filter(
      (id) => id !== songId
    );

    await user.save();

    res.status(200).json({
      message: "آهنگ از پلی‌لیست حذف شد.",
      playlist: user.playlist,
    });
  }
);
