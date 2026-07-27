import Incident from '../models/Incident.js';

export const createIncident = async (req, res, next) => {
  try {
    const incident = await Incident.create({
      ...req.body,
      reportedBy: req.user?._id || req.user?.id,
    });
    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
};

export const getIncidents = async (req, res, next) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    next(error);
  }
};

export const getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json(incident);
  } catch (error) {
    next(error);
  }
};

export const updateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json(incident);
  } catch (error) {
    next(error);
  }
};

export const updateIncidentStatus = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json(incident);
  } catch (error) {
    next(error);
  }
};

export const triggerLockdown = async (req, res, next) => {
  try {
    res.json({ message: 'Lockdown triggered' });
  } catch (error) {
    next(error);
  }
};

export const getOpenIncidentsCount = async (req, res, next) => {
  try {
    const count = await Incident.countDocuments({ status: { $ne: 'resolved' } });
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

export const deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json({ message: 'Incident deleted' });
  } catch (error) {
    next(error);
  }
};
