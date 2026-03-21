async function test() {
  const res = await fetch("https://music.163.com/api/song/lyric?id=1845917986&lv=1&kv=1&tv=-1", {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://music.163.com/"
    }
  });
  const data = await res.json();
  console.log(data.lrc.lyric.substring(0, 200));
}
test();
