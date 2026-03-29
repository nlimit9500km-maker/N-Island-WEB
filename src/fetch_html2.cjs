const https = require('https');

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
  const html = await fetchAlbumHtml(286344704);
  console.log(html.substring(0, 1000));
}

main();
