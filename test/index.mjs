import { FontPerformanceAnalyze ,FontLoadAnalyze} from "../dist/index.js";
import fs from "fs-extra";

const testFile = "chatgpt-baidu"
for (const css of fs.readdirSync("./data/css")) {
  const path = "./data/css/" + css;
  const file = fs.readFileSync(path, "utf-8");
  const text = fs.readFileSync(`./data/test-sets/${testFile}.txt`, "utf-8");
  const res =await  FontLoadAnalyze(FontPerformanceAnalyze(file, text))
  fs.outputFile(
    `./dist/reporter/${testFile}/${css}.json`,
    JSON.stringify(res, null, 4)
  );
}
