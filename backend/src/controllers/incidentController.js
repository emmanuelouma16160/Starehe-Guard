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
    const allowedRoles = ['guard', 'admin', 'super_admin'];
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.severity) {
      query.severity = req.query.severity;
    }

    if (req.query.search) {
      query.$or = [
        { description: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [incidents, total] = await Promise.all([
      Incident.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Incident.countDocuments(query),
    ]);

    res.json({
      incidents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
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
