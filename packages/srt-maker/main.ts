import * as fs from 'fs';

const inputFile = 'input.txt';
const outputFile = 'output.srt';

const speed = 38 / 7;  // 38文字で7秒
const startTime = { hours: 0, minutes: 4, seconds: 9, milliseconds: 10 };

function timeToString(time: { hours: number, minutes: number, seconds: number, milliseconds: number }) {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(Math.floor(time.seconds)).padStart(2, '0')},${String(Math.floor(time.milliseconds / 10)).padStart(2, '0')}`;
}

function addTime(startTime: { hours: number, minutes: number, seconds: number, milliseconds: number }, secondsToAdd: number) {
    let totalSeconds = startTime.seconds + Math.floor(secondsToAdd);
    let totalMilliseconds = startTime.milliseconds + (secondsToAdd % 1) * 1000;
    if (totalMilliseconds >= 1000) {
        totalSeconds += Math.floor(totalMilliseconds / 1000);
        totalMilliseconds %= 1000;
    }
    let totalMinutes = startTime.minutes + Math.floor(totalSeconds / 60);
    let totalHours = startTime.hours + Math.floor(totalMinutes / 60);

    return {
        hours: totalHours % 24,
        minutes: totalMinutes % 60,
        seconds: totalSeconds % 60,
        milliseconds: totalMilliseconds
    };
}

let content = fs.readFileSync(inputFile, 'utf-8');
let lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('-'));

let currentNumber = 1;
let currentStartTime = startTime;
let outputContent = '';

for (const line of lines) {
    let duration = line.length / speed;
    let endTime = addTime(currentStartTime, duration);

    outputContent += `${currentNumber}\n`;
    outputContent += `${timeToString(currentStartTime)} --> ${timeToString(endTime)}\n`;
    outputContent += line + '\n\n';

    currentStartTime = endTime;
    currentNumber++;
}

fs.writeFileSync(outputFile, outputContent);
console.log(`SRT file generated at ${outputFile}`);
