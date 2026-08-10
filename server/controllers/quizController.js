import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Predefined Quiz Question Bank
const QUIZZES = [
  {
    id: 'react-dev',
    title: 'React Development Verification',
    skill: 'React',
    category: 'Development',
    icon: '⚡',
    questions: [
      {
        id: 1,
        question: 'Which hook is used to handle side effects in React function components?',
        options: ['useState', 'useContext', 'useEffect', 'useReducer'],
        answer: 2
      },
      {
        id: 2,
        question: 'What is the purpose of React keys when rendering lists?',
        options: ['Style list elements', 'Help React identify which items have changed or been re-ordered', 'Bind event handlers', 'Create global variables'],
        answer: 1
      },
      {
        id: 3,
        question: 'How do you pass data down from parent to child components in React?',
        options: ['State', 'Props', 'Redux', 'LocalStorage'],
        answer: 1
      },
      {
        id: 4,
        question: 'What hook would you use to store mutable value that persists across renders without triggering a re-render?',
        options: ['useMemo', 'useCallback', 'useRef', 'useState'],
        answer: 2
      },
      {
        id: 5,
        question: 'What is Virtual DOM in React?',
        options: ['A direct reference to real DOM', 'A lightweight in-memory representation of real DOM', 'A database engine', 'A CSS styling framework'],
        answer: 1
      }
    ]
  },
  {
    id: 'python-core',
    title: 'Python Programming Master',
    skill: 'Python',
    category: 'Development',
    icon: '🐍',
    questions: [
      {
        id: 1,
        question: 'Which keyword is used to create a function in Python?',
        options: ['function', 'def', 'create', 'func'],
        answer: 1
      },
      {
        id: 2,
        question: 'What data structure in Python is immutable?',
        options: ['List', 'Dictionary', 'Set', 'Tuple'],
        answer: 3
      },
      {
        id: 3,
        question: 'What does list comprehension `[x*2 for x in range(3)]` return?',
        options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[1, 2, 3]'],
        answer: 0
      },
      {
        id: 4,
        question: 'Which method adds an element to the end of a list in Python?',
        options: ['push()', 'append()', 'insert()', 'add()'],
        answer: 1
      },
      {
        id: 5,
        question: 'What is the correct syntax for a try-except block in Python?',
        options: ['try { } catch { }', 'try: ... except:', 'do { } catch { }', 'try ... handle ...'],
        answer: 1
      }
    ]
  },
  {
    id: 'js-fundamentals',
    title: 'JavaScript Essentials',
    skill: 'JavaScript',
    category: 'Development',
    icon: '🟨',
    questions: [
      {
        id: 1,
        question: 'What is the output of `typeof null` in JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        answer: 2
      },
      {
        id: 2,
        question: 'Which operator checks for both value and type equality in JS?',
        options: ['==', '===', '=', '!='],
        answer: 1
      },
      {
        id: 3,
        question: 'What does a Promise represent in JavaScript?',
        options: ['A synchronous function', 'The eventual completion or failure of an asynchronous operation', 'A layout engine', 'A DOM element'],
        answer: 1
      },
      {
        id: 4,
        question: 'Which array method creates a new array with results of calling a function on every element?',
        options: ['forEach()', 'filter()', 'map()', 'reduce()'],
        answer: 2
      },
      {
        id: 5,
        question: 'What is closure in JavaScript?',
        options: ['Closing browser tab', 'A function bundled together with references to its surrounding state', 'An object destructor', 'A CSS animation'],
        answer: 1
      }
    ]
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design Verification',
    skill: 'UI/UX Design',
    category: 'Design',
    icon: '🎨',
    questions: [
      {
        id: 1,
        question: 'What does UX stand for?',
        options: ['User Xerography', 'User Experience', 'User Extension', 'Universal Execution'],
        answer: 1
      },
      {
        id: 2,
        question: 'Which principle ensures high contrast between text and background for accessibility?',
        options: ['Fitts Law', 'WCAG Contrast Ratio', 'Hick Law', 'Gestalt Principle'],
        answer: 1
      },
      {
        id: 3,
        question: 'What is wireframing in UI design?',
        options: ['Final high-fidelity interactive prototype', 'Low-fidelity structural blueprint of a page layout', 'Writing CSS code', 'Backend database schema'],
        answer: 1
      },
      {
        id: 4,
        question: 'Which tool is industry-standard for vector graphics & UI prototype collaboration?',
        options: ['MS Paint', 'Figma', 'Wordpad', 'Excel'],
        answer: 1
      },
      {
        id: 5,
        question: 'What is the main objective of User Personas?',
        options: ['To select website color palettes', 'To represent target user archetypes and synthesize user research', 'To measure website latency', 'To write legal disclaimers'],
        answer: 1
      }
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science & Machine Learning',
    skill: 'Data Science',
    category: 'Development',
    icon: '📊',
    questions: [
      {
        id: 1,
        question: 'Which Python library is primary for numerical arrays and matrix operations?',
        options: ['Pandas', 'NumPy', 'Requests', 'Flask'],
        answer: 1
      },
      {
        id: 2,
        question: 'What type of machine learning uses labeled datasets to train algorithms?',
        options: ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Zero-shot Learning'],
        answer: 1
      },
      {
        id: 3,
        question: 'What does EDA stand for in data analysis?',
        options: ['Estimated Data Alignment', 'Exploratory Data Analysis', 'External Data Architecture', 'Everyday Data Access'],
        answer: 1
      },
      {
        id: 4,
        question: 'Which evaluation metric measures the ratio of true positives to all predicted positives?',
        options: ['Recall', 'Precision', 'MSE', 'Accuracy'],
        answer: 1
      },
      {
        id: 5,
        question: 'Which algorithm is commonly used for classification based on decision trees ensemble?',
        options: ['K-Means', 'Random Forest', 'Linear Regression', 'PCA'],
        answer: 1
      }
    ]
  }
];

const getQuizzes = asyncHandler(async (req, res) => {
  // Strip answer indices when sending quizzes list to client for security
  const safeQuizzes = QUIZZES.map(q => ({
    ...q,
    questions: q.questions.map(({ answer, ...rest }) => rest)
  }));
  res.json({ success: true, data: safeQuizzes });
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;
  const quiz = QUIZZES.find(q => q.id === quizId);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (answers[q.id] === q.answer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = percentage >= 70;

  const user = await User.findById(req.user._id);
  let badgeEarned = null;

  if (passed && user) {
    const existingBadgeIndex = user.badges.findIndex(b => b.name === `${quiz.skill} Verified ⭐`);
    
    badgeEarned = {
      name: `${quiz.skill} Verified ⭐`,
      category: quiz.category,
      icon: quiz.icon,
      score: percentage,
      earnedAt: new Date()
    };

    if (existingBadgeIndex >= 0) {
      user.badges[existingBadgeIndex] = badgeEarned;
    } else {
      user.badges.push(badgeEarned);
      // Award XP bonus (+100 XP)
      user.xp = (user.xp || 0) + 100;
      user.level = Math.floor(user.xp / 200) + 1;
    }

    await user.save();
  }

  res.json({
    success: true,
    passed,
    score: percentage,
    correctCount,
    totalQuestions: quiz.questions.length,
    badge: badgeEarned,
    xpGained: passed ? 100 : 0
  });
});

export { getQuizzes, submitQuiz };
