var userBaseAttack = 25;
var onStage = false;
var isGameOver = false;
var gameSpeed = 2;
var shakeTime = 1500;
var shakeTimeout;

var user = {
    name: "",
    healthID: "#userHealth",
    divID: "#userPokemon",
    health: 100,
    damage: userBaseAttack,
}

var enemy = {
    name: "",
    healthID: "#enemyHealth",
    divID: "#enemyPokemon",
    health: 100,
    damage: 0,
    damageMax: 15,
    damageMin: 10
}

var enemiesLeft = 4;
var localPokedex = [];

//MUSIC & SOUNDS
var mainTheme = new Audio('./assets/sounds/opening.mp3');
var battleTheme = new Audio('./assets/sounds/battle.mp3');
var victoryTheme = new Audio('./assets/sounds/victory.mp3');
var defeatTheme = new Audio('./assets/sounds/defeat.mp3')
var clickSound = new Audio('./assets/sounds/click.mp3');
var faintSound = new Audio('./assets/sounds/faint.mp3');
var hitSound = new Audio('./assets/sounds/hit.mp3');
var lowHealthSound = new Audio('./assets/sounds/lowHealth.mp3');
var levelUpSound = new Audio('./assets/sounds/levelUp.mp3');

function playLoop(sound) {
    // LOWER VOLUME FOR BACKGROUND MUSIC
    if (sound === lowHealthSound) {
        sound.volume = 0.05;
    } else {
        sound.volume = 0.01;
    }
    sound.loop = true;
    sound.play();
    console.log(sound);
}

function pause(sound) {
    sound.loop = false;
    sound.pause();
}

function startGame() {
    // PAUSE THEME MUSIC AND PLAY BATTLE THEME
    pause(mainTheme);
    playLoop(battleTheme);

    //SHRINK LOGO
    $("#gameLogo").animate({
        width: "25%"
    });

    //HIDE GAME MENU
    $("#gameMenu").css("display", "none");

    // SHOW GAME DISPLAY
    $("#gameView").css("display", "block");

    // PREVENT OVERFLOW OF GAME DISPLAY
    $("#gameDisplay").css("height", "auto");

    // APPEND CHOSEN POKEMON PICTURE AND NAME
    presentPokemon(true, user.name);
    updateMessage("You have chosen " + bold(user.name) + "!\xa0\xa0Please select a contestant to battle.")

    // LOAD ENEMIES ONTO DOM
    loadPokemonAtId("enemiesDisplay", 'enemy');
    //RESET GLOBAL VARIABLES

}

// UPDATE GAME MESSAGE
function updateMessage(msg) {
    $("#gameMessage").empty();
    $("#gameMessage").append($("<p>").html(msg));
}

// ADD TO GAME MESSAGE
function addMessage(msg) {
    $("#gameMessage").append($("<p>").html(msg));
}

// RETURN THE HTML TO BOLD A GIVEN MESSAGE
function bold(msg) {
    return "<strong>" + msg + "</strong>"
}

// SHAKES DIV FOR A SPECIFIED NUMBER OF TIME
function shake(divID) {
    clearTimeout(shakeTimeout);
    $(divID).addClass('shake shake-constant');
    shakeTimeout = setTimeout(function () {
        $(divID).removeClass('shake shake-constant');
    }, shakeTime);
}

// LOADS FOUR POKEMON AT GIVEN LOCATION (ID)
function loadPokemonAtId(id, type) {
    for (var i = 0; i < 4; i++) {
        var randomID = Math.floor(Math.random() * localPokedex.length);
        var pokemonName = localPokedex[randomID];
        var pokemonSrc = getPokemonImage(pokemonName, true);
        var pokemonElement = $('<a title="' + pokemonName + '"><img class="col-xs-3" src="' + pokemonSrc + '" alt="' + pokemonName + '"></a>');

        if (type === "enemy") {
            var randomDamage = Math.ceil(Math.random() * enemy.damageMax + enemy.damageMin);
            pokemonElement.addClass("enemy");
            pokemonElement.data("dmg", randomDamage);
            pokemonElement.attr("href", '#/');
            pokemonElement.attr("title", pokemonName + " (Damage: " + randomDamage + ")");
        }

        $('#' + id).append(pokemonElement);
    }

}

// Retrieves pokemon images from https://pokemondb.net/
function getPokemonImage(pokemonName, isFront) {
    if (isFront) {
        return "https://img.pokemondb.net/sprites/black-white/normal/" +
            pokemonName.toLowerCase() + ".png";
    }

    return "https://img.pokemondb.net/sprites/black-white/back-normal/" +
        pokemonName.toLowerCase() + ".png";

}

// Determines if the entered pokemon exists
// ACCOUNT FOR POKEMON NAMES THAT HAVE TWO CAPITAL LETTERS (and Farfetch'd)
function isPokemon(pokemonName) {
    var formatName = pokemonName.toLowerCase();
    // Capitalize first letter of input
    formatName = formatName.charAt(0).toUpperCase() + formatName.slice(1);

    if (localPokedex.indexOf(formatName) === -1) {
        $('#selectorMessage').text("Please choose a valid Pokemon (up to Generation IV)!");
        return false;
    }

    user.name = formatName;
    return true;
}

// PUTS GIVEN POKEMON ON STAGE
function presentPokemon(isUser, pokemonName) {
    var pokemonElement;
    if (isUser) {
        pokemonElement = $("<img id='userPokemon' class='justify-content-center w3-animate-opacity'>");
        $('#battleArena').append(pokemonElement.attr("src", getPokemonImage(pokemonName, false)));
        $('#userName').text(pokemonName);
    } else {
        pokemonElement = $("<img id='enemyPokemon' class='justify-content-center w3-animate-opacity'>");
        $('#battleArena').append(pokemonElement.attr("src", getPokemonImage(pokemonName, true)));
        $('#enemyName').text(pokemonName);

    }
}

function enemyTurn() {
    setTimeout(function () {
        if (enemy.health > 0) {
            var attackMessage = bold(enemy.name) + " dealt " + enemy.damage + " damage!";
            updateMessage(attackMessage);
            hitSound.play();
            updateHealth(user, enemy.damage);

            if (!isGameOver) {
                setTimeout(function () {
                    updateMessage("Choose your next move!");
                    // $("#attackButton").removeClass("disabled");
                    $("#attackButton").attr("disabled", false);


                }, 2500 / gameSpeed);
            }
        }
    }, 2500 / gameSpeed)

}

// UPDATES HEALTH BAR VISUALS AND CHECKS USER/ENEMY FAINT STATUS
function updateHealth(pokemon, damageDealt) {
    // Determines whether or not a new Pokemon needs to be shown on stage
    var showNewPokemon = false;

    // SHAKE CURRENT POKEMON
    // shake(pokemon.divID);

    pokemon.health = pokemon.health - damageDealt;
    if (pokemon.health < 0) {
        pokemon.health = 0;
    }

    if (pokemon.health > 0) {
        var isUser = false;
        (pokemon === user) ? isUser = true: '';
        // if (!isUser || (isUser && enemy.health !== 0)) {
        $(pokemon.healthID).attr("aria-valuenow", pokemon.health);
        $(pokemon.healthID).css("width", pokemon.health + "%");
        updateColor(pokemon.health);
        // }
    } else {
        faint(pokemon);
    }

    function updateColor() {
        if (pokemon.health <= 50 && pokemon.health > 20) {
            $(pokemon.healthID).removeClass("bg-success");
            $(pokemon.healthID).addClass("bg-warning");

        } else if (pokemon.health <= 20 && pokemon.health > 0) {
            $(pokemon.healthID).removeClass("bg-warning");
            $(pokemon.healthID).addClass("bg-danger");
            playLoop(lowHealthSound);
        }

    }

    function faint(pokemon) {
        // PAUSE ALL PLAYING MUSIC
        pause(lowHealthSound);
        // UPDATE HEALTH BAR AND PLAY SOUND
        $(pokemon.healthID).attr("aria-valuenow", pokemon.health);
        $(pokemon.healthID).css("width", pokemon.health + "%");
        updateColor();
        faintSound.play();
        // FADE POKEMON OUT
        if (pokemon === enemy) {
            enemiesLeft--;
            onStage = false;
        }

        $(pokemon.divID).fadeOut();
        $(pokemon.divID).remove();

        // UPDATE MESSAGE
        updateMessage(pokemon.name + " has fainted!");
        // OPTION TO START NEW GAME IF USER FAINTED; 
        // PROMPT NEXT ENEMY IF ENEMY FAINTED
        (pokemon === user) ? promptLoss(): promptWin();
        showNewPokemon = true;

    }

    return showNewPokemon;

}

// PROMPTS RESTART OF GAME
function promptRestart() {
    $("#attackButton").attr("disabled", false);
    addMessage("\xa0\xa0Would you like to play again?");
    $("#attackButton").text("Play Again!");
    $("#attackButton").removeClass("btn-danger");
    $("#attackButton").addClass("btn-info");
    $("#attackButton").addClass('restartButton');

}

// DISPLAYS VICTORY MESSAGE IF ALL ENEMIES DEFEATED, OTHERWISE PROMPTS NEXT 
function promptWin() {
    if (enemiesLeft === 0) {
        pause(battleTheme);
        playLoop(victoryTheme);
        updateMessage("You have won!");
        promptRestart();
        isGameOver = true;
    } else {
        updateMessage(`${bold(enemy.name)} has been defeated! Choose your next opponent.`);
        user.damage = user.damage * 1.5;
    }
}

// DISPLAYS LOSS MESSAGE AND PROMPT RESTART OF GAME
function promptLoss() {
    isGameOver = true;
    updateMessage("You have been defeated!");
    defeatTheme.play();
    promptRestart();

}

function resetData(pokemon) {
    pokemon.name = "";
    pokemon.health = 100;
    $(pokemon.healthID).attr("aria-valuenow", pokemon.health);
    $(pokemon.healthID).css("width", pokemon.health + "%");
    $(pokemon.healthID).removeClass("bg-danger");
    $(pokemon.healthID).removeClass("bg-warning");
    $(pokemon.healthID).addClass("bg-success");

    if (pokemon === user) {
        pokemon.damage = userBaseAttack;
    }

}

// PLAY OPENING MUSIC
playLoop(mainTheme);

$(document).ready(function () {
    // DISABLE ATTACK BUTTON
    $("#attackButton").attr("disabled", true);
    // STARTS GAME ON CLICK
    $("#startButton").on("click", function () {
        // VALIDATE USER CHOSEN POKEMON
        isPokemon($('#heroSelector').val()) ? startGame() : '';

    });

    // FUNCTION TO AUTOCOMPLETE POKEMON CHOOSER
    $(function () {
        //RETRIEVE JSON DATA FROM API
        $.getJSON("https://api.myjson.com/bins/kbveh",
            function (pokedexData) {
                // FOR EACH POKEMON IN DATA, PUSH TO LOCAL POKEDEX
                $.each(pokedexData, function (id, pokemon) {
                    localPokedex.push(pokemon);
                })
            })
        // USE JQUERY UI TO AUTOCOMPLETE FORM 
        $("#heroSelector").autocomplete({
            source: localPokedex
        });

    });


    // GENERATE FOUR NEW FOOTER POKEMON
    setTimeout(function () {
        loadPokemonAtId("greeterPokemon", '');
    }, 1000);

    // ADDS ENEMY TO CORRECT POSITION IN BATTLE ARENA
    $(document).on('click', '.enemy', function () {
        if (!onStage) {
            resetData(enemy);
            // SHOW POKEMON ON STAGE
            enemy.name = $(this).find("img").attr("alt")
            presentPokemon(false, enemy.name);
            // GET ENEMY POKEMON ATTACK POWER
            enemy.damage = $(this).data("dmg");
            // HIDE POKEMON FROM BENCH
            $(this).css("display", "none");
            onStage = true;
            updateMessage("Your opponent is " + bold(enemy.name) + "!");
            // ENABLE ATTACK BUTTON
            $("#attackButton").attr("disabled", false);

        }

    })

    // ATTACKS ENEMY IF ON STAGE
    $(document).on('click', '#attackButton', function () {
        if (onStage && !isGameOver) {
            // PLAY ATTACK SOUND AND SHOW MESSAGE
            var attackMessage = `${bold(user.name)} dealt ${user.damage} damage!`;
            updateMessage(attackMessage);
            hitSound.play();
            // UPDATE ENEMY HEALTH BAR (AND DETERMINE WHETHER 
            // OR NOT A NEW POKEMON IS NOW ON THE STAGE)
            var isNewPokemon = updateHealth(enemy, user.damage);
            // DISABLE ATTACK BUTTON
            // $("#attackButton").addClass("disabled");
            (!isGameOver) ? $("#attackButton").attr("disabled", true): '';
            // COMMENCE ENEMY TURN
            (!isNewPokemon) ? enemyTurn(): '';
        }

    })

    // RESTARTS GAME (RELOADS PAGE)
    $(document).on('click', '.restartButton', function () {
        document.location.reload()
    })
})