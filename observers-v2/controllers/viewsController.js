const crypto = require('crypto');

const User = require('../models/userModel');
const Topic = require('../models/topicModel');
const Tag = require('../models/tagModel');
const Report = require('../models/reportModel');
const categories = require('../models/topicCategories');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const QueryHelper = require('../utils/queryHelper');

exports.getOverview = catchAsync(async (req, res, next) => {
  let tagsQuery;
  if (req.query && req.query.tags) {
    if (Array.isArray(req.query.tags)) {
      tagsQuery = req.query.tags.map(t => t.toLowerCase().split('|'));
      tagsQuery = [].concat.apply([], tagsQuery);
    } else {
      tagsQuery = req.query.tags.toLowerCase().split('|');
    }
    delete req.query.tags;
  }
  const query = new QueryHelper(
    Topic.find().populate({ path: 'tags' }),
    req.query
  )
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const _topics = await query.query;

  // Filter topics by tags
  let topics = [];
  if (tagsQuery) {
    _topics.forEach(topic => {
      let intersection = topic.tags.filter(v =>
        tagsQuery.includes(v.name.toLowerCase())
      );
      if (intersection.length > 0) {
        topics.push(topic);
      }
    });
  } else {
    topics = _topics;
  }

  const tags = await Tag.find();

  const mostPopularTopicsQuery = new QueryHelper(Topic.find(), {
    limit: 5,
    sort: '+reportCount',
    fields: 'title,category,createdAt,reportCount,slug'
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const mostPopularTopics = await mostPopularTopicsQuery.query;

  res.status(200).render('overview', {
    title: 'Topics overview',
    topics,
    tags,
    categories,
    mostPopularTopics,
    nomatch: topics.length <= 0,
    active: 'home'
  });
});

exports.getTopic = catchAsync(async (req, res, next) => {
  const topic = await Topic.findOne({ slug: req.params.slug })
    .populate({ path: 'tags' })
    .populate({ path: 'reports', populate: 'votes' });

  if (!topic) {
    return new AppError('Topic not found', 404);
  }

  const tags = await Tag.find();

  res.status(200).render('topicNew', {
    title: topic.title,
    topic,
    categories,
    tags,
    active: 'none'
  });
});

exports.login = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.signup = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Become an observer'
  });
};

exports.getMe = catchAsync(async (req, res, next) => {
  const topics = await Topic.find({ author: req.user._id }).populate({
    path: 'tags'
  });
  const reports = await Report.find({ author: req.user._id }).populate({
    path: 'topic',
    select: 'title slug'
  });
  const tags = await Tag.find();

  res.status(200).render('user', {
    title: 'Your account',
    tags,
    categories,
    topics,
    reports,
    active: 'me'
  });
});

exports.forgotPassword = (req, res, next) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot password'
  });
};

exports.about = (req, res, next) => {
  res.status(200).render('about', {
    title: 'About the project',
    active: 'about'
  });
};

exports.resetUserPassword = catchAsync(async (req, res, next) => {
  const passwordResetToken = await crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 401));
  }

  res.status(200).render('resetPassword', {
    resetToken: req.params.resetToken
  });
});
