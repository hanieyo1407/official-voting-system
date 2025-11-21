// api/src/controllers/app.controller.ts

import { Request, Response } from "express";
import AppService from "../services/app.service";
import { InputSanitizer } from "../utils/sanitizer";
import { LoggingService } from "../services/logging.service";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await AppService.getAllUsers();
    return res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { voucher } = req.body;
    if (!voucher) {
      return res.status(400).json({ error: "voucher is required" });
    }

    const user = await AppService.createUser(voucher);
    return res.status(201).json({ user });
  } catch (err) {
    LoggingService.logError(err as Error, { context: "createUser" });
    return res.status(500).json({ error: "Failed to create user" });
  }
};

export const getPositions = async (req: Request, res: Response) => {
  try {
    const positions = await AppService.getPositions();
    return res.status(200).json({ data: positions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch positions" });
  }
};

export const getCandidatesByPosition = async (req: Request, res: Response) => {
  try {
    const positionId = Number(req.params.positionId);
    if (Number.isNaN(positionId))
      return res.status(400).json({ error: "invalid position id" });
    const candidates = await AppService.getCandidatesByPosition(positionId);
    return res.status(200).json({ data: candidates });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch candidates" });
  }
};

export const createPosition = async (req: Request, res: Response) => {
  try {
    const { position_name } = req.body;
    if (!position_name) {
      return res.status(400).json({ error: "position_name is required" });
    }

    let sanitizedName: string;
    try {
      sanitizedName = InputSanitizer.sanitizeText(position_name, 100);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    const position = await AppService.createPosition(sanitizedName);
    return res.status(201).json({ data: position });
  } catch (err) {
    LoggingService.logError(err as Error, { context: "createPosition" });
    return res.status(500).json({ error: "Failed to create position" });
  }
};

export const createCandidate = async (req: Request, res: Response) => {
  try {
    const positionId = Number(req.params.positionId);
    if (Number.isNaN(positionId)) {
      return res.status(400).json({ error: "invalid position id" });
    }

    const { name, manifesto } = req.body;
    if (!name) {
      return res.status(400).json({ error: "candidate name is required" });
    }

    let sanitizedName: string;
    let sanitizedManifesto: string = "";

    try {
      sanitizedName = InputSanitizer.sanitizeText(name, 100);
      if (manifesto) {
        sanitizedManifesto = InputSanitizer.sanitizeText(manifesto, 5000);
      }
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    const candidate = await AppService.createCandidate(
      positionId,
      sanitizedName,
      sanitizedManifesto
    );

    return res.status(201).json({ data: candidate });
  } catch (err) {
    LoggingService.logError(err as Error, { context: "createCandidate" });
    return res.status(500).json({ error: "Failed to create candidate" });
  }
};

export const authCheck = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const { voucher } = body;

    if (!voucher) {
      return res.status(400).json({ error: "voucher is required" });
    }

    const user = await AppService.findUserByVoucher(voucher);

    if (user) {
      return res.status(200).json({ status: "found", data: user });
    } else {
      return res.status(404).json({ status: "user does not exist" });
    }
  } catch (err) {
    LoggingService.logError(err as Error, { context: "authCheck" });
    return res.status(500).json({ error: "Auth check failed" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { voucher } = req.body;
    if (!voucher) {
      return res.status(400).json({ error: "Voucher is required" });
    }

    // Only voucher validation
    const { user } = await AppService.loginUser(voucher);

    LoggingService.logAuth(user.id?.toString() || "unknown", "VOTER_LOGIN_SUCCESS");

    return res.status(200).json({ message: "Login successful", user });
  } catch (err: any) {
    LoggingService.logError(err as Error, { context: "loginUser" });
    return res.status(401).json({ error: "Invalid voucher code" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    // No cookies to clear anymore
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Logout failed" });
  }
};

export const castVote = async (req: Request, res: Response) => {
  try {
    const { voucher, candidateId, positionId } = req.body ?? {};

    if (!voucher || !candidateId || !positionId) {
      return res.status(400).json({
        error: "missing vote fields: voucher, candidateId, positionId are required",
      });
    }

    let sanitizedCandidateId: number;
    let sanitizedPositionId: number;

    try {
      sanitizedCandidateId = InputSanitizer.sanitizeInteger(candidateId, "candidateId");
      sanitizedPositionId = InputSanitizer.sanitizeInteger(positionId, "positionId");
    } catch (error: any) {
      LoggingService.logSecurity("VOTE_INVALID_INPUT", {
        error: error.message,
        ip: req.ip,
      });
      return res.status(400).json({ error: error.message });
    }

    const vote = await AppService.castVote(
      voucher,
      sanitizedCandidateId,
      sanitizedPositionId
    );

    LoggingService.logAudit("VOTE_CAST", {
      positionId: sanitizedPositionId,
      candidateId: sanitizedCandidateId,
    });

    return res.status(201).json({ data: vote });
  } catch (err: any) {
    LoggingService.logError(err as Error, { context: "castVote" });

    if (err.message?.includes("already used")) {
      return res.status(400).json({
        error: "You have already voted for this position",
      });
    }

    return res.status(500).json({ error: "Failed to cast vote" });
  }
};

export const verifyVote = async (req: Request, res: Response) => {
  try {
    const { verification_code } = req.body ?? {};
    if (!verification_code) {
      return res.status(400).json({ error: "verification_code is required" });
    }

    let sanitizedCode: string;
    try {
      sanitizedCode = InputSanitizer.sanitizeText(String(verification_code), 100);
    } catch (error: any) {
      return res.status(400).json({ error: "Invalid verification code format" });
    }

    const vote = await AppService.verifyVoteByCode(sanitizedCode);

    if (vote) {
      return res.status(200).json({ status: "found", vote });
    } else {
      return res.status(404).json({ status: "not found" });
    }
  } catch (err) {
    LoggingService.logError(err as Error, { context: "verifyVote" });
    return res.status(500).json({ error: "Verification failed" });
  }
};
