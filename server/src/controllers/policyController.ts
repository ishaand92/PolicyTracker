// controllers/policyController.ts
import { RequestHandler } from 'express';
import PolicyModel from '../models/PolicyModel';

export const getAllPolicies: RequestHandler = async (req, res, next) => {
  try {
    const {
      page = '1',
      limit = '20',
      q = '',                 // text search in name/title/description
      country,
      status,                 // e.g., "In force"
      sector,
      sort = 'last_update:-1' // "field:dir"
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);

    const filter: Record<string, any> = {};
    if (country) filter.country_iso = country;
    if (status) filter.policy_status = status;
    if (sector) filter.sector = sector;
    if (q) {
      filter.$or = [
        { policy_name: { $regex: q, $options: 'i' } },
        { policy_title: { $regex: q, $options: 'i' } },
        { policy_description: { $regex: q, $options: 'i' } },
      ];
    }

    // sort="field:dir"
    let sortSpec: Record<string, 1 | -1> = {};
    if (sort) {
      const [field, dir] = sort.split(':');
      sortSpec = { [field]: dir === '-1' || dir === 'desc' ? -1 : 1 };
    }

    // projection—return only what the UI needs
    const projection = {
      policy_name: 1,
      policy_title: 1,
      country_iso: 1,
      sector: 1,
      policy_status: 1,
      last_update: 1,
      start_date: 1,
      end_date: 1,
    };

    const [items, total] = await Promise.all([
      PolicyModel.find(filter, projection)
        .sort(sortSpec)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      PolicyModel.countDocuments(filter),
    ]);

    res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getPolicyById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const policy = await PolicyModel.findById(id).lean();
    if (!policy) {
      res.status(404).json({ message: 'Policy not found' });
      return;
    }
    res.json(policy);
  } catch (error) {
    next(error);
  }
};
