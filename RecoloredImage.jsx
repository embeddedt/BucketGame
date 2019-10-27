import ResizeObserver from '@juggle/resize-observer';
import CircularProgress from '@material-ui/core/CircularProgress';

function fit(contains) {
    return (parentWidth, parentHeight, childWidth, childHeight, scale = 1, offsetX = 0.5, offsetY = 0.5) => {
      const childRatio = childWidth / childHeight
      const parentRatio = parentWidth / parentHeight
      let width = parentWidth * scale
      let height = parentHeight * scale
  
      if (contains ? (childRatio > parentRatio) : (childRatio < parentRatio)) {
        height = width / childRatio
      } else {
        width = height * childRatio
      }
  
      return {
        width,
        height,
        offsetX: (parentWidth - width) * offsetX,
        offsetY: (parentHeight - height) * offsetY
      }
    }
}
/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {CanvasImageSource} img
 * @param {number} w
 * @param {number} h
 */
function drawImageFitting(ctx, img, w, h, cb) {
    const {
        offsetX, 
        offsetY, 
        width, 
        height
    } = fit(true)(ctx.canvas.width, ctx.canvas.height, w, h);
    function tryCtxDrawImage(ctx, img, offsetX, offsetY, width, height, cb, i = 0) {
        if(i == 5) {
            throw new Error("Giving up, image is not servicable");
        } else
            console.log("Try for " + i + "th time");
        function doRetry(e){
            console.error("IE giving us grief here");
            console.error(e);
            setTimeout(() => tryCtxDrawImage(ctx, img, offsetX, offsetY, width, height, cb, i+1), 0);
        }
        try {
            /*
            if(!img.complete)
                throw new Error("Image not ready");
            */
            ctx.drawImage(img, offsetX, offsetY, width, height);
            try {
                cb();
                return;
            } catch(e) {console.error(e);}
        } catch(e) {
            doRetry(e);
        }
    }
    setTimeout(() => tryCtxDrawImage(ctx, img, offsetX, offsetY, width, height, cb, 0), 20);
}
class RecoloredImage extends React.Component {
    constructor(props) {
        super(props);
        this.overlayRef = React.createRef();
        this.canvasRef = React.createRef();
        this.dimRef = React.createRef();
        this.canvasResizeTimeout = null;
        this.allowCanvasUpdates = true;
        this.state = { imgSrc: null };
        this.resizeObserver = null;
    }
    render() {
        const { src, color, innerRef, ...rest } = this.props;
        var ret;
        if(this.state.imgSrc != null)
            ret = <img ref={(ref) => {
                if(innerRef != undefined)
                    innerRef.current = ref;
                this.canvasRef.current = ref;
                this.dimRef.current = ref;
            }} src={this.state.imgSrc} {...rest}/>;
        else
            ret = <CircularProgress ref={this.dimRef}/>;
        return ret;
    }
    getNewDimensions() {
        const canvas = this.dimRef.current;
        const style = window.getComputedStyle(canvas);
        return { width: parseFloat(style.width), height: parseFloat(style.height) };
    }
    updateCanvas() {
        if(!this.allowCanvasUpdates)
            return;
        this.allowCanvasUpdates = false;
        let img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.addEventListener("load", () => {
            /** @type {HTMLCanvasElement} */
            let canvas = document.createElement("canvas");
            const dim = this.getNewDimensions();
            canvas.width = dim.width;
            canvas.height = dim.height;
            let ctx = canvas.getContext("2d");
            document.body.appendChild(img);
            const w = img.offsetWidth;
            const h = img.offsetHeight;
            img.parentNode.removeChild(img);
            ctx.globalCompositeOperation = "source-over";
            const finalizeCtx = (ctx) => {
                this.allowCanvasUpdates = true;
                const src = ctx.canvas.toDataURL();
                this.setState({ imgSrc: src });
            }
            console.log(this.props.color + " " + this.props.src);
            drawImageFitting(ctx, img, w, h, () => {
                
                if(typeof this.props.color != 'undefined') {
                    ctx.globalCompositeOperation = "source-atop";
                    ctx.fillStyle = this.props.color;
                    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.globalCompositeOperation = "source-over";
                    /* Switch to actual canvas */
                    const offscreen = canvas;
                    canvas = document.createElement("canvas");
                    canvas.width = offscreen.width;
                    canvas.height = offscreen.height;
                    ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    drawImageFitting(ctx, img, w, h, () => {
                        ctx.globalCompositeOperation = "color";
                        ctx.drawImage(offscreen, 0, 0, ctx.canvas.width, ctx.canvas.height);
                        ctx.globalCompositeOperation = "source-over";
                        finalizeCtx(ctx);
                    });
                } else
                    finalizeCtx(ctx);
            });
        });
        img.src = this.props.src;
    }
    clearCanvasTimeout() {
        if(this.canvasResizeTimeout != null) {
            clearTimeout(this.canvasResizeTimeout);
            this.canvasResizeTimeout = null;
        }
    }
    enqueueCanvasRefresh() {
        this.clearCanvasTimeout();
        this.canvasResizeTimeout = setTimeout(() => {
            if(this.allowCanvasUpdates)
                this.updateCanvas();
            else {
                this.enqueueCanvasRefresh();
            }
        }, 100);
    }
    setupResize() {
        if(this.resizeObserver != null)
            return;
        if(this.state.imgSrc == null)
            return;
        this.resizeObserver = new ResizeObserver((entries, observer) => {
            this.enqueueCanvasRefresh();
        });
        this.resizeObserver.observe(this.canvasRef.current);
    }
    componentDidMount() {
        this.updateCanvas();
        this.setupResize();
    }
    componentWillUnmount() {
        this.clearCanvasTimeout();
        this.resizeObserver.disconnect();
    }
    componentDidUpdate(prevProps) {
        this.setupResize();
        if(prevProps.src != this.props.src || prevProps.color != this.props.color) {
            this.updateCanvas();
        }
    }
}
export default React.forwardRef((props, ref) => <RecoloredImage 
innerRef={ref} {...props}
/>);