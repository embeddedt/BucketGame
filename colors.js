/*
 * Game description file.
 *
 * Don't use syntax or functions newer than ES5 in this file
 * if you need to support Internet Explorer.
 */





/* Colors must start with a pound sign otherwise they will not be treated as colors, but just as different types.
 *
 * An example of this behavior can be seen with NOUN and NOT_NOUN, where the words won't actually change color
 * but the game still considers NOT_NOUNS as illegal to place in the bucket.
 */


/* Define the item types. These variables are used to avoid repeating CSS color strings all over the place. */
var RED = '#ff0000';
var YELLOW = '#ffff00';
var BLUE = '#0000ff';
var GREEN = '#00ff00';

var NOUN = 'noun';
var NOT_NOUN = 'notnoun';

var dinosaur = 'toy.png';

/**
 * Create an image item by taking a grayscale image and recoloring it to the
 * given color.
 * 
 * SVGs don't work properly. It's best to avoid those.
 * 
 * @param {string} img - URL of image (use relative path, e.g. toy.png).
 * @param {string} color - type/CSS color string
 */
function makeRecoloredImage(img, color) {
    return { type: 'image', value: {
        image: img,
        color: color
    }};
}

/**
 * Create an image item of the given logical color **without** recoloring
 * it. The image will still be considered as being whatever color/type you
 * pass. This is useful in cases where recoloring doesn't work the way you'd
 * expect (i.e. too dark/light image).
 * 
 * SVGs don't work properly. It's best to avoid those.
 * 
 * @param {string} img - URL of image (use relative path, e.g. toy.png).
 * @param {string} color - type/CSS color string
 */
function makeNonRecoloredImage(img, logicalColor) {
    return { type: 'image', value: {
        image: img,
        color: logicalColor,
        noRecolor: true
    }};
}

/**
 * Create a text-based item. It will be recolored if `color` is an actual CSS
 * color string (beginning with #) otherwise it will not be recolored.
 * @param {*} word - text
 * @param {*} color - type/CSS color string
 */
function makeWord(word, color) {
    return { type: 'text', value: {
        string: word,
        color: color
    }};
}


window.globalGameInformation = {
    /* Self-explanatory */
    title: "Colors Game",
    directions: "The floor's a mess! Can you put the toys away in the right buckets? Click on a toy to put it away!",
    background: 'bkgd.svg',
    /* Specifies the bucket image */
    bucketImg: objectify(
        [ RED, 'red_bucket.svg' ],
        [ GREEN, 'green_bucket.svg' ],
        [ BLUE, 'blue_bucket.svg' ],
        [ YELLOW, 'yellow_bucket.svg' ]
    ),
    
    // BEGIN COLOR GAME EXAMPLE
    // Specifies the available color choices (and their human names).
    colorChoices: objectify(
        [ RED, 'red' ],
        [ YELLOW, 'yellow' ],
        [ BLUE, 'blue' ]
    ),
    /* The string to append after 'Click on the {color name here}'. Note the leading space in this example. */
    itemsPlural: ' toys',
    /*
     * The items to appear at the bottom of the screen.
     *
     * Use one of the three makeXXX functions to create an item. a 
     */
    items: [
        makeRecoloredImage(dinosaur, BLUE),
        makeRecoloredImage(dinosaur, BLUE),
        makeRecoloredImage(dinosaur, BLUE),
        makeRecoloredImage(dinosaur, BLUE),
        makeRecoloredImage(dinosaur, RED),
        makeRecoloredImage(dinosaur, RED),
        makeRecoloredImage(dinosaur, RED),
        makeRecoloredImage(dinosaur, RED),
        makeNonRecoloredImage('yellow_dinosaur.png', YELLOW),
        makeNonRecoloredImage('yellow_dinosaur.png', YELLOW),
        makeNonRecoloredImage('yellow_dinosaur.png', YELLOW),
        makeNonRecoloredImage('yellow_dinosaur.png', YELLOW)
    ]
    // END COLOR GAME EXAMPLE
    // BEGIN NOUN/NOTNOUN GAME EXAMPLE
    /*
    colorChoices: objectify(
        [ NOUN, 'noun' ]
    ),
    itemsPlural: 's',
    items: [
        makeWord('thing', NOUN),
        makeWord('run', NOT_NOUN)
    ]
    */
   // END NOUN/NOTNOUN GAME EXAMPLE
}