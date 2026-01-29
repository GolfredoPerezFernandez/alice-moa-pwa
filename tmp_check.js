const fs = require("fs");
const t = fs.readFileSync("server/@qwik-city-plan.mjs", "utf8");
const m = [...t.matchAll(/\/auth[^'" ]*reset-password/g)];
console.log(m.length);
console.log(m.slice(0,5).map(x=>x[0]));
