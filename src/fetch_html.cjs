const https = require('https');

const ids = [286344704, 247689000, 252194342, 170401268, 146310360, 239924116];

async function fetchAlbumHtml(id) {
  return new Promise((resolve, reject) => {
    https.get(`https://music.163.com/album?id=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function main() {
  for (const id of ids) {
    const html = await fetchAlbumHtml(id);
    const match = html.match(/发行时间：([^<]+)/);
    if (match) {
      console.log(`${id}: ${match[1].trim()}`);
    } else {
      console.log(`${id}: Not found`);
    }
  }
}

main();
