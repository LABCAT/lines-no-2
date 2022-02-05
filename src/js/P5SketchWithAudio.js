import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import AnimatedLine from './classes/AnimatedLine.js';

import audio from "../audio/lines-no-2.ogg";
import midi from "../audio/lines-no-2.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.grid = [];

        p.randomColours = [];

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[3].notes; // Synth 1 - Harponic
                    const noteSet2 = result.tracks[4].notes; // Sampler 1 Copy - Organ B3FilWhMod
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.backgroundColour = 255;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0);
            p.rectMode(p.CENTER);
            const randomColor = require('randomcolor');
            p.randomColours = randomColor({
                luminosity: 'bright',
                format: 'rgb',
                count: 15
            });

            const gridWidthHeight = 8;
            for (let i = 0; i < gridWidthHeight; i++) {
                for (let j = 0; j < gridWidthHeight; j++) {
                    p.grid.push(
                        {
                            x: p.width/ gridWidthHeight * j + p.width/ gridWidthHeight / 2, 
                            y: p.height/ gridWidthHeight * i + p.height / gridWidthHeight / 2, 
                            width: p.width/ gridWidthHeight, 
                            height: p.height/ gridWidthHeight
                        }
                    );
                }   
            }
        }

        p.animatedLinesDrawings1 = [];

        p.draw = () => {
            let cellCount = 0;
            for (let i = 0; i < p.grid.length; i++) {
                const cell = p.grid[i],
                    { x, y, width, height } = cell,
                    colour = cellCount % 2 === 1 ? 0 : 255;
                // p.noStroke();
                // p.fill(colour);
                // p.rect(x, y, width, height);
                cellCount++
            }
            if(p.audioLoaded && p.song.isPlaying()){
                
                for (let i = 0; i < p.animatedLinesDrawings1.length; i++) {
                    const lineSet = p.animatedLinesDrawings1[i],
                        { scale, translateX, translateY, lines } = lineSet;
                    p.push();
                    p.translate(translateX, translateY);
                    p.scale(scale);
                    for (let j = 0; j < lines.length; j++) {
                        const line = lines[j];
                        line.draw();
                    }
                    p.translate(-translateX, -translateY);
                    p.pop();
                }

                for (let i = 0; i < p.animatedLinesDrawings2.length; i++) {
                    const line = p.animatedLinesDrawings2[i];
                    line.draw();
                }
            }
            
        }

        p.beginX = 0;
        p.beginY = 0;
        p.endX = 0;
        p.endY = 0;
        p.currentIndex = 0;        

        p.executeCueSet1 = (note) => {
            const { currentCue } = note;
            if(currentCue % 15 === 1){
                const randomColor = require('randomcolor');
                p.randomColours = randomColor({
                    luminosity: 'bright',
                    format: 'rgb',
                    count: 15
                });
                
                if(currentCue > 1){
                    p.currentIndex++;
                }
                p.currentCell = p.grid[p.currentIndex % 4];
                p.beginX = p.random(0, p.width); 
                p.beginY = p.random(0, p.height); 
            }
            if(typeof p.animatedLinesDrawings1[p.currentIndex] === 'undefined'){
                p.animatedLinesDrawings1[p.currentIndex] = {
                    scale: p.random(0.05, 0.2),
                    translateX: p.random(0, p.width - p.width / 4),
                    translateY: p.random(0, p.height - p.height / 4),
                    lines: []
                };
            }
            p.endX = p.random(0, p.width); 
            p.endY = p.random(0, p.height); 
            p.animatedLinesDrawings1[p.currentIndex].lines.push(
                new AnimatedLine(
                    p,
                    p.beginX,
                    p.beginY,
                    p.endX,
                    p.endY,
                    note.duration,
                    p.randomColours[note.currentCue % 15],
                    p.randomColours[note.currentCue % 15 === 14 ? 0 : (note.currentCue % 15 + 1)],
                )
            );
            p.beginX = p.endX; 
            p.beginY = p.endY; 
        }

        p.animatedLinesDrawings2 = [];

        p.executeCueSet2 = (note) => {
            const pattern = [...p.animatedLinesDrawings1[0]],
                index = note.currentCue % 15; 
                console.log(index);
                console.log(pattern.lines);
                console.log(pattern.lines[index]);
            if(typeof p.animatedLinesDrawings2[index] === 'undefined'){    
                pattern.lines[index].pointIndex = 0;
                p.animatedLinesDrawings2[index] = pattern.lines[index];
            }
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
