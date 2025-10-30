import { Request, Response } from "express";
import AppService from "../services/app.service";

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
    if (Number.isNaN(positionId)) return res.status(400).json({ error: "invalid position id" });
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
    if (!position_name) return res.status(400).json({ error: "position_name is required" });

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
    if (Number.isNaN(positionId)) return res.status(400).json({ error: "invalid position id" });

    const { name, manifesto } = req.body;
    if (!name) return res.status(400).json({ error: "candidate name is required" });

    const candidate = await AppService.createCandidate(positionId, name, manifesto);
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
    res.cookie("token", token, {
      httpOnly: true,
      //secure: process.env.NODE_ENV === "production", //apply in prodcution
      secure: false, //for testin
      sameSite: "lax",
      maxAge: 5 * 60 * 1000, // 5 mins in ms
    });

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
    // CRITICAL FIX: The backend must explicitly check for the sequential payload
    const { voucher, candidateId, positionId } = req.body ?? {};
    
    if (!voucher || !candidateId || !positionId) {
      // NOTE: This is the error message the frontend relies on to show the correct failure type
      return res.status(400).json({ error: "missing vote fields: voucher, candidateId, positionId are required" });
    }
    
    // Ensure data types are correct before sending to service
    const positionIdNumber = Number(positionId);
    const candidateIdNumber = Number(candidateId);
    
    if (isNaN(positionIdNumber) || isNaN(candidateIdNumber)) {
       return res.status(400).json({ error: "Candidate ID or Position ID is not a valid number" });
    }
    
    // Call the service with the validated data
    const vote = await AppService.castVote(String(voucher), candidateIdNumber, positionIdNumber);
    
    // The successful response should reflect a single vote submission
    return res.status(201).json({ data: vote });
  } catch (err: any) {
    console.error(err);
    // The service layer throws a specific error, which we catch
    if (err.message.includes("Voucher already used")) {
         return res.status(400).json({ error: "Voucher already used for this position." });
    }
    return res.status(500).json({ error: "Failed to cast vote" });
  }
};

export const verifyVote = async (req: Request, res: Response) => {
  try {
    const { verification_code } = req.body ?? {};
    if (!verification_code) return res.status(400).json({ error: "verification_code is required" });

    const vote = await AppService.verifyVoteByCode(String(verification_code));
    if (vote) {
      return res.status(200).json({ status: "found", vote });
    } else {
      return res.status(404).json({ status: "not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Verification failed" });
  }
};