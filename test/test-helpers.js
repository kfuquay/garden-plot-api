const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      username: "dunder",
      password: "dunder",
    },
    {
      id: 2,
      username: "test",
      password: "test",
    },
  ];
}

function makePlotsArray() {
  return [
    {
      id: 1,
      plotName: "First test plot!",
      plotNotes: "yep",

    },
    {
      id: 2,
      plotName: "Second test plot!",
      plotNotes: "yep",
    },
    {
        id: 3,
      plotName: "Third test plot!",
      plotNotes: "yep",
    },
    {
     id: 4,
      plotName: "Fourth test plot!",
      plotNotes: "yep",
    },
  ];
}



// const expectedProjects = [
//   {
//     id: 1,
//     title: "First test project!",
//     summary:
//       "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
//     user_id: 1,
//     materials: ["one", "two"],
//     steps: ["one", "two"],
//     username: "dunder",
//   },
//   {
//     id: 2,
//     title: "second test project",
//     summary: "zzzz",
//     user_id: 1,
//     materials: ["one", "two"],
//     steps: ["one", "two"],
//     username: "dunder",
//   },
//   {
//     id: 3,
//     title: "third test project!!",
//     summary: "okokok",
//     user_id: 2,
//     materials: ["one", "two"],
//     steps: ["one", "two"],
//     username: "test",
//   },
//   {
//     id: 4,
//     title: "FOURTH TITLE",
//     summary: "summmmaryy",
//     user_id: 2,
//     materials: ["one", "two"],
//     steps: ["one", "two"],
//     username: "test",
//   },
// ];

// function makeMaliciousProject() {
//   const maliciousProject = {
//     id: 911,
//     title: 'Naughty naughty very naughty <script>alert("xss");</script>',
//     summary: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
//   };
//   const expectedProject = {
//     ...maliciousProject,
//     title:
//       'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
//     summary: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
//   };
//   return {
//     maliciousProject,
//     expectedProject,
//   };
// }

function makePlotsFixtures() {
  const testUsers = makeUsersArray();
  const testProjects = makePlotsArray(testUsers);
  return { testUsers, testProjects };
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
    password: bcrypt.hashSync(user.password, 1),
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
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeAuthHeader,
  seedUsers,
  cleanTables,
  makePlotsFixtures,
  makeUsersArray,
};
