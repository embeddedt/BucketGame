import Typography from '@material-ui/core/Typography';
import Toy from './Toy';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getNumberOfColorOptions() {
    var opts = window.globalGameInformation.colorChoices;
    if(Array.isArray(opts))
        return 1;
    else
        return Object.entries(opts).length;
}
function retrieveColorOptionForIndex(index) {
    var opts = window.globalGameInformation.colorChoices;
    var ret;
    if(Array.isArray(opts))
        ret = opts;
    else
        ret = Object.entries(opts)[index];
    if(ret == undefined)
        ret = [ "", ""];
    console.log(ret);
    return ret;
}
function splitImage(imgVal, wantedColor) {
    var obj = null;
    if(typeof imgVal == 'string')
        obj = { src: imgVal, color: wantedColor };
    
    else if(typeof imgVal.image != 'undefined' && typeof imgVal.color != 'undefined')
        obj = { src: imgVal.image, color: imgVal.color };
    else {
        if(wantedColor == undefined)
            wantedColor = Object.keys(imgVal)[0];
    
        if(typeof imgVal[wantedColor] != 'undefined') {
            const actualImg = imgVal[wantedColor];
            obj = { src: actualImg };
        }
    }
    
    if(obj == null) {
        console.error(imgVal);
        console.error("wanted color: " + wantedColor);
        throw new Error("Invalid invariant: image is not one of the expected types");
    }
    if(typeof obj.color != 'undefined' && (!obj.color.startsWith("#") || (typeof imgVal == 'object' && imgVal.noRecolor)))
        obj.color = undefined;
    
    return obj;
}
function Item(props) {
    if(!props.doDisplay)
        return <div className="toy toy-hidden"></div>;
    /* Figure out what type of item this is */
    const item = props.item;
    let itemComponent, imgInfo = null;
    if(item.type == 'image') {
        imgInfo = splitImage(item.value);
        itemComponent = <Toy {...imgInfo}/>;
    } else if(item.type == 'text') {
        itemComponent = <span style={{color: item.value.color, fontSize: '2rem'}}>{item.value.string}</span>;
    }
    return <ButtonBase style={{
        transform: `translate(${props.xOffset}%, ${props.yOffset}%)`
    }} disableRipple={true} disabled={props.disabled} className="toy toy-button" onClick={props.onClick}>{itemComponent}</ButtonBase>;
}
const Bucket = (props) => <div className="bucket"><img {...splitImage(window.globalGameInformation.bucketImg[props.color])} {...props} /><span className="bucket-number">{props.size}</span></div>;

/* Game state machine */
const AppStates = {
    INFORMATION: 0,
    DO_GAME: 1,
    FINISHED_GAME: 2
};
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function Background(props) {
    return<div className="game-background" style={{
        backgroundColor: window.globalGameInformation.backgroundColor,
        backgroundImage: `url(${window.globalGameInformation.background})`,
        opacity: window.globalGameInformation.backgroundOpacity
    }}></div>;
}
class ClassApp extends React.Component {
    constructor(props) {
        super(props);
        /* Calculate the random item offsets */
        var itemXOffsets = [];
        var itemYOffsets = [];
        const maxOffset = 15;
        for(var i = 0; i < window.globalGameInformation.items.length; i++) {
            itemXOffsets[i] = getRandomArbitrary(-maxOffset, maxOffset);
            itemYOffsets[i] = getRandomArbitrary(-maxOffset, maxOffset);
        }
        this.state = { itemXOffsets, itemYOffsets, transitioning: false, processing: false, stateMachine: AppStates.INFORMATION, finishedItemIndexes: [], incorrectSound: new Audio("incorrect.mp3"), correctSound: new Audio("correct.mp3") };
    }
    checkIfReachedEndOfColor(cb) {
        var numOfTotalChoicesForCurrentColor = 0;
        window.globalGameInformation.items.forEach((item, i) => {
            const reqColor = retrieveColorOptionForIndex(this.props.color)[0];
            if(item.value.color != undefined && item.value.color == reqColor)
                numOfTotalChoicesForCurrentColor++;
        });
        if(this.state.finishedItemIndexes.length == numOfTotalChoicesForCurrentColor) {
            this.setState({ transitioning: true }, () => setTimeout(() => this.setState({ transitioning: false, stateMachine: this.state.stateMachine+1, finishedItemIndexes: [] }, cb), 2000));
        } else {
            if(typeof cb == 'function')
                cb();
        }
    }
    /** @param {HTMLAudioElement} sound */
    replaySound(sound, cb) {
        function handleOnSoundEnd() {
            sound.removeEventListener("ended", handleOnSoundEnd);
            if(typeof cb == 'function')
                cb();
        }
        sound.pause();
        sound.currentTime=0;
        sound.removeEventListener("ended", handleOnSoundEnd);
        sound.addEventListener("ended", handleOnSoundEnd);
        sound.play();
    }
    /**
     * http://stackoverflow.com/a/10997390/11236
     */
    static updateURLParameter(url, param, paramVal){
        var newAdditionalURL = "";
        var tempArray = url.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (var i=0; i<tempArray.length; i++){
                if(tempArray[i].split('=')[0] != param){
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }

        var rows_txt = temp + "" + param + "=" + paramVal;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    }
    render() {
        const handleClose = () => {
            const audio = new Audio("background.mp3");
            audio.loop = true;
            audio.volume = 0.4;
            audio.play();
            this.setState({ stateMachine: this.state.stateMachine+1})
        };
        if(this.props.color == null) {
            return <Dialog open={true}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <DialogContentText gutterBottom>You must specify a color as a query string. The value should be a valid index into the `colorChoices` array.</DialogContentText>
                    <DialogContentText gutterBottom>Valid color links:</DialogContentText>
                    <DialogContentText>
                        <ul>
                            {(function(){
                                var exampleArray = [];
                                const vals = Object.values(window.globalGameInformation.colorChoices);
                                for(var i = 0; i < Object.keys(window.globalGameInformation.colorChoices).length; i++) {
                                    const url = ClassApp.updateURLParameter(window.location.href, "color", i);
                                    exampleArray.push(<li><span><a href={url}>{url}</a> (human name "{vals[i]}")</span></li>);
                                }
                                return exampleArray;
                            })()}
                        </ul>
                    </DialogContentText>
                </DialogContent>
            </Dialog>;
        }
        else if(this.state.stateMachine == AppStates.DO_GAME)
            return <div className="bucket-main">
                <Background/>
                <Typography variant="h4" gutterBottom align='center'>
                    {this.state.transitioning ? 'Nice work!' : `Click on the ${retrieveColorOptionForIndex(this.props.color)[1]}${window.globalGameInformation.itemsPlural}.`}
                </Typography>
                <div className="bucket-main" style={{ flexGrow: 1 }}>
                    <Bucket color={retrieveColorOptionForIndex(this.props.color)[0]} size={this.state.finishedItemIndexes.length} />
                    <div className="bucket-toys">
                        {(() => {
                            var toysArray = [];
                            window.globalGameInformation.items.forEach((item, i) => {
                                toysArray.push(
                                    <Item xOffset={this.state.itemXOffsets[i]} yOffset={this.state.itemYOffsets[i]} disabled={this.state.processing} doDisplay={this.state.finishedItemIndexes.indexOf(i) == -1} item={item} key={i} onClick={() => {
                                        this.setState({ processing: true }, () => {
                                            const reqColor = retrieveColorOptionForIndex(this.props.color)[0];
                                            if(item.value.color != undefined && item.value.color != reqColor) {
                                                this.replaySound(this.state.incorrectSound);
                                                this.setState({ processing: false });
                                                return;
                                            } else {
                                                const newArray = this.state.finishedItemIndexes.slice();
                                                console.log(i);
                                                newArray.push(i);
                                                this.setState({ finishedItemIndexes: newArray }, () => {
                                                    this.replaySound(this.state.correctSound);
                                                    this.checkIfReachedEndOfColor(() => {
                                                        this.setState({ processing: false });
                                                    });
                                                });
                                            }
                                        });
                                    }}/>
                                );
                            });
                            return toysArray;
                        })()}
                    </div>
                </div>
            </div>;
        else if(this.state.stateMachine == AppStates.INFORMATION)
            return <Dialog BackdropComponent={Background} fullScreen={this.props.fullScreen} open={true} onClose={handleClose}>
                <DialogTitle>{"Welcome to " + window.globalGameInformation.title + "!"}</DialogTitle>
                <DialogContent>
                    <DialogContentText variant="body1" gutterBottom>{window.globalGameInformation.directions}</DialogContentText>
                    <DialogContentText variant="body2">Sounds from <a href="https://freesound.org">Freesound</a>.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Start</Button>
                </DialogActions>
            </Dialog>;
        else if(this.state.stateMachine == AppStates.FINISHED_GAME)
            return <Dialog BackdropComponent={Background} open={true}>
                <DialogTitle>Great work!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You've finished the game!
                    </DialogContentText>
                </DialogContent>
            </Dialog>;
        else {
            console.error("Unknown state");
            return null;
        }
    }
}

function App(props) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    return <ClassApp fullScreen={fullScreen} {...props}/>;
}

window.onload = function () {
    document.title = window.globalGameInformation.title;
    window.globalGameInformation.items = shuffle(shuffle(window.globalGameInformation.items));
    var qs = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    var color = parseInt(qs["color"]);
    if(isNaN(color))
        color = null;
    else if(color < 0 || color >= Object.keys(window.globalGameInformation.colorChoices).length)
        color = null;
    ReactDOM.render(<App color={color}/>, document.querySelector("#game-container"));
};