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
    if (!voucher) return res.status(400).json({ error: "voucher is required" });
    const user = await AppService.createUser(voucher);
    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
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

// export const castVote = async (req: Request, res: Response) => {
//   try {
//     const { voucher, candidateId, positionId, verificationCode } = req.body;
//     if (!voucher || !candidateId || !positionId || !verificationCode) {
//       return res.status(400).json({ error: "missing vote fields" });
//     }
//     const vote = await AppService.castVote(voucher, Number(candidateId), Number(positionId), verificationCode);
//     return res.status(201).json({ data: vote });
//   } catch (err: any) {
//     console.error(err);
//     // handle unique verification_code constraint or foreign key errors if you want
//     return res.status(500).json({ error: "Failed to cast vote" });
//   }
// };

export const createPosition = async (req: Request, res: Response) => {
  try {
    const { position_name } = req.body;
    if (!position_name)
      return res.status(400).json({ error: "position_name is required" });

    const position = await AppService.createPosition(position_name);
    return res.status(201).json({ data: position });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create position" });
  }
};

export const createCandidate = async (req: Request, res: Response) => {
  try {
    const positionId = Number(req.params.positionId);
    if (Number.isNaN(positionId))
      return res.status(400).json({ error: "invalid position id" });

    const { name, manifesto, imageurl } = req.body;
    if (!name)
      return res.status(400).json({ error: "candidate name is required" });

    const candidate = await AppService.createCandidate(
      positionId,
      name,
      manifesto,
      imageurl,
    );
    return res.status(201).json({ data: candidate });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create candidate" });
  }
};

export const authCheck = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const { voucher } = body;
    if (!voucher) return res.status(400).json({ error: "voucher is required" });

    const user = await AppService.findUserByVoucher(voucher);
    if (user) {
      return res.status(200).json({ status: "found", data: user });
    } else {
      return res.status(404).json({ status: "user does not exist" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Auth check failed" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { voucher } = req.body;
    if (!voucher) {
      return res.status(400).json({ error: "Voucher is required" });
    }

    const { token, user } = await AppService.loginUser(voucher);

    //HttpOnly cookie
    // res.cookie("token", token, {
    // httpOnly: true,
    //secure: process.env.NODE_ENV === "production", //apply in prodcution
    // secure: false, //for testin
    // sameSite: "lax",
    // maxAge: 5 * 60 * 1000, // 5 mins in ms
    // });

    return res.status(200).json({ message: "Login successful", user });
  } catch (err: any) {
    console.error(err);
    return res.status(401).json({ error: err.message || "Login failed" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    // clear the cookie set at login (use same name and compatible options)
    res.clearCookie("token", {
      httpOnly: true,
      //secure: process.env.NODE_ENV === "production",
      secure: false, // keep false for local testing
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Logout failed" });
  }
};

export const castVote = async (req: Request, res: Response) => {
  try {
    const { voucher, presidentCandidateId, vicePresidentCandidateId } =
      req.body ?? {};
    
    if (!voucher || !presidentCandidateId || !vicePresidentCandidateId) {
      return res.status(400).json({
        error:
          "missing vote fields: voucher, presidentCandidateId, vicePresidentCandidateId are required",
      });
    }

    const vote = await AppService.castVote(
      String(voucher),
      Number(presidentCandidateId),
      Number(vicePresidentCandidateId),
    );
    
    return res.status(201).json({ data: vote });
  } catch (err: any) {
    console.error(err);
    
    // Handle specific error cases
    if (err.message === "Voucher has already been used for both positions") {
      return res.status(409).json({ error: "Voucher has already been used for both positions" });
    }
    if (err.message === "You have already voted for this position") {
      return res.status(409).json({ error: "You have already voted for this position" });
    }
    if (err.message === "Database corruption detected for this voucher") {
      return res.status(500).json({ error: "Database corruption detected. Please contact support." });
    }
    
    return res.status(500).json({ error: err.message || "Failed to cast vote" });
  }
};

export const verifyVote = async (req: Request, res: Response) => {
  try {
    const { verification_code, voucher } = req.body ?? {};

    if (!verification_code && !voucher) {
      return res.status(400).json({
        error: "Either 'verification_code' or 'voucher' is required",
      });
    }
    if (verification_code && voucher) {
      return res.status(400).json({
        error: "Provide only one of the two fields",
      });
    }

    let result;
    if (verification_code) {
      const sanitized = InputSanitizer.sanitizeText(String(verification_code).trim(), 100);
      result = await AppService.verifyVoteByCode(sanitized);
    } else {
      const sanitized = InputSanitizer.sanitizeText(String(voucher).trim(), 50);
      result = await AppService.verifyVoteByVoucher(sanitized);
    }

    if (!result) {
      return res.status(404).json({ status: "not found" });
    }

    return res.status(200).json({
      status: "found",
      vote: result.vote,           // backward compatible with current UI
      verification_code: result.verification_code,
      voucher: result.voucher,
      // optional: votes: result.votes   // if you ever want to expose both
    });
  } catch (err) {
    LoggingService.logError(err as Error, { context: "verifyVote" });
    return res.status(500).json({ error: "Verification failed" });
  }
};