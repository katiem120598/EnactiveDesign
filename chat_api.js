let osc; // Single oscillator

function initOscillator() {
    if (!osc) {
        osc = new p5.Oscillator();
        osc.setType('sine'); // Set the waveform type (sine, square, triangle, etc.)
        osc.start(); // Start the oscillator
        osc.amp(0); // Set initial amplitude to 0 (silent)
        console.log('Oscillator initialized');
    }
}

const reqbut = document.getElementById('button-request');
const chatGptEndpoint = 'https://api.openai.com/v1/chat/completions';
const reqStatus = document.getElementById('request-status');

reqbut.onclick = function () {
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

    // Initialize oscillator before making the API request
    initOscillator();

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
                playMidiNotes(originalNotes.concat(returnedNotes)); // Play all 10 notes
                reqStatus.innerHTML = `Playing original notes: ${originalNotes.join(', ')} and returned notes: ${returnedNotes.join(', ')}`;
            } else {
                reqStatus.innerHTML = "Invalid MIDI notes returned.";
            }
        })
        .catch(error => {
            reqStatus.innerHTML = `Error: ${error}`;
        });
};

// Function to play 10 notes in sequence using one oscillator
// Function to play 10 notes in sequence using one oscillator
function playMidiNotes(allNotes) {
    let i = 0;

    function playNext() {
        if (i < allNotes.length) {
            const freq = midiToFreq(allNotes[i]);

            // Set oscillator frequency to the current note
            osc.freq(freq); 
            
            // Fade in over 0.5 seconds to amplitude 0.5
            osc.amp(0.5, .9); 

            // Play note for 1.5 seconds (including fade out)
                // After 1 second, start the fade-out
                osc.amp(0, 1.1); // Fade out over 0.5 seconds

                // After fade-out completes, move to the next note
                setTimeout(() => {
                    i++;
                    playNext(); // Proceed to the next note
                }, 1000); // Ensure this delay matches the fade-out duration
        }
    }

    playNext();
}


function midiToFreq(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12); // Convert MIDI note to frequency
}
