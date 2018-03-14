var popcornInterval = null,
    burnedInterval = null,
    level_1 = null,
    level_2 = null,
    level_3 = null,
    countdownTimer = null,
    score = null,
    topTen = [];

function openResultData() {
    var results = firebase.database().ref('results/');
    return new Promise(function (resolve, reject) {
        results.on('value', function (data) {
            data.forEach(function (data) {
                var item = data.val();

                topTen.push(item);
            });
            topTen.sort(function (a, b) {
                return b.score - a.score
            });
            topTen = topTen.slice(0, 10);
            return resolve(topTen);
        }, function (error) {
            console.log("Error: " + error.code);
            return reject(error);
        });
    });
}

function writeResultData(score) {
    firebase.database().ref('results/' + score).set({
        score: score
    });
}

function startGame() {
    var $gameCount = $('#gameCount'),
        timeleft = 3;

    $gameCount.text(timeleft);

    var downloadTimer = setInterval(function () {
        timeleft--;
        $gameCount.text(timeleft);

        if (timeleft <= 0) {
            clearInterval(downloadTimer);
            $gameCount.text('START');

            setTimeout(function () {
                $gameCount.remove();
                game();
            }, 1000);
        }
    }, 1000);
}

function stopGame() {
    // funkcja stopująca grę
    fallingPopcorn('stop');
    clearInterval(countdownTimer);
}

function endOfGame() {
    var $playagain = $('.playagain');

    stopGame();
    writeResultData(score);
    resultsUpdate(score);

    $playagain.click(function () {
        location.reload();
    });
//    koniec gry po upłynięciu założonego czasu - pojawienie się ekranu końcowego z wynikiem i listą top 10
}

function resultsUpdate(score) {
    var $yourScore = $('#yourScore'),
        $statics = $('.statics'),
        $topTenList = $('#topTenList'),
        newElement = document.createElement("div");

    openResultData()
        // .then(function (topTen) {
        //     topTen.slice(11)
        // })
        .then(function (topTen) {
            topTen.map(function (value) {
                var positionTemplate = ''
                    + '<li class="result">' + value.score + '</li>';

                newElement.innerHTML = positionTemplate;
                $topTenList.append(positionTemplate);
            })
        });
    $statics.addClass('staticActive');
    $yourScore.text(score);
}

function timer() {
    var $timer = $('#timer'),
        timeleft = 12;

    countdownTimer = setInterval(function () {
        timeleft--;
        $timer.text(timeleft);

        if (timeleft < 0) {
            clearInterval(countdownTimer);

            endOfGame();
        }
    }, 1000);
}

function bucketMove() {
    var $gameArea = $('#gameArea'),
        $player = $('#player'),
        $gameWidth = $gameArea.width();
    // gameHeight = $gameArea.height();

    // $(window).resize(function () {
    //     $gameWidth = $gameArea.width();
    //     $gameHeight = $gameArea.height();
    // });

    $player.css({
        left: $gameWidth / 2 - 50
    });

    $gameArea.mousemove(function (event) {
        var mouseX = event.pageX;
        $player.css({
            left: mouseX - 50
        });
    });
}

function popcornGenerator(fallingTime, numberOfPopcorn) {
    var $popcorn = $();

    for (var i = 0; i < numberOfPopcorn; ++i) {
        var $popcornDiv = $('<div class="popcornDefault"></div>');

        $popcornDiv.css({
            'left': -50 + Math.floor(Math.random() * ($('#gameArea').width() + 50)) + 'px'
        });

        $popcorn = $popcorn.add($popcornDiv);
    }

    $('#gameArea').append($popcorn);

    $popcorn.animate({
        top: $('#gameArea').height() - 60 + 'px'
    }, fallingTime, 'linear', function () {
        $(this).remove();
    });
}

function burnedPopcornGenerator() {
    var burnedPopcorn = $(),
        randomFallingTime = Math.floor(Math.random() * 2000 + 500),
        randomNumberOfPopcorn = Math.floor(Math.random() * 3);

    for (var i = 0; i < randomNumberOfPopcorn; ++i) {
        var $burnedPopcornDiv = $('<div class="popcornBurned"></div>');

        $burnedPopcornDiv.css({
            'left': -50 + Math.floor(Math.random() * ($('#gameArea').width() + 70)) + 'px'
        });

        burnedPopcorn = burnedPopcorn.add($burnedPopcornDiv);
    }

    $('#gameArea').append(burnedPopcorn);

    burnedPopcorn.animate({
        top: $('#gameArea').height() - 40 + 'px'
    }, randomFallingTime, 'linear', function () {
        $(this).remove();
    });
}

function fallingPopcorn(action) {

    function level(fallingTime, numberOfPopcorn, frequency) {
        popcornGenerator(fallingTime, numberOfPopcorn);
        popcornInterval = setInterval(function () {
            popcornGenerator(fallingTime, numberOfPopcorn);
        }, frequency);
    }

    function burned() {
        var randomFrequency = Math.floor(Math.random() * 1000 + 500);

        burnedPopcornGenerator();
        burnedInterval = setInterval(function () {
            burnedPopcornGenerator();
        }, randomFrequency);
    }

    function stopPopcorn() {
        clearInterval(popcornInterval);
        clearTimeout(level_1);
        clearTimeout(level_2);
        clearTimeout(level_3);
    }

    function stopBurned() {
        clearInterval(burnedInterval);
    }

    switch (action) {
        case 'stop':
            stopPopcorn();
            stopBurned();
            break;
        case 'start':
            //=======================
            //FIRST LEVEL

            level_1 = setTimeout(function () {
                level(2000, 1, 2000);
            }, 0);

            //=======================
            //SECOND LEVEL

            level_2 = setTimeout(function () {
                stopPopcorn();
                level(1500, 1, 1000);
            }, 40000);

            //=======================
            //THIRD LEVEL

            level_3 = setTimeout(function () {
                stopPopcorn();
                level(1000, 1, 500);
            }, 80000);

            //=======================
            //BURNED POPCORN

            setTimeout(function () {
                burned();
            }, 1000);
            break;
    }
}

function gameover() {
    // przegrana po utracie wszystkich zębów - plansza gameover
    var $gameover = $('#gameover'),
        $playagain = $('.playagain');

    stopGame();

    $gameover.fadeIn(3000);

    $playagain.click(function () {
        location.reload();
    });

}

function removeTooth() {
    var $tooth = $('.tooth');

    $tooth.each(function () {
        $tooth.last().remove();
    });

    if ($tooth.length === 0) {
        gameover()
    }
}

function updateScore() {
    var $score = $('#score');

    score++;
    $score.text(score);
}

function colisionDetector() {
    var $playerPositionLeftCorner = $('#player').position().left + 5,
        $playerPositionRightCorner = $('#player').position().left + 95,
        $playerPositionTop = $('#player').position().top;

    $('.popcornDefault').each(function () {
        var $popcorn = $(this),
            $popcornPositionCenter = $popcorn.position().left + 25,
            $popcornPositionBottom = $popcorn.position().top + 15;

        // console.log('left: ' + $playerPositionLeftCorner + ' center: ' + $popcornPositionCenter + ' right: ' + $playerPositionRightCorner);

        if ($playerPositionLeftCorner - 70 <= $popcornPositionCenter && $popcornPositionCenter <= $playerPositionRightCorner - 70 && $popcornPositionBottom > $playerPositionTop) {
            updateScore();
            $popcorn.remove();
        }
    });

    $('.popcornBurned').each(function () {
        var $popcornBurned = $(this),
            $burnedPopcornPositionCenter = $popcornBurned.position().left + 15,
            $burnedPopcornPositionBottom = $popcornBurned.position().top;

        // console.log('left: ' + $playerPositionLeftCorner + ' center: ' + $burnedPopcornPositionCenter + ' right: ' + $playerPositionRightCorner);

        if ($playerPositionLeftCorner - 70 <= $burnedPopcornPositionCenter && $burnedPopcornPositionCenter <= $playerPositionRightCorner - 70 && $burnedPopcornPositionBottom > $playerPositionTop) {
            $popcornBurned.remove();
            removeTooth();
        }
    });
}


function game() {
    timer();
    fallingPopcorn('start');
    bucketMove();
    setInterval(colisionDetector, 10);
}

startGame();
