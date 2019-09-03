/* Settings */
NUM_TILES = 44;
PLAY_SOUNDS = 1;
REGEX_LETTER = /[^\W_]/;
SOUNDFX = ['wofbuzz', 'wofding', 'wofstart', 'wofend'];

soundManager.debugMode = false;
soundManager.url = '/wof/js/sm/swf/';
soundManager.flashVersion = 8;
soundManager.defaultOptions = {
    autoLoad: true,
    multiShot: true
};

$.Jookie.Initialise("WOF", 60*60*24*365);

WOF = {
    puzzles : $.Jookie.Get("WOF", "puzzles") || [ '             Hello,     World!' ],
    current_puzzle : 0,
    autohide : $.Jookie.Get("WOF", "autohide") || 0
};

$(document).ready(function(){
    // Init sounds
    if (PLAY_SOUNDS) {
        soundManager.onload = function(){
            // soundManager.createSound() etc. may now be called
            soundManager._writeDebug('soundManager.onload() - your code executes here');
            for (var i = 0; i < SOUNDFX.length; i++) {
                soundManager.createSound({
                    id: SOUNDFX[i],
                    url: 'audio/' + SOUNDFX[i] + '.mp3'
                });
            }
        };
        // Init sound effect links
        $('.sfx').click(function(){
            var sound = soundManager.getSoundById(this.id);
            sound.play();
            return false;
        });
    }
    
    // Init board
    var board = '';
    for (var i = 0; i < NUM_TILES; i++) {
        board += '<a href="javascript:void(0)" class="tile" id="tile_' + i + '"></a>';
    }
    $('#board').html(board);
    
    $(".tile.white.letter").live("click", function(){
        if ($(this).html() == '') {
            if (PLAY_SOUNDS) {
                var sound = soundManager.getSoundById('wofding');
                sound.play();
            }
            // Show letter
            $(this).html($(this).attr('rel'));
        }
        else {
            // Hide the letter
            $(this).html('');
        }
        return false;
    });
    
    // Setup controls
    $('#total_puzzles').html(WOF.puzzles.length);
    $('#next_puzzle, #next_puzzle_quietly').click(function(){
        if (WOF.current_puzzle < WOF.puzzles.length){
            WOF.current_puzzle++;
            set_puzzle(WOF.puzzles[WOF.current_puzzle-1]);
            $('#current_puzzle').html(WOF.current_puzzle);
            if (PLAY_SOUNDS && this.id == 'next_puzzle') {
                var sound = soundManager.getSoundById('wofstart');
                sound.play();
            }
        }
        return false;
    });
    $('#prev_puzzle').click(function(){
        if (WOF.current_puzzle > 1){
            WOF.current_puzzle--;
            set_puzzle(WOF.puzzles[WOF.current_puzzle-1]);
            $('#current_puzzle').html(WOF.current_puzzle);
        }
        return false;
    });
    $('#solve_puzzle').click(function(){
        $(".tile.white.letter").each(function(){
             $(this).html($(this).attr('rel'));
        });
        if (PLAY_SOUNDS) {
            var sound = soundManager.getSoundById('wofend');
            sound.play();
        }
        return false;
    });
    $('#reset_puzzle').click(function(){
        set_puzzle(WOF.puzzles[WOF.current_puzzle-1]);
        return false;
    });
    $('#clear_board').click(function(){
        set_puzzle('');
        return false;
    });
    $('#edit_puzzles').click(function(){
        show_editor();
        set_puzzle(WOF.puzzles[0], 1);
        return false;
    });
    $(".delete_puzzle").live("click", function(){
        var i = this.id.split('_')[1];
        WOF.puzzles.splice(i, 1);
        show_editor();
        return false;
    });
    $(".puzzle_editor").live("keyup", function(){
        var i = this.id.split('_')[1];
        WOF.puzzles[i] = $(this).val();
        set_puzzle(WOF.puzzles[i], 1);
        return false;
    });
    $(".puzzle_editor").live("click", function(){
        var i = this.id.split('_')[1];
        set_puzzle(WOF.puzzles[i], 1);
    });
    $('#done_editing').click(function(){
        $('#editor_wrapper').slideUp();
        // Delete blank ones
        for (var i = 0; i < WOF.puzzles.length; i++){
            if (WOF.puzzles[i] == ""){
                WOF.puzzles.splice(i--, 1);
            }
        }
        // Save puzzles
        $.Jookie.Set("WOF", "puzzles", WOF.puzzles);
        set_puzzle('');
        // Update totals
        $('#total_puzzles').html(WOF.puzzles.length);
        $('#current_puzzle').html(0);
        WOF.current_puzzle = 0;
        return false;
    });
    $('#add_puzzle').click(function(){
        add_puzzle_input();
        return false;
    });
    if ( WOF.autohide ) {
        $('#autohide').html('auto-hide: on');
    }
    $('#autohide').click(function(){
        if ( $(this).html().indexOf('on') > 0 ) {
            $(this).html('auto-hide: off');
            $.Jookie.Set("WOF", "autohide", 0);
            $('#controls_wrapper > div:hidden').show();
        }
        else {
            $(this).html('auto-hide: on');
            $.Jookie.Set("WOF", "autohide", 1);
        }
        return false;
    });
    $('#controls_wrapper').mouseenter(function(){
        $("#autohide:contains('auto-hide: on')")
        .parents('#controls_wrapper > div:hidden').fadeIn();
    });
    $('#controls_wrapper').mouseleave(function(){
        $("#autohide:contains('auto-hide: on')")
        .parents('#controls_wrapper > div:visible').fadeOut();
    });
});

function set_puzzle(tiles, dont_hide){
    for (var i = 0; i < NUM_TILES; i++) {
        var tile = i < tiles.length ? tiles.charAt(i) : ' ';
        tile = tile.replace(/\s/, " ");
        // A letter
        if (REGEX_LETTER.test(tile)) {
            tile = tile.toUpperCase();
            $('#tile_' + i).html(dont_hide ? tile : '').attr('rel', tile).addClass('white letter');
        }
        // Space
        else 
            if (tile == ' ') {
                $('#tile_' + i).html('').removeClass('white').removeClass('letter').attr('rel', '');
            }
            // Punctation
            else {
                tile = htmlEncode(tile);
                $('#tile_' + i).html(tile).removeClass('letter').addClass('white').attr('rel', '');
            }
    }
}

function show_editor() {
    $('#editor_wrapper').slideDown();
    var editors = '';
    for (var i = 0; i < WOF.puzzles.length; i++){
        editors += (i+1) + '. <input type="text" id="puzzle_'+i+'" class="puzzle_editor" value="' +  WOF.puzzles[i] + '" /> '+
            '<a href="javascript:void(0)" id="delete_'+i+'" class="delete_puzzle" title="Delete this puzzle">X</a><br/>';
    }
    $('#editors').html(editors);
}

function add_puzzle_input() {
    WOF.puzzles.push("");
    show_editor();
    $('#editor_wrapper').attr('scrollTop', $('#editor_wrapper').attr('scrollHeight'));
}
