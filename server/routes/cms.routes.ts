import { Router, Request, Response } from "express";
import { getSection, setSection, getPage, setPage } from "../cms";

const router = Router();

// CMS endpoints
router.get("/api/cms/:section", (req: Request, res: Response) => {
  const section = req.params.section;
  const data = getSection(section);
  if (!data) return res.status(404).json({ error: "Section not found" });
  res.json(data);
});

// Basic admin setter (protected via ADMIN_TOKEN header)
router.put("/api/cms/:section", (req: Request, res: Response) => {
  const token = req.header("x-admin-token");
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res.status(500).json({ error: "ADMIN_TOKEN is not configured on the server" });
  }
  if (!token || token !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const section = req.params.section;
  const updated = setSection(section, req.body);
  res.json(updated);
});

// CMS pages endpoints
router.get("/api/cms/pages/:slug", (req: Request, res: Response) => {
  const page = getPage(req.params.slug);
  if (!page) return res.status(404).json({ error: "Page not found" });
  res.json(page);
});

router.put("/api/cms/pages/:slug", (req: Request, res: Response) => {
  const token = req.header("x-admin-token");
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return res.status(500).json({ error: "ADMIN_TOKEN is not configured on the server" });
  if (!token || token !== expected) return res.status(401).json({ error: "Unauthorized" });
  const updated = setPage(req.params.slug, req.body);
  res.json(updated);
});

export default router;
