import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/circles-no-3.ogg";
import midi from "../audio/circles-no-3.mid";

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

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[5].notes; // Synth 1
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

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }

            for (let i = 0; i < p.grid.length; i++) {
                const cell = p.grid[i],
                    { x, y, width, height } = cell;
                    p.stroke(0);
                    p.noFill();
                    p.rect(x, y, width, height);
            }
        }

        p.beginX = 0;
        p.beginY = 0;
        p.endX = 0;
        p.endY = 0;

        p.executeCueSet1 = (note) => {
            const cell = p.random(p.grid);
            console.log(cell);
            if(p.beginX === 0 && p.beginY === 0){
                p.beginX = cell.x; 
                p.beginY = cell.y; 
                p.fill(p.random(255), p.random(255), p.random(255));
                p.ellipse(p.beginX, p.beginY, p.height/ 32, p.height/ 32);
            }
            else {
                p.endX = cell.x; 
                p.endY = cell.y; 
                const distX = p.endX - p.beginX, // X-axis distance to move
                    distY = p.endY - p.beginY; // Y-axis distance to move
                let x = 0.0, // Current x-coordinate
                    y = 0.0; // Current y-coordinate
                p.fill(p.random(255), p.random(255), p.random(255));
                p.noStroke();
                for (let i = 0; i < 1.0; i=i+0.001) {
                    x = p.beginX + i * distX;
                    y = p.beginY +p. pow(i, 4) * distY;
                    p.ellipse(x, y, p.height/ 32, p.height/ 32);
                }
                p.beginX = p.endX; 
                p.beginY = p.endY; 
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
