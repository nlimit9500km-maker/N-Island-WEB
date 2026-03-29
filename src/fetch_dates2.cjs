const https = require('https');

const ids = [252194342, 146310360, 239924116];

async function fetchAlbum(id) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.imjad.cn/cloudmusic/?type=album&id=${id}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  for (const id of ids) {
    const data = await fetchAlbum(id);
    if (data.album && data.album.publishTime) {
      const date = new Date(data.album.publishTime);
      console.log(`${id}: ${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
    } else {
      console.log(`${id}: Not found`);
    }
  }
}

main();
