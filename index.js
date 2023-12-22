const cwg = require("cwg");
const fs = require("fs");
const csvParse = require("csv-parse/sync");

const SOURCE_FILE = "/home/levidaily/fat/Documents/Birthdays/Ruth/Kreuzwortraetsel_Ruth.tsv";
const DESTINATION_FILE = "/home/levidaily/fat/Documents/Birthdays/Ruth/Kreuzwortraetsel_Ruth.html";
const COLUMNS = 4;

const content = csvParse.parse(fs.readFileSync(SOURCE_FILE), {bom: true, delimiter: "\t", quote: false});

const {ownerMap} = cwg.default(content.map(c => c[0])) // then you can draw the crossword by this result

const wordMap = new Map();

const crossword = [];

for (let x = 0; x < ownerMap.length; x++) {
    const row = [];
    crossword.push(row);
    for (let y = 0; y < ownerMap[x].length; y++) {
        const cell = ownerMap[x][y];
        if (!cell) {
            row.push({});
            continue;
        }
        const crosswordCell = {letter: cell.letter};
        row.push(crosswordCell);
        if (cell.v && !wordMap.has(cell.v)) {
            wordMap.set(cell.v, {x, y});
            crosswordCell.num = cell.v;
        }
        if (cell.h && !wordMap.has(cell.h)) {
            wordMap.set(cell.h, {x, y});
            crosswordCell.num = cell.h;
        }
    }
}

const hints = content.map((c, idx) => `<tr><td>${idx + 1}.</td><td>${c[1]}</td></tr>`);
let hintsTables = [];
const ROWS = Math.ceil(hints.length / COLUMNS);
for (let i = 0; i < COLUMNS; i++) {
    hintsTables.push(`<table>${hints.slice(i * ROWS, (i + 1) * ROWS).join("")}</table>`)
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
    "}";

let html = `<html><style>${css}</style><body><table style="border-spacing: 0;">`;

for (const row of crossword) {
    html += "<tr>";
    for (const cell of row) {
        if (cell.num) {
            html += `<td class="cell letter">${cell.num}</td>`;
        } else if (cell.letter) {
            // html += `<td>${cell.letter}</td>`;
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
console.log(`Processed ${hints.length} words`)

fs.writeFileSync(DESTINATION_FILE, html);
