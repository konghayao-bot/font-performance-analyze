import BigNumber from 'bignumber.js'

export const FontLoadAnalyze = async (reporter:ReturnType<typeof FontPerformanceAnalyze>)=>{
  const sets = await Promise.all(reporter.sets.map(async i=>{
    const [_,url] = i.url.match(/(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/)!
    console.log(url)
    const size = i.hits? await fetch(url).then(res=>res.arrayBuffer()).then(res=>res.byteLength):-1
    return {...i,size}
  }))
  const hit_chunk = sets.map(i=>i.size).filter(i=>i>0)
  return {...reporter,sets,hit_size:hit_chunk.reduce((a,b)=>a+b,0),hit_chunk}
}

export const FontPerformanceAnalyze = (css: string, renderText: string) => {
  const cssMessage = decodeCSS(css);

  const textCodes = new Set(renderText.split("").map((i) => i.charCodeAt(0)));
  const sets =  cssMessage
    .map((set) => {
      const count = new Map<number, number>();
      textCodes.forEach((i) => {
        if (set.char.has(i)) {
          count.set(i, count.has(i) ? count.get(i)! + 1 : 1);
        }
      });
      return {
        url: set.url,
        // count: Object.fromEntries(count.entries()),
        hits: count.size,
        total: set.char.size,
      };
    })
    .sort((a, b) => {
      return b.hits - a.hits;
    });
    const hit = sets.reduce((col,cur)=>{
      return  [col[0]+cur.hits,col[1]+cur.total]
    },[0,0])
    return {
      hit_rate:[...hit,new BigNumber(hit[0]).div(hit[1]).toString()],
      hit_count:sets.filter(i=>i.hits).length,
      sets
    }
};

export const decodeCSS = (css: string) => {
  const collection: {
    char: Set<number>;
    face: string;
    url: string;
  }[] = [];
  for (const face of css.match(/@font-face[\s\S]+?\}/g)!) {
    const char = new Set<number>();
    const range = face.match(/unicode-range:(.*(?:[,;]))+/)![1];

    range
      .split(/[,;]/)
      .map((i) => i.trim())
      .filter(Boolean)
      .forEach((i) => {
        i = i.replace("U+", "");
        if (i.includes("-")) {
          const [start, end] = i.split("-").map((i) => parseInt("0x" + i));
          for (let index = start; index <= end; index++) {
            char.add(index);
          }
        } else {
          char.add(parseInt("0x" + i));
        }
      });
    collection.push({
      char,
      face,
      url: face.match(/src:.*url\((.*?)\)/)![1],
    });
  }
  return collection;
};
