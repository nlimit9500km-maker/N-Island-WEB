const https = require('https');

const ids = [286344704, 247689000, 252194342, 170401268, 146310360, 239924116];

ids.forEach(id => {
  https.get(`https://music.163.com/api/album/${id}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const date = new Date(json.album.publishTime);
        console.log(`${id}: ${date.toISOString().split('T')[0]}`);
      } catch (e) {
        console.log(`${id}: Error`);
      }
    });
  });
});
