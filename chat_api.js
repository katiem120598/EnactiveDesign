let osc1, osc2, osc3, osc4, osc5, osc6, osc7, osc8, osc9, osc10; // Oscillators for all 10 notes

function initOscillators() {
    if (!osc1) {
        osc1 = new p5.Oscillator();
        osc2 = new p5.Oscillator();
        osc3 = new p5.Oscillator();
        osc4 = new p5.Oscillator();
        osc5 = new p5.Oscillator();
        osc6 = new p5.Oscillator();
        osc7 = new p5.Oscillator();
        osc8 = new p5.Oscillator();
        osc9 = new p5.Oscillator();
        osc10 = new p5.Oscillator();

        osc1.setType('sine'); osc2.setType('sine'); osc3.setType('sine');
        osc4.setType('sine'); osc5.setType('sine'); osc6.setType('sine');
        osc7.setType('sine'); osc8.setType('sine'); osc9.setType('sine');
        osc10.setType('sine');

        osc1.start(); osc2.start(); osc3.start(); osc4.start(); osc5.start();
        osc6.start(); osc7.start(); osc8.start(); osc9.start(); osc10.start();

        osc1.amp(0); osc2.amp(0); osc3.amp(0); osc4.amp(0); osc5.amp(0);
        osc6.amp(0); osc7.amp(0); osc8.amp(0); osc9.amp(0); osc10.amp(0);

        console.log('Oscillators initialized');
    }
}

const reqbut = document.getElementById('button-request');
const chatGptEndpoint = 'https://api.openai.com/v1/chat/completions';
const reqStatus = document.getElementById('request-status');

reqbut.onclick = function() {
    reqStatus.innerHTML = "Performing request...";
    
    // Collect 5 user-entered notes
    const notes = [
        document.getElementById('midi-note1').value,
        document.getElementById('midi-note2').value,
        document.getElementById('midi-note3').value,
        document.getElementById('midi-note4').value,
        document.getElementById('midi-note5').value
    ];

    const apiKey = ""; // Use your actual API key here

    // Initialize oscillators before making the API request
    initOscillators();

    // Construct the request body
    const reqBody = {
        model: 'gpt-4',
        messages: [{
            role: 'user',
            content: `${notes.join(', ')} : given these midi notes, provide five midi notes that will sound good with the ones provided.`
        }],
        max_tokens: 100
    };

    // Set up the request parameters
    const reqParams = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(reqBody)
    };

    // Make the API request
    fetch(chatGptEndpoint, reqParams)
        .then(res => res.json())
        .then(data => {
            const returnedNotes = data.choices[0].message.content.split(',').map(Number);
            const originalNotes = notes.map(Number);

            if (returnedNotes.length === 5 && originalNotes.length === 5) {
                playMidiNotes(originalNotes.concat(returnedNotes));
                reqStatus.innerHTML = `Playing original notes: ${originalNotes.join(', ')} and returned notes: ${returnedNotes.join(', ')}`;
            } else {
                reqStatus.innerHTML = "Invalid MIDI notes returned.";
            }
        })
        .catch(error => {
            reqStatus.innerHTML = `Error: ${error}`;
        });
};

// Function to play 10 notes in sequence
// Function to play 10 notes in sequence
function playMidiNotes(allNotes) {
    const oscillators = [osc1, osc2, osc3, osc4, osc5, osc6, osc7, osc8, osc9, osc10];
    
    let i = 0;
    function playNext() {
        if (i < allNotes.length) {
            const freq = midiToFreq(allNotes[i]);
            const osc = oscillators[i];

            osc.freq(freq);
            osc.start(); // Start the oscillator fresh

            // Ensure starting amplitude is 0 before fading in
            osc.amp(0, 0);
            // Fade in over 0.5 seconds to 0.5 amplitude
            osc.amp(0.5, 0.5);

            setTimeout(() => {
                // Fade out over 0.5 seconds to 0 amplitude
                osc.amp(0, 0.5);

                // Delay the stop of the oscillator to ensure the fade-out completes
                setTimeout(() => {
                    osc.stop(); // Stop the oscillator after fading out
                    i++;
                    playNext(); // Play the next note
                }, 700); // Slightly longer than the fade-out duration to ensure smooth stop
            }, 1500); // Each note plays for 1.5 seconds (including fade in)
        }
    }
    
    playNext();
}


function midiToFreq(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}
