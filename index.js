const cwg = require("cwg");
const fs = require("fs");
const csvParse = require("csv-parse/sync");

const SOURCE_FILE = "/home/levidaily/fat/Documents/Birthdays/Ruth/Kreuzwortraetsel_Ruth.tsv";
const DESTINATION_FILE = "/home/levidaily/fat/Documents/Birthdays/Ruth/Kreuzwortraetsel_Ruth.html";
const COLUMNS = 4;

const content = csvParse.parse(fs.readFileSync(SOURCE_FILE), {bom: true, delimiter: "\t", quote: false});

const {positionObjArr, width, height} = cwg.default(content.map(c => c[0]));

const crossword = Array.from({length: width}, () => Array.from({length: height}, () => ({occupied: false, wordNum: {}})));
for (const word of positionObjArr) {
    if (word.isHorizon) {
        crossword[word.xNum][word.yNum].wordNum.horizontal = content.findIndex(elem => elem[0] === word.wordStr) + 1;
        for (let x = word.xNum; x < word.xNum + word.wordStr.length; x++) {
            crossword[x][word.yNum].occupied = true;
        }
    } else {
        crossword[word.xNum][word.yNum].wordNum.vertical = content.findIndex(elem => elem[0] === word.wordStr) + 1;
        for (let y = word.yNum; y < word.yNum + word.wordStr.length; y++) {
            crossword[word.xNum][y].occupied = true;
        }
    }
}

const hints = content.map((c, idx) => `<tr><td>${idx + 1}.</td><td>${c[1]}</td></tr>`);
let hintsTables = [];
const ROWS = Math.ceil(hints.length / COLUMNS);
for (let i = 0; i < COLUMNS; i++) {
    hintsTables.push(`<table>${hints.slice(i * ROWS, (i + 1) * ROWS).join("")}</table>`);
}

const css = "" +
    ".cell {" +
    "  width: 26px;" +
    "  height: 30px;" +
    "  min-width: 26px;" +
    "}" +
    ".letter {" +
    "  border: 1px solid black;" +
    "  font-size: 9px;" +
    "  text-align: left;" +
    "  vertical-align: text-top;" +
    "}" +
    ".relative {" +
    "  position: relative;" +
    "}" +
    ".left {" +
    "  position: absolute;" +
    "  transform: translateX(-60%);" +
    "}" +
    ".upper {" +
    "  position: absolute;" +
    "  transform: translateY(-50%);" +
    "}";

let html = `<html><style>${css}</style><body><table style="border-spacing: 0;">`;

for (const row of crossword) {
    html += "<tr>";
    for (const cell of row) {
        if (cell.wordNum.horizontal !== undefined && cell.wordNum.vertical !== undefined) {
            const numElements = `<div class="cell left">${cell.wordNum.vertical}</div><div class="cell upper">${cell.wordNum.horizontal}</div>`;
            html += `<td class="cell letter relative">${numElements}</td>`;
        } else if (cell.wordNum.horizontal !== undefined) {
            html += `<td class="cell letter">${cell.wordNum.horizontal}</td>`;
        } else if (cell.wordNum.vertical !== undefined) {
            html += `<td class="cell letter">${cell.wordNum.vertical}</td>`;
        } else if (cell.occupied) {
            html += `<td class="cell letter"></td>`;
        } else {
            html += `<td class="cell"></td>`;
        }
    }
    html += "</tr>";
}

html += "</table>" +
    "<div style='display: flex; width: fit-content;'>" + hintsTables.join("") + "</div>" +
    "</body></html>";
console.log(`Processed ${hints.length} words`);

fs.writeFileSync(DESTINATION_FILE, html);
