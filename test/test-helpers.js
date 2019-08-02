const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      username: "dunder",
      password: "dunder"
    },
    {
      id: 2,
      username: "test",
      password: "test"
    }
  ];
}

function makePlotsArray() {
  return [
    {
      plotid: 1,
      plotname: "First test plot!",
      plotnotes: "yep",
        crops:{"crops": [
          {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
          {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
          {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      ]},
      user_id: 1
    },
    {
      plotid: 2,
      plotname: "Second test plot!",
      plotnotes: "yep",
      user_id: 1,
      crops:{"crops": [
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
    ]},
    },
    {
      plotid: 3,
      plotname: "Third test plot!",
      plotnotes: "yep",
      user_id: 2,
      crops:{"crops": [
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
    ]},
    },
    {
      plotid: 4,
      plotname: "Fourth test plot!",
      plotnotes: "yep",
      user_id: 2,
      crops:{"crops": [
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
    ]},
    }
  ];
}
const expectedPlots = [
  {
    plotid: 1,
    plotname: "First test plot!",
    plotnotes: "yep",
      crops:{"crops": [
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
    ]},
    username: "dunder"
  },
  {
    plotid: 2,
    plotname: "Second test plot!",
    plotnotes: "yep",
    crops:{"crops": [
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
  ]},
    username: "dunder"
  },
  {
    plotid: 3,
    plotname: "Third test plot!",
    plotnotes: "yep",
    crops:{"crops": [
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
  ]},
    username: "test"
  },
  {
    plotid: 4,
    plotname: "Fourth test plot!",
    plotnotes: "yep",
    crops:{"crops": [
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
  ]},
    username: "test"
  }
];

const expectedDeleteResults = [
  {
    plotid: 1,
    plotname: "First test plot!",
    plotnotes: "yep",
      crops:{"crops": [
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
        {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
    ]},
    username: "dunder"
  },
  {
    plotid: 3,
    plotname: "Third test plot!",
    plotnotes: "yep",
    crops:{"crops": [
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
  ]},
    username: "test"
  },
  {
    plotid: 4,
    plotname: "Fourth test plot!",
    plotnotes: "yep",
    crops:{"crops": [
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
      {"cropname":"test cropname", "cropnotes":"testcropnotes", "dateplanted": "2019-1-9", "dateharvested": "2019-2-9"},
  ]},
    username: "test"
  }
];

function makeMaliciousPlot() {
  const maliciousPlot = {
    plotid: 911,
    plotname: 'Naughty naughty very naughty <script>alert("xss");</script>',
    plotnotes: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  };
  const expectedPlot = {
    plotid: 911,
    plotname:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    plotnotes: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  };

  return {
    maliciousPlot,
    expectedPlot
  };
}

function makePlotsFixtures() {
  const testUsers = makeUsersArray();
  const testPlots = makePlotsArray(testUsers);
  return { testUsers, testPlots };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
    users, plots RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: "HS256"
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeAuthHeader,
  seedUsers,
  cleanTables,
  makePlotsFixtures,
  makeUsersArray,
  makeMaliciousPlot,
  makePlotsArray,
  expectedPlots,
  expectedDeleteResults
};
