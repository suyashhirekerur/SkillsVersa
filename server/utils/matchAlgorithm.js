import User from '../models/User.js';

const getSkillName = (skill) => {
  if (!skill) return '';
  if (typeof skill === 'string') return skill.trim().toLowerCase();
  if (typeof skill === 'object' && skill.name) return String(skill.name).trim().toLowerCase();
  return String(skill).trim().toLowerCase();
};

const getSkillCategory = (skill) => {
  if (!skill || typeof skill !== 'object') return '';
  return skill.category ? String(skill.category).trim().toLowerCase() : '';
};

export const findMatches = async (currentUser, options = {}) => {
  try {
    let user = currentUser;

    // If ID is passed or skills are missing, fetch user from DB
    if (!user || typeof user === 'string' || !user.skillsToTeach || !user.skillsToLearn) {
      const userId = typeof currentUser === 'object' && currentUser._id ? currentUser._id : currentUser;
      user = await User.findById(userId);
      if (!user) {
        throw new Error('Current user not found');
      }
    }

    const { limit = 20, category = null, skill = null } = options;

    // Fetch all users except current user (exclude password)
    const otherUsers = await User.find({ _id: { $ne: user._id } }).select('-password');

    const myTeachSkills = user.skillsToTeach || [];
    const myLearnSkills = user.skillsToLearn || [];

    const myLearnNames = myLearnSkills.map(getSkillName).filter(Boolean);
    const myTeachNames = myTeachSkills.map(getSkillName).filter(Boolean);

    const matches = [];

    for (const otherUser of otherUsers) {
      const startTeachSkills = otherUser.skillsToTeach || [];
      const startLearnSkills = otherUser.skillsToLearn || [];

      // teachMatch: skills where their skillsToTeach match any of currentUser's skillsToLearn
      const teachMatch = startTeachSkills.filter((s) => {
        const name = getSkillName(s);
        return name && myLearnNames.includes(name);
      });

      // learnMatch: skills where currentUser's skillsToTeach match any of their skillsToLearn
      const learnMatch = startLearnSkills.filter((s) => {
        const name = getSkillName(s);
        return name && myTeachNames.includes(name);
      });

      // Include users only with at least one overlap
      if (teachMatch.length === 0 && learnMatch.length === 0) {
        continue;
      }

      const isMutual = teachMatch.length > 0 && learnMatch.length > 0;

      // Filter by category if specified
      if (category) {
        const catLower = category.trim().toLowerCase();
        const matchesCategory =
          startTeachSkills.some((s) => getSkillCategory(s) === catLower) ||
          startLearnSkills.some((s) => getSkillCategory(s) === catLower);
        if (!matchesCategory) continue;
      }

      // Filter by skill name if specified
      if (skill) {
        const skillLower = skill.trim().toLowerCase();
        const matchesSkill =
          startTeachSkills.some((s) => getSkillName(s).includes(skillLower)) ||
          startLearnSkills.some((s) => getSkillName(s).includes(skillLower));
        if (!matchesSkill) continue;
      }

      // Score calculation
      const mutualCount = Math.min(teachMatch.length, learnMatch.length);
      const oneWayTeachCount = teachMatch.length - mutualCount;
      const oneWayLearnCount = learnMatch.length - mutualCount;

      let matchScore = 0;
      // +5 points per mutual skill overlap (in both directions)
      matchScore += mutualCount * 5;
      // +3 points per one-way teachMatch
      matchScore += oneWayTeachCount * 3;
      // +2 points per one-way learnMatch
      matchScore += oneWayLearnCount * 2;

      // +1 point per 0.5 average rating of the other user
      const avgRating = otherUser.averageRating ?? otherUser.rating ?? 0;
      matchScore += Math.floor(avgRating / 0.5);

      // +1 bonus if user has > 30 credits (reliable exchanger)
      if ((otherUser.credits || 0) > 30) {
        matchScore += 1;
      }

      matches.push({
        user: otherUser,
        matchScore,
        matchedSkills: {
          theyTeachYou: teachMatch,
          youTeachThem: learnMatch,
        },
        isMutual,
      });
    }

    // Sort by score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply limit if specified
    if (limit && limit > 0) {
      return matches.slice(0, limit);
    }

    return matches;
  } catch (error) {
    console.error('Error in findMatches:', error.message);
    throw error;
  }
};

export const exploreUsers = async (filters = {}) => {
  try {
    const { category, skill, page = 1, limit = 10, excludeUserId } = filters;

    const query = {};

    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const conditions = [];

    if (category) {
      const categoryRegex = new RegExp(category, 'i');
      conditions.push({
        $or: [
          { skillsToTeach: { $elemMatch: { category: categoryRegex } } },
          { skillsToLearn: { $elemMatch: { category: categoryRegex } } },
          { skillsToTeach: categoryRegex },
          { skillsToLearn: categoryRegex },
        ],
      });
    }

    if (skill) {
      const skillRegex = new RegExp(skill, 'i');
      conditions.push({
        $or: [
          { skillsToTeach: { $elemMatch: { name: skillRegex } } },
          { skillsToLearn: { $elemMatch: { name: skillRegex } } },
          { skillsToTeach: skillRegex },
          { skillsToLearn: skillRegex },
        ],
      });
    }

    if (conditions.length > 0) {
      query.$and = conditions;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNum);

    return {
      users,
      totalCount,
      page: pageNum,
      totalPages,
    };
  } catch (error) {
    console.error('Error in exploreUsers:', error.message);
    throw error;
  }
};

export default {
  findMatches,
  exploreUsers,
};
