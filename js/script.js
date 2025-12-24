let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;

}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`./${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let links = div.getElementsByTagName("a");
    songs = [];
    for (let link of links) {
        if (
            link.href.endsWith(".mp3") ||
            link.href.endsWith(".wav") ||
            link.href.endsWith(".ogg")
        ) {
            songs.push(link.href.split(`/${folder}/`)[1]);
        }
    }


    //Show all the songs in the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""; //Clear the existing songs
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><span class="material-symbols-outlined">
                                music_note </span>
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Koushik</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="./img/play.svg" alt="">
                            </div> </li>`;
    }

    //Attach an event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;

}

const playMusic = (track, pause = false) => {
    currentSong.src = `./${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "./img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
    let a = await fetch(`./songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];

            //Get the metadata of the folder
            let a = await fetch(`./songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="70" height="70" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="35" fill="#1fdf64" />
                                <polygon points="40,35 65,50 40,65" fill="black" />
                            </svg>
                        </div>
                        <img src="./songs/${folder}/cover.jpg" alt="">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]); //Play the first song by default
        });

    });

}

async function main() {

    //get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true); //Play the first song by default

    //display all the albums on the page
    displayAlbums();


    //Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "./img/pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "./img/play.svg";
        }

    });

    //Listen to the time update event of the audio element
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an event listener to the seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    //Add an event listener to the hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";

    });

    //Add an event listener to the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    //Add an event listener to the pervious button
    previous.addEventListener("click", () => {
        console.log("previous clicked");
        console.log(currentSong);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    //Add an event listener to the next button
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("next clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    //Add an event listener to the volume slider

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volime to", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    //Add an event listener to the mute button
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0; //Set the volume slider to 0
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10; //Set the volume slider to 10
        }
    });



}


main();