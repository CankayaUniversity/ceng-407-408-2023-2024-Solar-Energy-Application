const express = require("express");
const Address = require("../Models/Address");
const Customer = require("../Models/Customer");
const Project = require("../Models/Project");
const router = express.Router();

router.post("/project/create-project", async (req, res) => {
//   console.log("project req", reg.body);
  const projectData = req.body;
  const project = new Project(projectData);
  try {
    await project.save();
    res.status(201).send(project);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/project", async (req, res) => {
  try {
    const queryParams = req.quary
    console.log("projectquary",queryParams)
    const project = await Project.find(queryParams);
    if (!project) {
      throw new Error("No project found");
    }
    res.status(201).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/project/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new Error("No project found");
    }
    res.status(201).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/project/:id", async (req, res) => {
  const project = req.project;
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!project) {
      throw new Error("No project found");
    }
    res.status(201).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/project/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      throw new Error("No project found");
    }

    res.status(201).send(project);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
