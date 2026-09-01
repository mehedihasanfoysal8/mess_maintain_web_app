const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://localhost:3000/api/members/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetUserId: '60c72b2f9b1e8a0015f6f3a3', // Need a valid ID, but let's just see if it errors out
      action: 'change_role',
      role: 'Guest'
    })
  });
  const data = await res.json();
  console.log(data);
}

test();
