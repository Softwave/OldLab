/* AudioClass 
 * Based on code from Patrick Heng
 * http://codepen.io/pat_hg/
 *
 * Copyright (c) 2016 by Patrick Heng (http://codepen.io/pat_hg/pen/zGgvMN)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var audioElement;
var audioPlayer;

audioElement = new Audio();
audioElement.crossOrigin = "anonymous";
audioElement.src = 'assets/Hyperion.mp3';
document.getElementById('music').appendChild(audioElement);

AudioClass = (function() {
    function AudioClass() {
        var self = this;

        this.ctx = new AudioContext();
        this.audio = audioElement;
        this.audioSrc = this.ctx.createMediaElementSource(this.audio);
        this.analyser = this.ctx.createAnalyser();
        this.audioData = [];

        this.audioSrc.connect(this.analyser);
        this.audioSrc.connect(this.ctx.destination);

        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.audio.play();
    };


    AudioClass.prototype.getFrequencyData = function() {
        this.analyser.getByteFrequencyData(this.frequencyData);
        return this.frequencyData;
    };

    AudioClass.prototype.getAudioData = function() {
        this.analyser.getByteFrequencyData(this.frequencyData);

        var frequencyArray = this.splitFrenquencyArray(this.frequencyData, 1);

        for (var i = 0; i < frequencyArray.length; i++) {
            var average = 0;

            for (var j = 0; j < frequencyArray[i].length; j++) {
                average += frequencyArray[i][j];
            }
            this.audioData[i] = average / frequencyArray[i].length;
        }
        return this.audioData;
    }

    AudioClass.prototype.splitFrenquencyArray = function(arr, n) {
        var tab = Object.keys(arr).map(function(key) {
            return arr[key]
        });
        var len = tab.length,
            result = [],
            i = 0;

        while (i < len) {
            var size = Math.ceil((len - i) / n--);
            result.push(tab.slice(i, i + size));
            i += size;
        }

        return result;
    }

    return AudioClass;
})();

