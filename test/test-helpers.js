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
      id: 1,
      plotname: "First test plot!",
      plotnotes: "yep",
      user_id: 1
    },
    {
      id: 2,
      plotname: "Second test plot!",
      plotnotes: "yep",
      user_id: 1
    },
    {
      id: 3,
      plotname: "Third test plot!",
      plotnotes: "yep",
      user_id: 2
    },
    {
      id: 4,
      plotname: "Fourth test plot!",
      plotnotes: "yep",
      user_id: 2
    }
  ];
}

function makeCropsArray() {
  return [
    {
      cropname: "corn",
      dateplanted: "2018-1-9",
      dateharvested: "2018-2-9",
      cropnotes: "lorem",
      plotid: 1
    },
    {
      cropname: "corn",
      dateplanted: "2018-1-9",
      dateharvested: "2018-2-9",
      cropnotes: "lorem",
      plotid: 2
    },
    {
      cropname: "corn",
      dateplanted: "2018-1-9",
      dateharvested: "2018-2-9",
      cropnotes: "lorem",
      plotid: 3
    },
    {
      cropname: "corn",
      dateplanted: "2018-1-9",
      dateharvested: "2018-2-9",
      cropnotes: "lorem",
      plotid: 4
    }
  ];
}

const expectedPlots = [
  {
    id: 1,
    plotname: "First test plot!",
    plotnotes: "yep",
    cropname: "corn",
    dateplanted: "2018-01-09T00:00:00.000Z",
    dateharvested: "2018-02-09T00:00:00.000Z",
    cropnotes: "lorem",
    username: "dunder"
  },
  {
    id: 2,
    plotname: "Second test plot!",
    plotnotes: "yep",
    cropname: "corn",
    dateplanted: "2018-01-09T00:00:00.000Z",
    dateharvested: "2018-02-09T00:00:00.000Z",
    cropnotes: "lorem",
    username: "dunder"
  },
  {
    id: 3,
    plotname: "Third test plot!",
    plotnotes: "yep",
    cropname: "corn",
    dateplanted: "2018-01-09T00:00:00.000Z",
    dateharvested: "2018-02-09T00:00:00.000Z",
    cropnotes: "lorem",
    username: "test"
  },
  {
    id: 4,
    plotname: "Fourth test plot!",
    plotnotes: "yep",
    cropname: "corn",
    dateplanted: "2018-01-09T00:00:00.000Z",
    dateharvested: "2018-02-09T00:00:00.000Z",
    cropnotes: "lorem",
    username: "test"
  }
];

function makeMaliciousPlot() {
  const maliciousPlot = {
    id: 911,
    plotName: 'Naughty naughty very naughty <script>alert("xss");</script>',
    plotNotes: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  };
  const expectedPlot = {
    ...maliciousPlot,
    title:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    summary: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
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
    users, crops, plots RESTART IDENTITY CASCADE`
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
  makeCropsArray,
  expectedPlots
};
