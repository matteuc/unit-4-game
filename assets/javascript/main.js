var user = {
    name: "",
    health: 100,
    damage: 10,
}

var enemy = {
    name: "",
    health: 100,
    damage: 10,
    damageMax: 15,
    damageMin: 10
}

var localPokedex = [];

//MUSIC & SOUNDS
var mainTheme = new Audio('./assets/sounds/opening.mp3');
var battleTheme = new Audio('./assets/sounds/battle.mp3');
var victoryTheme = new Audio('./assets/sounds/victory.mp3');
var clickSound = new Audio('./assets/sounds/click.mp3');
var faintSound = new Audio('./assets/sounds/faint.mp3');
var hitSound = new Audio('./assets/sounds/hit.mp3');
var lowHeathSound = new Audio('./assets/sounds/lowHealth.mp3');
var levelUpSound = new Audio('./assets/sounds/levelUp.mp3');

function playLoop(sound) {
    // LOWER VOLUME FOR BACKGROUND MUSIC
    sound.volume = 0.01;
    sound.loop = true;
    sound.play();
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

// RETURN THE HTML TO BOLD A GIVEN MESSAGE
function bold(msg) {
    return "<strong>" + msg + "</strong>"
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
            pokemonElement.attr("href", '#');
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
        var attackMessage = bold(enemy.name) + " dealt " + enemy.damage + " damage!";
        updateMessage(attackMessage);
        hitSound.play();
        updateHealth(true, enemy.damage);

        setTimeout(function () {
            updateMessage("Choose your next move!");
            $("#attackButton").removeClass("disabled");

        }, 2500);
    }, 2500)



}

// UPDATES HEALTH BAR VISUALS AND CHECKS USER/ENEMY FAINT STATUS
function updateHealth(isUser, damageDealt) {
    var healthID;
    var healthVal;

    if (isUser) {
        healthID = "#userHealth";
        user.health = user.health - damageDealt;
        healthVal = user.health;
    } else {
        healthID = "#enemyHealth";
        enemy.health = enemy.health - damageDealt;
        healthVal = user.health;
    }

    if (healthVal > 0) {
        $(healthID).attr("aria-valuenow", healthVal);
        $(healthID).css("width", healthVal + "%");
        updateColor(healthVal);
    } else {
        faint(isUser);
    }

    function updateColor(health) {
        if (health <= 50) {
            $(healthID).removeClass("bg-success");
            $(healthID).addClass("bg-warning");


        } else if (health <= 20) {
            $(healthID).removeClass("bg-warning");
            $(healthID).addClass("bg-danger");
        }

    }




}

function faint() {}

$(document).ready(function () {
    var onStage = false;
    // PLAY OPENING MUSIC
    playLoop(mainTheme);
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
            $("#attackButton").removeClass("disabled");
        }

    })

    // ATTACKS ENEMY IF ON STAGE
    $(document).on('click', '#attackButton', function () {
        if (onStage) {
            // PLAY ATTACK SOUND AND SHOW MESSAGE
            var attackMessage = bold(user.name) + " dealt " + user.damage + " damage!";
            updateMessage(attackMessage);
            hitSound.play();
            // UPDATE ENEMY HEALTH BAR
            updateHealth(false, user.damage);
            // DISABLE ATTACK BUTTON
            $("#attackButton").addClass("disabled");
            // COMMENCE ENEMY TURN
            enemyTurn();
        }

    })
})