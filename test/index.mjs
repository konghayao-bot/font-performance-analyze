import { FontPerformanceAnalyze ,FontLoadAnalyze} from "../dist/index.js";
import fs from "fs-extra";

for (const css of fs.readdirSync("./data/css")) {
  const path = "./data/css/" + css;
  const file = fs.readFileSync(path, "utf-8");
  const text = fs.readFileSync("./data/test-sets/daliy.txt", "utf-8");
  const res =await  FontLoadAnalyze(FontPerformanceAnalyze(file, text))
  fs.writeFile(
    `./dist/reporter/${css}.json`,
    JSON.stringify(res, null, 4)
  );
}
