const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function fetchUserData(username) {
    try {
        const { data } = await axios.post('https://users.roblox.com/v1/usernames/users', {
            usernames: [username], excludeBannedUsers: false
        });
        
        if (!data.data.length) return console.log("User not found.");
        
        const userId = data.data[0].id;
        const urls = [
            `https://users.roblox.com/v1/users/${userId}`,
            `https://groups.roblox.com/v1/users/${userId}/groups/roles`,
            `https://friends.roblox.com/v1/users/${userId}/friends/count`
        ];
        
        const [{ data: user }, { data: groups }, { data: friends }] = await Promise.all(urls.map(url => axios.get(url)));
        
        console.log(`Name: ${user.name}`);
        console.log(`NickName: ${user.displayName}`);
        console.log(`ID: ${userId}`);
        console.log(`Created: ${user.created}`);
        console.log(`Friends: ${friends.count === 1000 ? 'MAX' : friends.count}`);
        console.log(`Status Ban: ${user.isBanned ? 'Ban' : 'UnBan'}`);
        console.log(`Bio: ${user.description || 'Nothing'}`);
        console.log(`How Many Groups: ${groups.data.length}\n`);
        
        if (groups.data.length) {
            console.log("Groups:");
            groups.data.forEach(group => {
                console.log(`- ${group.group.name} (Owner: ${group.group.owner.username})`);
            });
        } else {
            console.log("No Group");
        }
    } catch {
        console.log('Error accessing the API');
    }
}

rl.question('Enter your username: ', async (username) => {
    await fetchUserData(username);
    rl.close();
});