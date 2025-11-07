// About imports and exports in JavaScript modules
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export

// "named" imports from utils.js and soundutils.js
import { loadAndDecodeSound, playSound } from './soundutils.js';

// The AudioContext object is the main "entry point" into the Web Audio API
let ctx;

// A tiny domain model describing our drum kit. Keeping metadata close to the
// URL will simplify later refactors (e.g., mapping to pads, categories...).
const soundCatalog = [
    {
        id: 'hardstyle-kick',
        label: 'Hardstyle Kick',
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav'
    },
    {
        id: 'march-snare',
        label: 'Marching Snare',
        url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3'
    },
    {
        id: 'hihat-closed',
        label: 'Closed Hi-Hat',
        url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3'
    },
    {
        id: 'hihat-open',
        label: 'Open Hi-Hat',
        url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3'
    },
    {
        id: 'tom-high',
        label: 'High Tom',
        url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3'
    },
    {
        id: 'tom-mid',
        label: 'Mid Tom',
        url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3'
    },
    {
        id: 'tom-low',
        label: 'Low Tom',
        url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3'
    },
    {
        id: 'crash',
        label: 'Crash Cymbal',
        url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3'
    },
    {
        id: 'ride',
        label: 'Ride Cymbal',
        url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3'
    }
];

// Map sound ids to decoded buffers – this is our in-memory cache.
const decodedBuffers = new Map();

window.onload = async function init() {
    ctx = new AudioContext();

    const buttonsContainer = document.querySelector('#buttonsContainer');
    const loadingStatus = document.querySelector('#loadingStatus');

    try {
        // Promise.all lets us request and decode every sound in parallel.
        const decodedEntries = await Promise.all(
            soundCatalog.map(async (sound) => {
                const buffer = await loadAndDecodeSound(sound.url, ctx);
                return { ...sound, buffer };
            })
        );

        loadingStatus.textContent = 'Samples ready – pick one:';

        decodedEntries.forEach((entry) => {
            decodedBuffers.set(entry.id, entry.buffer);
            buttonsContainer.appendChild(createPlayButton(entry));
        });
    } catch (error) {
        console.error('Failed to load at least one sample', error);
        loadingStatus.textContent = '⚠️ Could not load the drum kit.';

        const errorDetails = document.createElement('pre');
        errorDetails.textContent = error.message;
        buttonsContainer.appendChild(errorDetails);
    }
};

function createPlayButton({ id, label, buffer }) {
    const button = document.createElement('button');
    button.className = 'play-button';
    button.dataset.soundId = id;
    button.textContent = label;

    button.addEventListener('click', () => {
        // We request a fresh buffer source every time – that is the idiomatic Web Audio pattern.
        playSound(ctx, buffer, 0, buffer.duration);
    });

    return button;
}
