var userPokemon;
var localPokedex = [];


function startGame() {
    //SHRINK LOGO
    $("#gameLogo").animate({
        width: "30%"
    });

    //HIDE GAME MENU
    $("#gameMenu").css("display", "none");

    // SHOW GAME DISPLAY
    $("#gameView").css("display", "block");

    // PREVENT OVERFLOW OF GAME DISPLAY
    $("#gameDisplay").css("height", "auto");

    // LOCATE CHOSEN POKEMON INFORMATION
    $('#battleArena').append($("<img class='justify-content-center'>").attr("src", getPokemonImage(userPokemon, true)));

    //RESET GLOBAL VARIABLES




}



// Retrieves pokemon images from https://pokemondb.net/
function getPokemonImage(pokemonName, isFront) {
    if (isFront) {
        return "https://img.pokemondb.net/sprites/heartgold-soulsilver/normal/" +
            pokemonName.toLowerCase() + ".png";
    }

    return "https://img.pokemondb.net/sprites/heartgold-soulsilver/back-normal/" +
        pokemonName.toLowerCase() + ".png";

}

// Determines if the entered pokemon exists
function isPokemon(pokemonName) {
    var formatName = pokemonName.toLowerCase();
    // Capitalize first letter of input
    formatName = formatName.charAt(0).toUpperCase() + formatName.slice(1);

    if (localPokedex.indexOf(formatName) === -1) {
        $('#selectorMessage').text("Please choose a valid Pokemon (up to Generation IV)!");
        return false;
    }

    userPokemon = formatName;
    return true;
}


$(document).ready(function () {

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
        for (var i = 0; i < 4; i++) {
            var randomID = Math.floor(Math.random() * localPokedex.length);
            var pokemonSrc = getPokemonImage(localPokedex[randomID], true);
            $('#greeterPokemon').append($('<img class="col-xs-3" src="' + pokemonSrc + '">'))

        }
    }, 500);

})