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
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
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

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(255);
            p.rectMode(p.CENTER);
            const randomColor = require('randomcolor');
            p.randomColours = randomColor({
                luminosity: 'bright',
                format: 'rgb',
                count: 16
            });
            console.log(p.randomColours);

            for (let i = 0; i < 16; i++) {
                for (let j = 0; j < 16; j++) {
                    p.grid.push(
                        {
                            x: p.width/ 16 * i + p.width/ 32, 
                            y: p.height/ 16 * j + p.height / 32, 
                            width: p.width/ 16, 
                            height: p.height/ 16
                        }
                    );
                }   
            }
        }

        p.animatedLines1 = [];

        p.draw = () => {
            // for (let i = 0; i < p.grid.length; i++) {
            //     const cell = p.grid[i],
            //         { x, y, width, height } = cell;
            //         p.stroke(0);
            //         p.noFill();
            //         p.rect(x, y, width, height);
            // }
            if(p.audioLoaded && p.song.isPlaying()){
                // p.translate(p.width /2, p.height /2);
                // p.scale(0.2);
                for (let i = 0; i < p.animatedLines1.length; i++) {
                    const line = p.animatedLines1[i];
                    line.draw();
                }
            }

            
        }

        p.beginX = 0;
        p.beginY = 0;
        p.endX = 0;
        p.endY = 0;
        

        p.executeCueSet1 = (note) => {
            const cell = p.random(p.grid),
                nextCell  = p.random(p.grid);
            if(!p.randomColour) {
                p.randomColour = p.color(p.random(255), p.random(255), p.random(255));
            }
            if(p.beginX === 0 && p.beginY === 0){
                p.beginX = cell.x; 
                p.beginY = cell.y; 
            }
            p.endX = nextCell.x; 
            p.endY = nextCell.y; 
            p.animatedLines1.push(
                new AnimatedLine(
                    p,
                    p.beginX,
                    p.beginY,
                    p.endX,
                    p.endY,
                    note.duration,
                    p.randomColours[note.currentCue % 16],
                    p.randomColours[note.currentCue % 16 === 15 ? 0 : (note.currentCue % 16 + 1)],
                )
            );
            p.beginX = p.endX; 
            p.beginY = p.endY; 
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
